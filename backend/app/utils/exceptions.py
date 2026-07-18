from datetime import date

from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST, code: str | None = None):
        super().__init__(status_code=status_code, detail=detail)
        self.code = code


class NotFoundError(AppException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(detail=f"{resource} not found", status_code=status.HTTP_404_NOT_FOUND, code="NOT_FOUND")


class ConflictError(AppException):
    def __init__(self, detail: str):
        super().__init__(detail=detail, status_code=status.HTTP_409_CONFLICT, code="CONFLICT")


class ForbiddenError(AppException):
    def __init__(self, detail: str = "You do not have permission to perform this action"):
        super().__init__(detail=detail, status_code=status.HTTP_403_FORBIDDEN, code="FORBIDDEN")


def validate_date_range(check_in: date, check_out: date) -> int:
    if check_out <= check_in:
        raise AppException("check_out must be after check_in")
    nights = (check_out - check_in).days
    if nights < 1:
        raise AppException("Booking must be at least 1 night")
    return nights
