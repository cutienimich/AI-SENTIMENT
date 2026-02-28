from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field, EmailStr

from services.auth_service import register_user, verify_user, login_user

router = APIRouter()


class RegisterPayload(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)


class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)


@router.post("/auth/register")
async def register(payload: RegisterPayload):
    try:
        result = register_user(payload.email, payload.password)

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Registration failed")


@router.get("/auth/verify")
async def verify(token: str = Query(..., min_length=1)):
    try:
        result = verify_user(token)

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Verification failed")


@router.post("/auth/login")
async def login(payload: LoginPayload):
    try:
        result = login_user(payload.email, payload.password)

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Login failed")