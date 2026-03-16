from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_merchant
from app.database import get_db

router = APIRouter()


@router.get("/stats")
async def dashboard_stats(
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    """Return aggregate stats for the merchant dashboard (single query)."""
    mid = merchant["id"]

    row = await db.fetchrow(
        """
        SELECT
            COUNT(*)                                              AS total_orders,
            COUNT(*) FILTER (WHERE status = 'pending')            AS pending,
            COUNT(*) FILTER (WHERE status = 'in_transit')         AS in_transit,
            COUNT(*) FILTER (WHERE status = 'delivered')          AS delivered,
            COALESCE(SUM(amount) FILTER (WHERE status = 'delivered'), 0) AS total_revenue,
            COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS orders_today
        FROM orders
        WHERE merchant_id = $1
        """,
        mid,
    )

    today_delivery = await db.fetchrow(
        """
        WITH delivered_today AS (
            SELECT DISTINCT o.id, o.amount
            FROM orders o
            JOIN order_status_history osh ON osh.order_id = o.id
            WHERE o.merchant_id = $1
              AND osh.status = 'delivered'
              AND osh.changed_at::date = CURRENT_DATE
        )
        SELECT
            COUNT(*) AS delivered_today,
            COALESCE(SUM(amount), 0) AS revenue_today
        FROM delivered_today
        """,
        mid,
    )

    stores_count = await db.fetchval(
        "SELECT COUNT(*) FROM stores WHERE merchant_id = $1 AND is_active = TRUE",
        mid,
    )

    return {
        "total_orders": row["total_orders"],
        "pending": row["pending"],
        "in_transit": row["in_transit"],
        "delivered": row["delivered"],
        "total_revenue": float(row["total_revenue"]),
        "stores": stores_count,
        "orders_today": row["orders_today"],
        "delivered_today": today_delivery["delivered_today"],
        "revenue_today": float(today_delivery["revenue_today"]),
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


@router.get("/recent-activity")
async def recent_activity(
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    merchant: dict = Depends(get_current_merchant),
    db=Depends(get_db),
):
    """Return a mixed merchant activity feed for the dashboard."""
    rows = await db.fetch(
        """
        WITH order_events AS (
            SELECT
                CASE
                    WHEN osh.status = 'pending' THEN 'parcel_created'
                    ELSE 'parcel_status_changed'
                END AS type,
                o.order_id AS reference,
                CASE
                    WHEN osh.status = 'pending' THEN 'Parcel created'
                    ELSE 'Parcel ' || INITCAP(REPLACE(osh.status, '_', ' '))
                END AS title,
                CASE
                    WHEN osh.status = 'pending' THEN COALESCE(NULLIF(o.recipient_name, ''), 'New parcel added')
                    WHEN COALESCE(NULLIF(osh.note, ''), '') <> ''
                      AND osh.note <> 'Status changed to ' || osh.status
                        THEN osh.note
                    ELSE COALESCE(NULLIF(o.recipient_name, ''), 'Parcel status updated')
                END AS description,
                osh.changed_at AS occurred_at,
                '/deliveries/' || o.order_id AS href,
                osh.status AS status
            FROM order_status_history osh
            JOIN orders o ON o.id = osh.order_id
            WHERE o.merchant_id = $1
            ORDER BY osh.changed_at DESC
            LIMIT (($2::int) + ($3::int))
        ),
        store_created_events AS (
            SELECT
                'store_created' AS type,
                COALESCE(NULLIF(s.branch, ''), s.name) AS reference,
                'Store created' AS title,
                CASE
                    WHEN COALESCE(NULLIF(s.branch, ''), '') <> '' THEN s.name || ' • ' || s.branch
                    ELSE s.name
                END AS description,
                s.created_at AS occurred_at,
                '/stores' AS href,
                NULL::text AS status
            FROM stores s
            WHERE s.merchant_id = $1
            ORDER BY s.created_at DESC
            LIMIT (($2::int) + ($3::int))
        ),
        store_updated_events AS (
            SELECT
                'store_updated' AS type,
                COALESCE(NULLIF(s.branch, ''), s.name) AS reference,
                'Store updated' AS title,
                CASE
                    WHEN COALESCE(NULLIF(s.branch, ''), '') <> '' THEN s.name || ' • ' || s.branch
                    ELSE s.name
                END AS description,
                s.updated_at AS occurred_at,
                '/stores' AS href,
                NULL::text AS status
            FROM stores s
            WHERE s.merchant_id = $1
              AND s.is_active = TRUE
              AND s.updated_at > s.created_at
            ORDER BY s.updated_at DESC
                        LIMIT (($2::int) + ($3::int))
        ),
        store_deactivated_events AS (
            SELECT
                'store_deactivated' AS type,
                COALESCE(NULLIF(s.branch, ''), s.name) AS reference,
                'Store deactivated' AS title,
                CASE
                    WHEN COALESCE(NULLIF(s.branch, ''), '') <> '' THEN s.name || ' • ' || s.branch
                    ELSE s.name
                END AS description,
                s.updated_at AS occurred_at,
                '/stores' AS href,
                'inactive'::text AS status
            FROM stores s
            WHERE s.merchant_id = $1
              AND s.is_active = FALSE
              AND s.updated_at > s.created_at
                            AND s.updated_at >= NOW() - INTERVAL '14 days'
            ORDER BY s.updated_at DESC
                        LIMIT 1
        ),
        activities AS (
            SELECT * FROM order_events

            UNION ALL

            SELECT * FROM store_created_events

            UNION ALL

            SELECT * FROM store_updated_events

            UNION ALL

            SELECT * FROM store_deactivated_events
        )
        SELECT type, reference, title, description, occurred_at, href, status
        FROM activities
        ORDER BY occurred_at DESC
        LIMIT $2
        OFFSET $3
        """,
        merchant["id"],
        limit,
        offset,
    )
    return [dict(r) for r in rows]
