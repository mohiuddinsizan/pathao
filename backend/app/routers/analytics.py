from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_merchant
from app.database import get_db

router = APIRouter()


@router.get("")
async def get_analytics(
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    store_id: Optional[str] = Query(None),
):
    mid = merchant["id"]

    # Build optional date filter clause
    date_clause = ""
    params: list = [mid]
    idx = 2
    if date_from:
        date_clause += f" AND created_at >= ${idx}::date"
        params.append(date.fromisoformat(date_from))
        idx += 1
    if date_to:
        date_clause += f" AND created_at < (${idx}::date + INTERVAL '1 day')"
        params.append(date.fromisoformat(date_to))
        idx += 1

    store_clause = ""
    if store_id:
        store_clause = f" AND store_id = ${idx}"
        params.append(store_id)
        idx += 1

    # 1. Summary KPIs
    summary_row = await db.fetchrow(
        f"""
        SELECT
            COUNT(*)                                           AS total_orders,
            COALESCE(SUM(amount), 0)                           AS total_revenue,
            COALESCE(AVG(amount), 0)                           AS avg_order_value,
            COUNT(*) FILTER (WHERE status = 'delivered')       AS delivered_count,
            COALESCE(SUM(cod_amount) FILTER (WHERE status = 'delivered'), 0) AS total_cod_collected,
            COALESCE(SUM(amount) FILTER (WHERE status = 'delivered'), 0)     AS delivered_revenue
        FROM orders
        WHERE merchant_id = $1{date_clause}{store_clause}
        """,
        *params,
    )
    summary = {
        "total_orders": summary_row["total_orders"],
        "total_revenue": float(summary_row["total_revenue"]),
        "avg_order_value": round(float(summary_row["avg_order_value"]), 2),
        "delivered_count": summary_row["delivered_count"],
        "delivery_rate": round(
            (summary_row["delivered_count"] / summary_row["total_orders"] * 100)
            if summary_row["total_orders"] > 0
            else 0,
            1,
        ),
        "total_cod_collected": float(summary_row["total_cod_collected"]),
        "delivered_revenue": float(summary_row["delivered_revenue"]),
    }

    # 2. Order counts by status (within date range)
    status_rows = await db.fetch(
        f"""
        SELECT status, COUNT(*) AS count
        FROM orders
        WHERE merchant_id = $1{date_clause}{store_clause}
        GROUP BY status
        """,
        *params,
    )
    order_counts = {row["status"]: row["count"] for row in status_rows}

    # 3. Daily trend data (within date range)
    daily_rows = await db.fetch(
        f"""
        SELECT
            DATE(created_at)          AS date,
            COUNT(*)                  AS count,
            COALESCE(SUM(amount), 0)  AS revenue
        FROM orders
        WHERE merchant_id = $1{date_clause}{store_clause}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
        """,
        *params,
    )
    daily_data = [
        {
            "date": str(row["date"]),
            "count": row["count"],
            "revenue": float(row["revenue"]),
        }
        for row in daily_rows
    ]

    # 4. Payment method breakdown (within date range)
    payment_rows = await db.fetch(
        f"""
        SELECT payment_method, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS revenue
        FROM orders
        WHERE merchant_id = $1{date_clause}{store_clause}
        GROUP BY payment_method
        """,
        *params,
    )
    payment_methods = [
        {
            "method": row["payment_method"],
            "count": row["count"],
            "revenue": float(row["revenue"]),
        }
        for row in payment_rows
    ]

    # 5. All stores by order count (within date range)
    store_rows = await db.fetch(
        f"""
        SELECT
            s.name,
            s.branch,
            COUNT(o.id)                AS order_count,
            COALESCE(SUM(o.amount), 0) AS revenue,
            COUNT(o.id) FILTER (WHERE o.status = 'delivered') AS delivered_count,
            CASE WHEN COUNT(o.id) > 0
                 THEN ROUND(COUNT(o.id) FILTER (WHERE o.status = 'delivered') * 100.0 / COUNT(o.id), 1)
                 ELSE 0 END AS delivery_rate,
            COALESCE(ROUND(AVG(o.amount)::numeric, 2), 0) AS avg_order_value
        FROM stores s
        LEFT JOIN orders o ON o.store_id = s.id
            AND o.merchant_id = $1{date_clause.replace('created_at', 'o.created_at')}{store_clause.replace('store_id', 'o.store_id')}
        WHERE s.merchant_id = $1
        GROUP BY s.id, s.name, s.branch
        ORDER BY revenue DESC
        """,
        *params,
    )
    top_stores = [
        {
            "name": row["name"],
            "branch": row["branch"],
            "order_count": row["order_count"],
            "revenue": float(row["revenue"]),
            "delivered_count": row["delivered_count"],
            "delivery_rate": float(row["delivery_rate"]),
            "avg_order_value": float(row["avg_order_value"]),
        }
        for row in store_rows
    ]

    # 6. Delivery pipeline velocity
    pipeline_rows = await db.fetch(
        f"""
        WITH transitions AS (
            SELECT
                h1.order_id,
                h1.status AS from_status,
                h2.status AS to_status,
                EXTRACT(EPOCH FROM (h2.changed_at - h1.changed_at)) / 60.0 AS duration_minutes
            FROM order_status_history h1
            JOIN order_status_history h2 ON h1.order_id = h2.order_id
            JOIN orders o ON o.id = h1.order_id
            WHERE o.merchant_id = $1
              {date_clause.replace('created_at', 'o.created_at')}
              {store_clause.replace('store_id', 'o.store_id')}
              AND (h1.status, h2.status) IN (
                  ('pending', 'assigned'),
                  ('assigned', 'picked_up'),
                  ('picked_up', 'in_transit'),
                  ('in_transit', 'delivered')
              )
        )
        SELECT
            from_status,
            to_status,
            COUNT(*) AS transition_count,
            ROUND(AVG(duration_minutes)::numeric, 1) AS avg_minutes,
            ROUND(MIN(duration_minutes)::numeric, 1) AS min_minutes,
            ROUND(MAX(duration_minutes)::numeric, 1) AS max_minutes
        FROM transitions
        WHERE duration_minutes >= 0
        GROUP BY from_status, to_status
        ORDER BY
            CASE from_status
                WHEN 'pending' THEN 1
                WHEN 'assigned' THEN 2
                WHEN 'picked_up' THEN 3
                WHEN 'in_transit' THEN 4
            END
        """,
        *params,
    )
    pipeline = [
        {
            "from_status": row["from_status"],
            "to_status": row["to_status"],
            "count": row["transition_count"],
            "avg_minutes": float(row["avg_minutes"]),
            "min_minutes": float(row["min_minutes"]),
            "max_minutes": float(row["max_minutes"]),
        }
        for row in pipeline_rows
    ]

    # 7. Hourly order distribution (peak hours)
    hourly_rows = await db.fetch(
        f"""
        SELECT
            EXTRACT(HOUR FROM created_at) AS hour,
            COUNT(*) AS count,
            COALESCE(SUM(amount), 0) AS revenue
        FROM orders
        WHERE merchant_id = $1{date_clause}{store_clause}
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY hour
        """,
        *params,
    )
    hourly_data = [
        {"hour": int(row["hour"]), "count": row["count"], "revenue": float(row["revenue"])}
        for row in hourly_rows
    ]

    # 8. Parcel type breakdown
    parcel_rows = await db.fetch(
        f"""
        SELECT
            COALESCE(parcel_type, 'unspecified') AS parcel_type,
            COUNT(*) AS count,
            COALESCE(SUM(amount), 0) AS revenue
        FROM orders
        WHERE merchant_id = $1{date_clause}{store_clause}
        GROUP BY COALESCE(parcel_type, 'unspecified')
        ORDER BY count DESC
        """,
        *params,
    )
    parcel_types = [
        {"type": row["parcel_type"], "count": row["count"], "revenue": float(row["revenue"])}
        for row in parcel_rows
    ]

    # 9. Cancellation count (for frontend insight)
    cancel_row = await db.fetchrow(
        f"""
        SELECT COUNT(*) AS count
        FROM orders
        WHERE merchant_id = $1 AND status = 'cancelled'{date_clause}{store_clause}
        """,
        *params,
    )
    cancelled_count = cancel_row["count"]

    return {
        "summary": summary,
        "order_counts": order_counts,
        "daily_data": daily_data,
        "payment_methods": payment_methods,
        "top_stores": top_stores,
        "pipeline": pipeline,
        "hourly_data": hourly_data,
        "parcel_types": parcel_types,
        "cancelled_count": cancelled_count,
    }
