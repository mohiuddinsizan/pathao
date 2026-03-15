from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_merchant
from app.database import get_db

router = APIRouter()


@router.get("")
async def list_payments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    """List payment records for the logged-in merchant (paginated)."""
    offset = (page - 1) * limit

    # Fetch paginated rows
    rows = await db.fetch(
        """
        SELECT order_id, recipient_name, amount, payment_method,
               cod_amount, status, created_at
        FROM orders
        WHERE merchant_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
        """,
        merchant["id"],
        limit,
        offset,
    )

    # Fetch totals
    summary = await db.fetchrow(
        """
        SELECT COUNT(*) AS total, COALESCE(SUM(amount), 0) AS total_revenue
        FROM orders
        WHERE merchant_id = $1
        """,
        merchant["id"],
    )

    return {
        "payments": [dict(r) for r in rows],
        "total": summary["total"],
        "total_revenue": float(summary["total_revenue"]),
        "page": page,
        "limit": limit,
    }
