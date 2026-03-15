from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_merchant
from app.database import get_db

router = APIRouter()


@router.get("")
async def list_stores(
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    """List all stores for the logged-in merchant."""
    rows = await db.fetch(
        "SELECT * FROM stores WHERE merchant_id = $1 ORDER BY created_at",
        merchant["id"],
    )
    return [dict(r) for r in rows]


@router.get("/{store_id}")
async def get_store(
    store_id: str,
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    row = await db.fetchrow(
        "SELECT * FROM stores WHERE id = $1 AND merchant_id = $2",
        store_id,
        merchant["id"],
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Store not found")
    return dict(row)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_store(
    data: dict,
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    """Create a new store / pickup point."""
    row = await db.fetchrow(
        """
        INSERT INTO stores (merchant_id, name, branch, address, city, zone, phone, email)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        """,
        merchant["id"],
        data["name"],
        data.get("branch"),
        data.get("address"),
        data.get("city"),
        data.get("zone"),
        data.get("phone"),
        data.get("email"),
    )
    return dict(row)


@router.put("/{store_id}")
async def update_store(
    store_id: str,
    data: dict,
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    """Update a store."""
    existing = await db.fetchrow(
        "SELECT id FROM stores WHERE id = $1 AND merchant_id = $2",
        store_id,
        merchant["id"],
    )
    if existing is None:
        raise HTTPException(status_code=404, detail="Store not found")

    row = await db.fetchrow(
        """
        UPDATE stores
        SET name = $1, branch = $2, address = $3, city = $4,
            zone = $5, phone = $6, email = $7, updated_at = NOW()
        WHERE id = $8
        RETURNING *
        """,
        data.get("name"),
        data.get("branch"),
        data.get("address"),
        data.get("city"),
        data.get("zone"),
        data.get("phone"),
        data.get("email"),
        store_id,
    )
    return dict(row)


@router.delete("/{store_id}")
async def deactivate_store(
    store_id: str,
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    """Soft-delete a store by setting is_active = false."""
    row = await db.fetchrow(
        "SELECT id FROM stores WHERE id = $1 AND merchant_id = $2",
        store_id,
        merchant["id"],
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Store not found")

    await db.execute(
        "UPDATE stores SET is_active = false, updated_at = NOW() WHERE id = $1",
        store_id,
    )
    return {"message": "Store deactivated"}
