from asyncpg import Connection, UniqueViolationError
from fastapi import HTTPException, status

from app.auth.password import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.schemas.auth import RegisterRequest


async def register_merchant(data: RegisterRequest, db: Connection) -> dict:
    hashed = hash_password(data.password)
    try:
        row = await db.fetchrow(
            """
            INSERT INTO merchants (email, password_hash, name, phone, business_name)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, name, phone, business_name
            """,
            data.email,
            hashed,
            data.name,
            data.phone,
            data.business_name,
        )
    except UniqueViolationError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    merchant = dict(row)
    token = create_access_token(str(merchant["id"]))
    return {"access_token": token, "token_type": "bearer"}


async def login_merchant(email: str, password: str, db: Connection) -> dict:
    row = await db.fetchrow(
        "SELECT id, password_hash FROM merchants WHERE email = $1",
        email,
    )
    if row is None or not verify_password(password, row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(str(row["id"]))
    return {"access_token": token, "token_type": "bearer"}
