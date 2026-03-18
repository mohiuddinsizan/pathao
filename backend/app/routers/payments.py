import math

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_merchant
from app.database import get_db

router = APIRouter()


@router.get("")
async def list_payments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    order_status: str | None = None,
    store_id: str | None = None,
    payment_method: str | None = None,
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    """List payment records for the logged-in merchant (paginated)."""
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
    if payment_method:
        conditions.append(f"o.payment_method = ${idx}")
        params.append(payment_method)
        idx += 1

    where = " AND ".join(conditions)

    # Fetch paginated rows
    rows = await db.fetch(
        f"""
        SELECT o.order_id, o.recipient_name, o.recipient_phone, o.amount,
               o.payment_method, o.cod_amount, o.status, o.created_at,
               s.name AS store_name, s.branch AS store_branch
        FROM orders o
        LEFT JOIN stores s ON o.store_id = s.id
        WHERE {where}
        ORDER BY o.created_at DESC
        LIMIT ${idx} OFFSET ${idx + 1}
        """,
        *params,
        limit,
        offset,
    )

    # Fetch totals
    summary = await db.fetchrow(
        f"""
        SELECT COUNT(*) AS total, COALESCE(SUM(o.amount), 0) AS total_revenue
        FROM orders o
        WHERE {where}
        """,
        *params,
    )

    count = summary["total"]
    pages = math.ceil(count / limit) if count > 0 else 0

    return {
        "payments": [dict(r) for r in rows],
        "total": count,
        "total_revenue": float(summary["total_revenue"]),
        "page": page,
        "limit": limit,
        "pages": pages,
    }
