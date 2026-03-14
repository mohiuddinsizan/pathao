from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth.dependencies import get_current_merchant
from app.database import get_db

router = APIRouter()


@router.get("")
async def list_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    order_status: str | None = None,
    store_id: str | None = None,
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    """List orders for the logged-in merchant with pagination & filters."""
    offset = (page - 1) * limit
    conditions = ["o.merchant_id = $1"]
    params: list = [merchant["id"]]
    idx = 2

    if order_status:
        conditions.append(f"o.status = ${idx}")
        params.append(order_status)
        idx += 1
    if store_id:
        conditions.append(f"o.store_id = ${idx}")
        params.append(store_id)
        idx += 1

    where = " AND ".join(conditions)

    count = await db.fetchval(f"SELECT COUNT(*) FROM orders o WHERE {where}", *params)
    rows = await db.fetch(
        f"""
        SELECT o.*, d.name AS driver_name, s.name AS store_name, s.branch AS store_branch
        FROM orders o
        LEFT JOIN drivers d ON o.driver_id = d.id
        LEFT JOIN stores s  ON o.store_id  = s.id
        WHERE {where}
        ORDER BY o.created_at DESC
        LIMIT ${idx} OFFSET ${idx + 1}
        """,
        *params,
        limit,
        offset,
    )

    return {
        "orders": [dict(r) for r in rows],
        "total": count,
        "page": page,
        "limit": limit,
    }


@router.get("/{order_id}")
async def get_order(
    order_id: str,
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    """Get a single order by its PTH-XXXXXX ID."""
    row = await db.fetchrow(
        """
        SELECT o.*, d.name AS driver_name, d.phone AS driver_phone,
               s.name AS store_name, s.branch AS store_branch
        FROM orders o
        LEFT JOIN drivers d ON o.driver_id = d.id
        LEFT JOIN stores s  ON o.store_id  = s.id
        WHERE o.order_id = $1 AND o.merchant_id = $2
        """,
        order_id,
        merchant["id"],
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Order not found")

    # Include status history
    history = await db.fetch(
        "SELECT status, changed_at, note FROM order_status_history WHERE order_id = $1 ORDER BY changed_at",
        row["id"],
    )
    result = dict(row)
    result["status_history"] = [dict(h) for h in history]
    return result


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_order(
    data: dict,
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    """Create a new parcel order."""
    seq = await db.fetchval("SELECT nextval('order_id_seq')")
    oid = f"PTH-{seq}"

    row = await db.fetchrow(
        """
        INSERT INTO orders (
            order_id, merchant_id, store_id, recipient_name, recipient_phone,
            recipient_address, pickup_address, destination_area, parcel_type,
            item_description, item_weight, amount, payment_method, cod_amount
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        RETURNING *
        """,
        oid,
        merchant["id"],
        data.get("store_id"),
        data["recipient_name"],
        data["recipient_phone"],
        data["recipient_address"],
        data.get("pickup_address"),
        data.get("destination_area"),
        data.get("parcel_type", "small_box"),
        data.get("item_description"),
        data.get("item_weight", "0-1kg"),
        data.get("amount", 0),
        data.get("payment_method", "cod"),
        data.get("cod_amount", 0),
    )

    # Record initial status
    await db.execute(
        "INSERT INTO order_status_history (order_id, status, note) VALUES ($1, 'pending', 'Order placed')",
        row["id"],
    )
    return dict(row)
