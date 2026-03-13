-- ============================================================================
-- Pathao Order Management — Database Schema
-- Run this FIRST on Supabase SQL Editor
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Sequence for readable order IDs (PTH-100001, PTH-100002, ...)
CREATE SEQUENCE IF NOT EXISTS order_id_seq START WITH 100001;


-- ============================================================================
-- MERCHANTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS merchants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    business_name   VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- STORES
-- ============================================================================
CREATE TABLE IF NOT EXISTS stores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id     UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    branch          VARCHAR(255),
    address         TEXT,
    city            VARCHAR(100),
    zone            VARCHAR(100),
    phone           VARCHAR(20),
    email           VARCHAR(255),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_merchant ON stores(merchant_id);


-- ============================================================================
-- DRIVERS (reference table for demo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS drivers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    vehicle         VARCHAR(100),
    rating          DECIMAL(2,1) DEFAULT 5.0,
    is_available    BOOLEAN DEFAULT true
);


-- ============================================================================
-- ORDERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            VARCHAR(20) UNIQUE NOT NULL,
    merchant_id         UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    store_id            UUID REFERENCES stores(id) ON DELETE SET NULL,
    driver_id           UUID REFERENCES drivers(id) ON DELETE SET NULL,
    status              VARCHAR(20) DEFAULT 'pending'
                        CHECK (status IN (
                            'pending', 'assigned', 'picked_up',
                            'in_transit', 'delivered', 'cancelled'
                        )),
    recipient_name      VARCHAR(255) NOT NULL,
    recipient_phone     VARCHAR(20) NOT NULL,
    recipient_address   TEXT NOT NULL,
    pickup_address      TEXT,
    destination_area    VARCHAR(255),
    parcel_type         VARCHAR(50),
    item_description    TEXT,
    item_weight         VARCHAR(20),
    amount              DECIMAL(10,2) NOT NULL,
    payment_method      VARCHAR(20) DEFAULT 'cod'
                        CHECK (payment_method IN ('cod', 'prepaid', 'bkash')),
    cod_amount          DECIMAL(10,2) DEFAULT 0,
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_merchant ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);


-- ============================================================================
-- ORDER STATUS HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_status_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL,
    changed_at  TIMESTAMPTZ DEFAULT NOW(),
    note        TEXT
);

CREATE INDEX IF NOT EXISTS idx_status_history_order ON order_status_history(order_id);
