from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_merchant
from app.database import get_db
from app.schemas.auth import (
    LoginRequest,
    MerchantResponse,
    RegisterRequest,
    TokenResponse,
)
from app.services.auth_service import login_merchant, register_merchant

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest, db=Depends(get_db)):
    return await register_merchant(data, db)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db=Depends(get_db)):
    return await login_merchant(data.email, data.password, db)


@router.get("/me", response_model=MerchantResponse)
async def me(merchant: dict = Depends(get_current_merchant)):
    return MerchantResponse(
        id=str(merchant["id"]),
        email=merchant["email"],
        name=merchant["name"],
        phone=merchant.get("phone"),
        business_name=merchant.get("business_name"),
    )
