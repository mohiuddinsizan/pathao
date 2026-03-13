# Database

SQL scripts for setting up the PostgreSQL database on Supabase.

## How to Run

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the scripts in order:
   - `001_schema.sql` — creates all tables, indexes, and the order ID sequence
   - `002_seed.sql` — inserts demo data (merchant, stores, drivers, sample orders)

## Tables

| Table                  | Purpose                          |
|------------------------|----------------------------------|
| `merchants`            | Registered merchant accounts     |
| `stores`               | Merchant pickup locations        |
| `drivers`              | Delivery drivers (reference)     |
| `orders`               | Delivery orders/parcels          |
| `order_status_history` | Status change audit trail        |
