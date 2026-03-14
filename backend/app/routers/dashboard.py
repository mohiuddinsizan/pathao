from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_merchant
from app.database import get_db

router = APIRouter()


@router.get("/stats")
async def dashboard_stats(
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    """Return aggregate stats for the merchant dashboard."""
    mid = merchant["id"]

    total = await db.fetchval("SELECT COUNT(*) FROM orders WHERE merchant_id = $1", mid)
    pending = await db.fetchval(
        "SELECT COUNT(*) FROM orders WHERE merchant_id = $1 AND status = 'pending'", mid
    )
    in_transit = await db.fetchval(
        "SELECT COUNT(*) FROM orders WHERE merchant_id = $1 AND status = 'in_transit'", mid
    )
    delivered = await db.fetchval(
        "SELECT COUNT(*) FROM orders WHERE merchant_id = $1 AND status = 'delivered'", mid
    )
    cancelled = await db.fetchval(
        "SELECT COUNT(*) FROM orders WHERE merchant_id = $1 AND status = 'cancelled'", mid
    )
    revenue = await db.fetchval(
        "SELECT COALESCE(SUM(amount), 0) FROM orders WHERE merchant_id = $1 AND status = 'delivered'",
        mid,
    )
    stores_count = await db.fetchval(
        "SELECT COUNT(*) FROM stores WHERE merchant_id = $1", mid
    )

    return {
        "total_orders": total,
        "pending": pending,
        "in_transit": in_transit,
        "delivered": delivered,
        "cancelled": cancelled,
        "total_revenue": float(revenue),
        "stores": stores_count,
    }


@router.get("/recent-orders")
async def recent_orders(
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    """Return the 10 most recent orders for the dashboard."""
    rows = await db.fetch(
        """
        SELECT o.order_id, o.status, o.recipient_name, o.destination_area,
               o.amount, o.payment_method, o.created_at,
               s.name AS store_name, d.name AS driver_name
        FROM orders o
        LEFT JOIN stores s  ON o.store_id  = s.id
        LEFT JOIN drivers d ON o.driver_id = d.id
        WHERE o.merchant_id = $1
        ORDER BY o.created_at DESC
        LIMIT 10
        """,
        merchant["id"],
    )
    return [dict(r) for r in rows]
