from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.repositories.user_repository import UserRepository


def _get_user(db: Session, user_id: int | None) -> User | None:
    if user_id is None:
        return None
    return UserRepository(db).get_by_id(user_id)


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    x_user_id: Annotated[int | None, Header(alias="X-User-Id")] = None,
) -> User:
    if x_user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Provide X-User-Id header.",
        )
    user = _get_user(db, x_user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def get_optional_user(
    db: Annotated[Session, Depends(get_db)],
    x_user_id: Annotated[int | None, Header(alias="X-User-Id")] = None,
) -> User | None:
    return _get_user(db, x_user_id)
