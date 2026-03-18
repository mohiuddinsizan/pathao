# Database — Pathao Merchant Order Management

PostgreSQL database schema for the Pathao Merchant parcel delivery dashboard.  
Hosted on **Supabase** (PostgreSQL 15).

---

## Quick Setup

```
1. Open Supabase → SQL Editor
2. Paste & run  001_schema.sql   (tables, indexes, triggers)
3. Paste & run  002_seed.sql     (demo data — 14 orders)
4. Login with:  rahim.ahmed@gmail.com / demo123
```

For a **larger dataset** (34 orders, 106 history entries), run the Python seed script instead of step 3:

```bash
cd database
python seed_realistic.py
```

---

## Files

| File               | What it does                                                    |
|--------------------|-----------------------------------------------------------------|
| `001_schema.sql`   | Creates 5 tables, indexes, `updated_at` triggers, disables RLS |
| `002_seed.sql`     | Inserts 2 merchants, 7 stores, 8 drivers, 14 orders + history  |
| `seed_realistic.py`| Python script — inserts 34 orders with realistic BD data        |
| `README.md`        | You are here                                                    |

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐
│  merchants  │──┐    │   drivers   │
│             │  │    │             │
│ id (PK)     │  │    │ id (PK)     │
│ email (UQ)  │  │    │ name        │
│ password_   │  │    │ phone (UQ)  │
│   hash      │  │    │ vehicle     │
│ name        │  │    │ rating      │
│ phone       │  │    │ is_available│
│ business_   │  │    └──────┬──────┘
│   name      │  │           │ 0..1
│ created_at  │  │           │
│ updated_at  │  │           │
└──────┬──────┘  │           │
       │ 1       │           │
       │         │           │
       ▼ *       │           │
