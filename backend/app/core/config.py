from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Airbnb Clone API"
    APP_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    DATABASE_URL: str
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    DEFAULT_PAGE_SIZE: int = 12
    MAX_PAGE_SIZE: int = 50

    CLOUDINARY_CLOUD_NAME: str | None = None
    CLOUDINARY_API_KEY: str | None = None
    CLOUDINARY_API_SECRET: str | None = None

    SUPABASE_URL: str | None = None
    SUPABASE_JWT_SECRET: str | None = None

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def sqlalchemy_database_url(self) -> str:
        import os
        # Prefer POSTGRES_PRISMA_URL which is injected by Supabase Vercel integration and uses the IPv4 pooler
        url_to_use = os.environ.get("POSTGRES_PRISMA_URL") or self.DATABASE_URL
        
        if url_to_use.startswith("postgres://"):
            url_to_use = url_to_use.replace("postgres://", "postgresql://", 1)
            
        # Strip Prisma-specific query parameters like ?pgbouncer=true which SQLAlchemy doesn't understand
        if "?" in url_to_use:
            url_to_use = url_to_use.split("?")[0]
            
        return url_to_use


settings = Settings()
