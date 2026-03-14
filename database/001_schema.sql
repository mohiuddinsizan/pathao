-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║              PATHAO MERCHANT — Order Management System                     ║
-- ║              Database Schema (PostgreSQL / Supabase)                       ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  Project  : CSE 326 — Information System Design                           ║
-- ║  Stack    : React + FastAPI + Supabase (PostgreSQL 15)                     ║
-- ║  Purpose  : Merchant-facing parcel delivery management dashboard          ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  SETUP:                                                                   ║
-- ║    1. Open Supabase SQL Editor                                            ║
-- ║    2. Run this file (001_schema.sql) — creates tables, indexes, triggers  ║
-- ║    3. Run 002_seed.sql — inserts demo data                                ║
-- ║    4. Login with: rahim.ahmed@gmail.com / demo123                         ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  TABLES (5):                                                              ║
-- ║    merchants            — Registered merchant accounts                    ║
-- ║    stores               — Merchant pickup/branch locations                ║
-- ║    drivers              — Delivery driver pool (system-managed)           ║
-- ║    orders               — Parcel delivery orders                          ║
-- ║    order_status_history — Immutable audit trail of status changes         ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝


-- ============================================================================
-- 0. EXTENSIONS & SEQUENCES
-- ============================================================================

-- pgcrypto: provides gen_random_uuid() for UUID primary keys
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Human-readable order IDs: PTH-100001, PTH-100002, ...
-- The app calls nextval('order_id_seq') and prepends "PTH-"
CREATE SEQUENCE IF NOT EXISTS order_id_seq START WITH 100001;


-- ============================================================================
-- 1. MERCHANTS — Who uses the dashboard
-- ============================================================================
-- Each merchant signs up with email/password, then manages stores & orders.
-- Passwords are hashed with bcrypt (passlib) on the backend — never stored raw.
-- ============================================================================
CREATE TABLE IF NOT EXISTS merchants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,        -- login email (unique)
    password_hash   VARCHAR(255) NOT NULL,               -- bcrypt hash
    name            VARCHAR(255) NOT NULL,               -- display name
    phone           VARCHAR(20),                         -- BD mobile (01XXXXXXXXX)
    business_name   VARCHAR(255),                        -- company/brand name
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- account creation
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()   -- last profile update
);

-- Enforce lowercase emails to prevent duplicates like "A@b.com" vs "a@b.com"
CREATE UNIQUE INDEX IF NOT EXISTS idx_merchants_email_lower
    ON merchants (LOWER(email));


-- ============================================================================
-- 2. STORES — Merchant pickup locations / branches
-- ============================================================================
-- A merchant can have multiple stores (e.g. "Main Branch", "Mirpur Branch").
-- Each order is linked to the store it ships from.
-- ============================================================================
CREATE TABLE IF NOT EXISTS stores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id     UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
                    -- ↑ if merchant is deleted, their stores go too
    name            VARCHAR(255) NOT NULL,               -- store display name
    branch          VARCHAR(255),                        -- branch label (optional)
    address         TEXT,                                -- full street address
    city            VARCHAR(100),                        -- city (e.g. "Dhaka")
    zone            VARCHAR(100),                        -- area/zone (e.g. "Gulshan")
    phone           VARCHAR(20),                         -- store contact number
    email           VARCHAR(255),                        -- store email (optional)
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,       -- soft-disable a store
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup: "get all stores for this merchant"
CREATE INDEX IF NOT EXISTS idx_stores_merchant ON stores(merchant_id);

-- Prevent duplicate store names under the same merchant
CREATE UNIQUE INDEX IF NOT EXISTS idx_stores_merchant_name_branch
    ON stores (merchant_id, name, COALESCE(branch, ''));


-- ============================================================================
-- 3. DRIVERS — Delivery personnel (system-managed)
-- ============================================================================
-- Drivers are assigned to orders by the system (not by the merchant).
-- The merchant dashboard shows driver info in read-only mode.
-- ============================================================================
CREATE TABLE IF NOT EXISTS drivers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,               -- driver full name
    phone           VARCHAR(20) NOT NULL,                -- driver mobile
    vehicle         VARCHAR(100),                        -- "Motorcycle", "Bicycle", etc.
    rating          DECIMAL(2,1) DEFAULT 5.0             -- avg rating out of 5.0
                    CHECK (rating >= 0.0 AND rating <= 5.0),
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,       -- available for assignment?
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique phone prevents duplicate driver entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_phone ON drivers(phone);