┌─────────────┐  │    ┌──────┴──────┐       ┌───────────────────┐
│   stores    │  └──→ │   orders    │──────→│order_status_history│
│             │  1..* │             │ 1..*  │                   │
│ id (PK)     │       │ id (PK)     │       │ id (PK)           │
│ merchant_id │◄──────│ store_id    │       │ order_id (FK)     │
│   (FK)      │ 0..1  │ merchant_id │       │ status            │
│ name        │       │   (FK)      │       │ changed_at        │
│ branch      │       │ driver_id   │       │ note              │
│ address     │       │   (FK)      │       └───────────────────┘
│ city        │       │ order_id    │
│ zone        │       │   (UQ)      │
│ phone       │       │ status      │
│ email       │       │ recipient_* │
│ is_active   │       │ parcel_*    │
│ created_at  │       │ amount      │
│ updated_at  │       │ payment_*   │
│             │       │ created_at  │
│             │       │ updated_at  │
└─────────────┘       └─────────────┘
```

---

## Tables

### `merchants` — Who uses the dashboard
| Column         | Type          | Constraints         | Notes                          |
|----------------|---------------|---------------------|--------------------------------|
| `id`           | UUID          | PK, auto-generated  | `gen_random_uuid()`            |
| `email`        | VARCHAR(255)  | UNIQUE, NOT NULL     | Login email (case-insensitive) |
| `password_hash`| VARCHAR(255)  | NOT NULL             | bcrypt hash via passlib        |
| `name`         | VARCHAR(255)  | NOT NULL             | Display name                   |
| `phone`        | VARCHAR(20)   |                      | BD mobile (01XXXXXXXXX)        |
| `business_name`| VARCHAR(255)  |                      | Company/brand name             |
| `created_at`   | TIMESTAMPTZ   | NOT NULL, default NOW| Account creation               |
| `updated_at`   | TIMESTAMPTZ   | NOT NULL, default NOW| Auto-updated by trigger        |

### `stores` — Merchant pickup locations
| Column        | Type          | Constraints                           | Notes                    |
|---------------|---------------|---------------------------------------|--------------------------|
| `id`          | UUID          | PK, auto-generated                    |                          |
| `merchant_id` | UUID          | FK → merchants(id) CASCADE, NOT NULL  | Owner merchant           |
| `name`        | VARCHAR(255)  | NOT NULL                              | Store display name       |
| `branch`      | VARCHAR(255)  |                                       | Branch label (optional)  |
| `address`     | TEXT          |                                       | Full street address      |
| `city`        | VARCHAR(100)  |                                       | e.g. "Dhaka"             |
| `zone`        | VARCHAR(100)  |                                       | e.g. "Gulshan"           |
| `phone`       | VARCHAR(20)   |                                       | Store contact            |
| `email`       | VARCHAR(255)  |                                       | Store email              |
| `is_active`   | BOOLEAN       | NOT NULL, default TRUE                | Soft-disable toggle      |
| `created_at`  | TIMESTAMPTZ   | NOT NULL, default NOW                 |                          |
| `updated_at`  | TIMESTAMPTZ   | NOT NULL, default NOW                 | Auto-updated by trigger  |

### `drivers` — Delivery personnel (system-managed, read-only for merchants)
| Column        | Type          | Constraints              | Notes                   |
|---------------|---------------|--------------------------|-------------------------|
| `id`          | UUID          | PK, auto-generated       |                         |
| `name`        | VARCHAR(255)  | NOT NULL                 | Driver full name        |
| `phone`       | VARCHAR(20)   | NOT NULL, UNIQUE         | Driver mobile           |
| `vehicle`     | VARCHAR(100)  |                          | Motorcycle/Bicycle/Van  |
| `rating`      | DECIMAL(2,1)  | CHECK 0.0–5.0, default 5 | Average rating          |
| `is_available`| BOOLEAN       | NOT NULL, default TRUE   | Available for assign?   |
| `created_at`  | TIMESTAMPTZ   | NOT NULL, default NOW    |                         |

### `orders` — Parcel delivery requests (core entity)
| Column             | Type          | Constraints                               | Notes                     |
|--------------------|---------------|-------------------------------------------|---------------------------|
| `id`               | UUID          | PK, auto-generated                        | Internal ID               |
| `order_id`         | VARCHAR(20)   | UNIQUE, NOT NULL                          | "PTH-100001" (human ID)   |
| `merchant_id`      | UUID          | FK → merchants CASCADE, NOT NULL          | Order creator             |
| `store_id`         | UUID          | FK → stores SET NULL                      | Pickup branch             |
| `driver_id`        | UUID          | FK → drivers SET NULL                     | Assigned driver           |
| `status`           | VARCHAR(20)   | CHECK, NOT NULL, default 'pending'        | See status lifecycle      |
| `recipient_name`   | VARCHAR(255)  | NOT NULL                                  | Receiver name             |
| `recipient_phone`  | VARCHAR(20)   | NOT NULL                                  | Receiver phone            |
| `recipient_address`| TEXT          | NOT NULL                                  | Delivery address          |
| `pickup_address`   | TEXT          |                                           | Store pickup address      |
| `destination_area` | VARCHAR(255)  |                                           | Area label (e.g. Banani)  |
| `parcel_type`      | VARCHAR(50)   | CHECK (document/small_box/medium_parcel/large_parcel/fragile) | |
| `item_description` | TEXT          |                                           | What's inside             |
| `item_weight`      | VARCHAR(20)   |                                           | Legacy display weight    |
| `item_weight_kg`   | DECIMAL(10,3) | CHECK > 0                                 | Exact parcel weight in kg|
| `amount`           | DECIMAL(10,2) | NOT NULL, CHECK ≥ 0                       | Delivery charge (BDT)    |
| `payment_method`   | VARCHAR(20)   | CHECK (cod/prepaid/bkash), default 'cod'  | Payment type              |
| `cod_amount`       | DECIMAL(10,2) | NOT NULL, CHECK ≥ 0, default 0            | Collect-on-delivery amt   |
| `notes`            | TEXT          |                                           | Special instructions      |
| `created_at`       | TIMESTAMPTZ   | NOT NULL, default NOW                     |                          |
| `updated_at`       | TIMESTAMPTZ   | NOT NULL, default NOW                     | Auto-updated by trigger  |

### `order_status_history` — Immutable audit trail
| Column      | Type         | Constraints                      | Notes              |
|-------------|--------------|----------------------------------|---------------------|
| `id`        | UUID         | PK, auto-generated               |                     |
| `order_id`  | UUID         | FK → orders CASCADE, NOT NULL    | Which order         |
| `status`    | VARCHAR(20)  | NOT NULL                         | The new status      |
| `changed_at`| TIMESTAMPTZ  | NOT NULL, default NOW            | When it changed     |
| `note`      | TEXT         |                                  | Human-readable note |

---

## Order Status Lifecycle

```
  pending ──→ assigned ──→ picked_up ──→ in_transit ──→ delivered
     │
     └──→ cancelled
