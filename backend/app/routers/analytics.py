from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_merchant
from app.database import get_db

router = APIRouter()


@router.get("")
async def get_analytics(
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    """
    Return analytics data for the authenticated merchant.Order counts by status, daily order counts and revenue for the last 7 days, and top 5 stores by order count.
    """
    mid = merchant["id"]

    # 1. Order counts by status 
    status_rows = await db.fetch(
        """
        SELECT status, COUNT(*) AS count
        FROM orders
        WHERE merchant_id = $1
        GROUP BY status
        """,
        mid,
    )
    order_counts = {row["status"]: row["count"] for row in status_rows}

    #2. Last 7 days: date, count, revenue 
    daily_rows = await db.fetch(
        """
        SELECT
            DATE(created_at)          AS date,
            COUNT(*)                  AS count,
            COALESCE(SUM(amount), 0)  AS revenue
        FROM orders
        WHERE merchant_id = $1
          AND created_at >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
        """,
        mid,
    )
    daily_data = [
        {
            "date":    str(row["date"]),
            "count":   row["count"],
            "revenue": float(row["revenue"]),
        }
        for row in daily_rows
    ]

    # 3. Top 5 stores by order count
    store_rows = await db.fetch(
        """
        SELECT
            s.name,
            s.branch,
            COUNT(o.id)               AS order_count,
            COALESCE(SUM(o.amount), 0) AS revenue
        FROM stores s
        LEFT JOIN orders o ON o.store_id = s.id
        WHERE s.merchant_id = $1
        GROUP BY s.id, s.name, s.branch
        ORDER BY order_count DESC
        LIMIT 5
        """,
        mid,
    )
    top_stores = [
        {
            "name":        row["name"],
            "branch":      row["branch"],
            "order_count": row["order_count"],
            "revenue":     float(row["revenue"]),
        }
        for row in store_rows
    ]

    return {
        "order_counts": order_counts,
        "daily_data":   daily_data,
        "top_stores":   top_stores,
    }
