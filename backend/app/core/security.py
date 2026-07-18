import jwt
from jwt import PyJWKClient

from app.core.config import settings
from app.utils.exceptions import AppException

# Cache the JWK Client if URL is provided
jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json" if settings.SUPABASE_URL else None
jwks_client = PyJWKClient(jwks_url) if jwks_url else None


def verify_supabase_jwt(token: str) -> dict:
    """
    Verify a Supabase JWT.
    Supports both RS256 (JWKS) and HS256 (JWT Secret).
    """
    if not token:
        print("[DEBUG] No token provided")
        raise AppException(status_code=401, detail="No authentication token provided")

    try:
        # Get the unverified header to check the algorithm
        header = jwt.get_unverified_header(token)
        alg = header.get("alg")
        print(f"[DEBUG] JWT Header: {header}")
        print(f"[DEBUG] Extracted alg: {alg}")

        if alg != "HS256" and jwks_client:
            # Use JWKS verification (supports RS256, ES256, etc.)
            print(f"[DEBUG] Using JWKS client with alg={alg}")
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            print(f"[DEBUG] Fetched signing key: {signing_key.key_id}")
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=[alg],
                audience="authenticated",
                options={"verify_aud": False},  # Sometimes aud is not exactly "authenticated"
            )
            print(f"[DEBUG] Successfully decoded payload via JWKS: {payload.get('sub')} / {payload.get('email')}")
            return payload
        elif alg == "HS256" and settings.SUPABASE_JWT_SECRET:
            # Use symmetric secret verification
            print("[DEBUG] Using HS256 secret verification")
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
                options={"verify_aud": False},
            )
            print(f"[DEBUG] Successfully decoded payload via HS256: {payload.get('sub')} / {payload.get('email')}")
            return payload
        else:
            print(f"[DEBUG] Unsupported algorithm '{alg}' or missing credentials")
            raise AppException(status_code=401, detail=f"Unsupported algorithm '{alg}' or missing Supabase credentials")

    except jwt.ExpiredSignatureError:
        print("[DEBUG] Token expired")
        raise AppException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError as e:
        print(f"[DEBUG] Invalid token: {e}")
        raise AppException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        print(f"[DEBUG] Authentication failed: {e}")
        raise AppException(status_code=401, detail=f"Authentication failed: {str(e)}")
