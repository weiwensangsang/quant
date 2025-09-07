from fastapi import APIRouter
from fastapi import status

from app.core.config import settings
from app.schemas.base import BaseResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=BaseResponse,
    status_code=status.HTTP_200_OK,
)
async def health_check():
    return BaseResponse(
        success=True,
        message="Service is healthy",
        data={
            "app_name": settings.app_name,
            "debug": settings.debug,
        },
    )