-- ============================================================================
-- 4. ORDERS — The core entity: a parcel delivery request
-- ============================================================================
-- Lifecycle: pending → assigned → picked_up → in_transit → delivered
--            pending → cancelled  (can cancel before pickup)
--
-- Key relationships:
--   merchant_id → merchants(id)   REQUIRED — who created the order
--   store_id    → stores(id)      OPTIONAL — pickup branch
--   driver_id   → drivers(id)     OPTIONAL — assigned after creation
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    -- Internal UUID (used in JOINs & foreign keys)
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Human-readable ID shown in UI: "PTH-100001"
    order_id            VARCHAR(20) UNIQUE NOT NULL,

    -- ── Relationships ──
    merchant_id         UUID NOT NULL
                        REFERENCES merchants(id) ON DELETE CASCADE,
    store_id            UUID
                        REFERENCES stores(id) ON DELETE SET NULL,
                        -- ↑ SET NULL: if store deleted, order stays but loses store ref
    driver_id           UUID
                        REFERENCES drivers(id) ON DELETE SET NULL,
                        -- ↑ SET NULL: if driver removed, order stays

    -- ── Status ──
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN (
                            'pending',      -- just created, waiting for driver
                            'assigned',     -- driver accepted the job
                            'picked_up',    -- driver collected the parcel
                            'in_transit',   -- on the way to recipient
                            'delivered',    -- successfully delivered
                            'cancelled'     -- cancelled before delivery
                        )),

    -- ── Recipient Info ──
    recipient_name      VARCHAR(255) NOT NULL,            -- who receives the parcel
    recipient_phone     VARCHAR(20) NOT NULL,             -- recipient mobile
    recipient_address   TEXT NOT NULL,                    -- full delivery address

    -- ── Pickup & Destination ──
    pickup_address      TEXT,                             -- where driver picks up
    destination_area    VARCHAR(255),                     -- area label (e.g. "Banani")

    -- ── Parcel Details ──
    parcel_type         VARCHAR(50)                       -- small_box / medium_parcel / etc.
                        CHECK (parcel_type IS NULL OR parcel_type IN (
                            'document', 'small_box', 'medium_parcel',
                            'large_parcel', 'fragile'
                        )),
    item_description    TEXT,                             -- what's inside
    item_weight         VARCHAR(20),                      -- "0-1kg", "1-5kg", "5-10kg"

    -- ── Pricing ──
    amount              DECIMAL(10,2) NOT NULL            -- total delivery charge (BDT)
                        CHECK (amount >= 0),
    payment_method      VARCHAR(20) NOT NULL DEFAULT 'cod'
                        CHECK (payment_method IN (
                            'cod',       -- Cash on Delivery
                            'prepaid',   -- Already paid online
                            'bkash'      -- bKash mobile payment
                        )),
    cod_amount          DECIMAL(10,2) NOT NULL DEFAULT 0  -- amount to collect on delivery
                        CHECK (cod_amount >= 0),
    notes               TEXT,                             -- special instructions

    -- ── Timestamps ──
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes: optimized for merchant dashboard queries ──
CREATE INDEX IF NOT EXISTS idx_orders_merchant  ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_store     ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver    ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created   ON orders(created_at DESC);

-- Composite: "get pending orders for a merchant" (common dashboard query)
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status
    ON orders(merchant_id, status);


-- ============================================================================
-- 5. ORDER STATUS HISTORY — Immutable audit log
-- ============================================================================
-- Every status change is recorded here. This powers the order timeline view.
-- Rows are INSERT-only (never updated or deleted by the app).
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_status_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL
                REFERENCES orders(id) ON DELETE CASCADE,
                -- ↑ if order is deleted, its history goes too
    status      VARCHAR(20) NOT NULL,                    -- the new status
    changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),      -- when it changed
    note        TEXT                                     -- human-readable note
);

-- Fast: "get full timeline for this order"
CREATE INDEX IF NOT EXISTS idx_status_history_order
    ON order_status_history(order_id);

-- Fast: "get history sorted by time" (timeline display)
CREATE INDEX IF NOT EXISTS idx_status_history_order_time
    ON order_status_history(order_id, changed_at);


-- ============================================================================
-- 6. TRIGGER: Auto-update "updated_at" on row modification
-- ============================================================================
-- This function sets updated_at = NOW() whenever a row is updated.
-- Applied to: merchants, stores, orders
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to merchants
DROP TRIGGER IF EXISTS set_merchants_updated_at ON merchants;
CREATE TRIGGER set_merchants_updated_at
    BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Apply to stores
DROP TRIGGER IF EXISTS set_stores_updated_at ON stores;
CREATE TRIGGER set_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Apply to orders
DROP TRIGGER IF EXISTS set_orders_updated_at ON orders;
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ============================================================================
-- 7. ROW-LEVEL SECURITY (RLS) — Disabled for demo
-- ============================================================================
-- Supabase enables RLS by default. Since our backend uses a service-role
-- connection (asyncpg with pooler), we disable RLS so queries work.
-- In production, you'd enable RLS with proper policies.
-- ============================================================================
ALTER TABLE merchants            DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores               DISABLE ROW LEVEL SECURITY;
ALTER TABLE drivers              DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders               DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history DISABLE ROW LEVEL SECURITY;


-- ============================================================================
-- ✅ SCHEMA COMPLETE
-- ============================================================================
-- Next step: Run 002_seed.sql to populate with demo data.
--
-- Quick Reference — Table Relationships:
--
--   merchants ─┐
--              ├──< stores        (1 merchant → many stores)
--              └──< orders        (1 merchant → many orders)
--                     ├── stores  (1 store → many orders , optional)
--                     ├── drivers (1 driver → many orders, optional)
--                     └──< order_status_history (1 order → many history entries)
--
-- ============================================================================
