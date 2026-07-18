from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import verify_supabase_jwt
from app.database import get_db
from app.models import User, UserRole
from app.repositories.user_repository import UserRepository

# Use HTTPBearer for extracting the token from Authorization header
security = HTTPBearer(auto_error=False)


def _get_user_from_token(db: Session, creds: HTTPAuthorizationCredentials | None) -> User | None:
    if not creds or not creds.credentials:
        print("[DEBUG] deps.py: No credentials provided")
        return None

    # Verify the Supabase JWT
    payload = verify_supabase_jwt(creds.credentials)
    
    supabase_uid = payload.get("sub")
    email = payload.get("email")
    print(f"[DEBUG] deps.py: Token verified, sub={supabase_uid}, email={email}")
    
    if not supabase_uid or not email:
        print("[DEBUG] deps.py: Missing sub or email in payload")
        raise HTTPException(status_code=401, detail="Invalid token payload: missing sub or email")

    repo = UserRepository(db)
    
    # 1. Try to find by supabase_uid
    user = repo.get_by_supabase_uid(supabase_uid)
    if user:
        print(f"[DEBUG] deps.py: Found user by supabase_uid: {user.id}")
        return user
        
    # 2. If not found, try to find by email (to link existing legacy mock accounts)
    user = repo.get_by_email(email)
    if user:
        print(f"[DEBUG] deps.py: Found user by email: {user.id}. Linking supabase_uid.")
        user.supabase_uid = supabase_uid
        db.commit()
        return user
        
    # 3. Auto-provision a new user
    print("[DEBUG] deps.py: User not found. Auto-provisioning...")
    new_user = User(
        supabase_uid=supabase_uid,
        email=email,
        name=payload.get("user_metadata", {}).get("full_name") or email.split("@")[0],
        avatar_url=payload.get("user_metadata", {}).get("avatar_url"),
        role=UserRole.GUEST,
    )
    created = repo.create(new_user)
    print(f"[DEBUG] deps.py: Auto-provisioned new user: {created.id}")
    return created


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> User:
    if not creds:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Provide Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user = _get_user_from_token(db, creds)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    return user


def get_optional_user(
    db: Annotated[Session, Depends(get_db)],
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> User | None:
    try:
        return _get_user_from_token(db, creds)
    except HTTPException:
        return None