```

| Status      | Meaning                              | Driver assigned? |
|-------------|--------------------------------------|------------------|
| `pending`   | Order created, waiting for driver     | No               |
| `assigned`  | Driver accepted the delivery job      | Yes              |
| `picked_up` | Driver collected parcel from store    | Yes              |
| `in_transit`| Driver is on the way to recipient     | Yes              |
| `delivered` | Successfully delivered to recipient   | Yes              |
| `cancelled` | Cancelled before delivery             | Maybe            |

---

## Indexes

| Index                            | Table                  | Columns                   | Purpose                      |
|----------------------------------|------------------------|---------------------------|------------------------------|
| `idx_merchants_email_lower`      | merchants              | LOWER(email)              | Case-insensitive login       |
| `idx_stores_merchant`            | stores                 | merchant_id               | Get merchant's stores        |
| `idx_stores_merchant_name_branch`| stores                 | merchant_id, name, branch | Prevent duplicate stores     |
| `idx_drivers_phone`              | drivers                | phone                     | Unique driver lookup         |
| `idx_orders_merchant`            | orders                 | merchant_id               | Get merchant's orders        |
| `idx_orders_store`               | orders                 | store_id                  | Filter by store              |
| `idx_orders_driver`              | orders                 | driver_id                 | Find driver's orders         |
| `idx_orders_status`              | orders                 | status                    | Filter by status             |
| `idx_orders_created`             | orders                 | created_at DESC           | Recent orders first          |
| `idx_orders_merchant_status`     | orders                 | merchant_id, status       | Dashboard status counts      |
| `idx_status_history_order`       | order_status_history   | order_id                  | Get order timeline           |
| `idx_status_history_order_time`  | order_status_history   | order_id, changed_at      | Timeline sorted by time      |

---

## Triggers

| Trigger                     | Table     | Event          | Effect                       |
|-----------------------------|-----------|----------------|------------------------------|
| `set_merchants_updated_at`  | merchants | BEFORE UPDATE  | Sets `updated_at = NOW()`    |
| `set_stores_updated_at`     | stores    | BEFORE UPDATE  | Sets `updated_at = NOW()`    |
| `set_orders_updated_at`     | orders    | BEFORE UPDATE  | Sets `updated_at = NOW()`    |

---

## Demo Credentials

| Email                         | Password | Role    | Business              |
|-------------------------------|----------|---------|-----------------------|
| `rahim.ahmed@gmail.com`       | demo123  | Primary | Rahim Electronics     |
| `fatima.sultana@outlook.com`  | demo123  | Second  | Fatima Fashion House  |

---

## Notes for Supabase

- **RLS is disabled** in the schema (for demo convenience). In production, enable RLS with proper policies.
- The backend connects via Supabase's **connection pooler** (PgBouncer in transaction mode).
- **Important**: Avoid explicit `BEGIN`/`COMMIT` transaction blocks through the pooler — use individual statements instead.
- Passwords are hashed with **bcrypt** (passlib) on the FastAPI backend, never stored as plaintext.
