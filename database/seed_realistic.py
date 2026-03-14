"""Populate the database with realistic data through the pooler connection."""
import asyncio
import asyncpg

DB_URL = "postgresql://postgres.defytzcrqdhjjeipnvya:tEpEsR837TQ6QB%2C@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

# bcrypt hash of "demo123"
PASSWORD_HASH = "$2b$12$it93kXzSsBAF0wv/fiLcH.f0ksBifzVrBNhEjRTax5fJxJNsjDtF2"

MERCHANT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
MERCHANT2_ID = "a2000000-0000-0000-0000-000000000002"

STORE_IDS = [f"b1000000-0000-0000-0000-00000000000{i}" for i in range(1, 6)]
STORE2_IDS = [f"b2000000-0000-0000-0000-00000000000{i}" for i in range(1, 3)]
DRIVER_IDS = [f"d1000000-0000-0000-0000-00000000000{i}" for i in range(1, 9)]


async def seed():
    conn = await asyncpg.connect(DB_URL)
    try:
        # Clear all data
        await conn.execute("TRUNCATE TABLE order_status_history CASCADE")
        await conn.execute("TRUNCATE TABLE orders CASCADE")
        await conn.execute("TRUNCATE TABLE stores CASCADE")
        await conn.execute("TRUNCATE TABLE drivers CASCADE")
        await conn.execute("TRUNCATE TABLE merchants CASCADE")
        await conn.execute("SELECT setval('order_id_seq', 100001, false)")
        print("Cleared existing data.")

        # Merchants
        await conn.execute(
            "INSERT INTO merchants (id, email, password_hash, name, phone, business_name) VALUES ($1,$2,$3,$4,$5,$6)",
            MERCHANT_ID, "rahim.ahmed@gmail.com", PASSWORD_HASH, "Rahim Ahmed", "01712345678", "Rahim Electronics",
        )
        await conn.execute(
            "INSERT INTO merchants (id, email, password_hash, name, phone, business_name) VALUES ($1,$2,$3,$4,$5,$6)",
            MERCHANT2_ID, "fatima.sultana@outlook.com", PASSWORD_HASH, "Fatima Sultana", "01819876543", "Fatima Fashion House",
        )
        print("Inserted 2 merchants.")

        # Stores
        stores = [
            (STORE_IDS[0], MERCHANT_ID, "Rahim Electronics", "Main Branch", "12/A Gulshan Avenue, Gulshan-2", "Dhaka", "Gulshan", "01712345678", "main@rahimelectronics.com"),
            (STORE_IDS[1], MERCHANT_ID, "Rahim Electronics", "Dhanmondi Branch", "45 Satmasjid Road, Dhanmondi", "Dhaka", "Dhanmondi", "01812345678", "dhanmondi@rahimelectronics.com"),
            (STORE_IDS[2], MERCHANT_ID, "Rahim Electronics", "Mirpur Branch", "78 Mirpur Road, Section-10", "Dhaka", "Mirpur", "01912345678", "mirpur@rahimelectronics.com"),
            (STORE_IDS[3], MERCHANT_ID, "Rahim Electronics", "Uttara Outlet", "15 Uttara Sector-3, House 22", "Dhaka", "Uttara", "01712349999", "uttara@rahimelectronics.com"),
            (STORE_IDS[4], MERCHANT_ID, "Rahim Electronics", "Banani Express", "97 Banani Road-11", "Dhaka", "Banani", "01712348888", "banani@rahimelectronics.com"),
            (STORE2_IDS[0], MERCHANT2_ID, "Fatima Fashion House", "Bashundhara Outlet", "22 Bashundhara City Mall, Level 3", "Dhaka", "Bashundhara", "01819876111", "bashundhara@fatimafashion.com"),
            (STORE2_IDS[1], MERCHANT2_ID, "Fatima Fashion House", "Jamuna Future Park", "Shop 412, Jamuna Future Park", "Dhaka", "Kuril", "01819876222", "jamuna@fatimafashion.com"),
        ]
        for s in stores:
            await conn.execute(
                "INSERT INTO stores (id, merchant_id, name, branch, address, city, zone, phone, email) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
                *s,
            )
        print(f"Inserted {len(stores)} stores.")

        # Drivers
        drivers = [
            (DRIVER_IDS[0], "Karim Sheikh",      "01611111111", "Motorcycle", 4.8, True),
            (DRIVER_IDS[1], "Jamal Hossain",     "01622222222", "Motorcycle", 4.5, True),
            (DRIVER_IDS[2], "Nabila Akter",      "01633333333", "Bicycle",    4.9, True),
            (DRIVER_IDS[3], "Farhan Islam",      "01644444444", "Motorcycle", 4.2, False),
            (DRIVER_IDS[4], "Sakib Rahman",      "01655555555", "Motorcycle", 4.6, True),
            (DRIVER_IDS[5], "Tasnim Ara",        "01666666666", "Bicycle",    4.7, True),
            (DRIVER_IDS[6], "Rafiq Uddin",       "01677777777", "Motorcycle", 4.4, True),
            (DRIVER_IDS[7], "Moumita Chowdhury", "01688888888", "Motorcycle", 4.3, False),
        ]
        for d in drivers:
            await conn.execute(
                "INSERT INTO drivers (id, name, phone, vehicle, rating, is_available) VALUES ($1,$2,$3,$4,$5,$6)",
                *d,
            )
        print(f"Inserted {len(drivers)} drivers.")

        # Orders — (id, order_id, merchant_id, store_id, driver_id, status, recipient_name, recipient_phone, recipient_address, pickup_address, destination_area, parcel_type, item_description, item_weight, amount, payment_method, cod_amount, created_at_offset)
        # created_at_offset is a string like '45 minutes' for NOW() - INTERVAL
        orders = [
            # PENDING (6)
            ("c1000000-0000-0000-0000-000000000001", "PTH-100001", MERCHANT_ID, STORE_IDS[0], None, "pending",
             "Tanvir Rahman", "01755551111", "House 5, Road 3, Banani DOHS, Dhaka", "12/A Gulshan Avenue, Gulshan-2", "Banani", "small_box", "Samsung Galaxy Buds Pro", "0-1kg", 4500.00, "cod", 4500.00, "45 minutes"),
            ("c1000000-0000-0000-0000-000000000002", "PTH-100002", MERCHANT_ID, STORE_IDS[1], None, "pending",
             "Nusrat Jahan Mim", "01755552222", "15 New Elephant Road, Nilkhet", "45 Satmasjid Road, Dhanmondi", "New Market", "document", "Invoice & Warranty Papers", "0-1kg", 120.00, "prepaid", 0, "1 hour 15 minutes"),
            ("c1000000-0000-0000-0000-000000000003", "PTH-100003", MERCHANT_ID, STORE_IDS[3], None, "pending",
             "Imran Hossain Khan", "01755553333", "22/B Sector-7, Uttara, Dhaka", "15 Uttara Sector-3, House 22", "Uttara", "medium_parcel", "JBL Flip 6 Speaker", "1-5kg", 8900.00, "cod", 8900.00, "20 minutes"),
            ("c1000000-0000-0000-0000-000000000004", "PTH-100004", MERCHANT_ID, STORE_IDS[4], None, "pending",
             "Sharmin Akter", "01755554444", "33 Kakrail, Ramna, Dhaka", "97 Banani Road-11", "Ramna", "small_box", "Xiaomi Smart Band 8", "0-1kg", 3200.00, "bkash", 0, "10 minutes"),
            ("c1000000-0000-0000-0000-000000000005", "PTH-100005", MERCHANT_ID, STORE_IDS[0], None, "pending",
             "Rafiqul Islam", "01755555555", "88/C Mohakhali, Dhaka", "12/A Gulshan Avenue, Gulshan-2", "Mohakhali", "fragile", "iPhone 15 Tempered Glass x30", "1-5kg", 6500.00, "cod", 6500.00, "2 hours"),
            ("c1000000-0000-0000-0000-000000000006", "PTH-100006", MERCHANT_ID, STORE_IDS[2], None, "pending",
             "Mehjabin Chowdhury", "01755556666", "44 Pallabi, Mirpur-12, Dhaka", "78 Mirpur Road, Section-10", "Mirpur-12", "medium_parcel", "Logitech MX Master 3S", "0-1kg", 7800.00, "cod", 7800.00, "3 hours"),
            # ASSIGNED (5)
            ("c1000000-0000-0000-0000-000000000007", "PTH-100007", MERCHANT_ID, STORE_IDS[0], DRIVER_IDS[0], "assigned",
             "Fatima Begum", "01755557777", "9/C Mohakhali DOHS, Dhaka", "12/A Gulshan Avenue, Gulshan-2", "Mohakhali", "small_box", "AirPods Pro Case", "0-1kg", 850.00, "cod", 850.00, "3 hours"),
            ("c1000000-0000-0000-0000-000000000008", "PTH-100008", MERCHANT_ID, STORE_IDS[2], DRIVER_IDS[4], "assigned",
             "Rakibul Hasan", "01755558888", "67 Section-2, Mirpur, Dhaka", "78 Mirpur Road, Section-10", "Mirpur", "fragile", "Screen Protector Bundle x20", "1-5kg", 3600.00, "bkash", 0, "4 hours"),
            ("c1000000-0000-0000-0000-000000000009", "PTH-100009", MERCHANT_ID, STORE_IDS[1], DRIVER_IDS[5], "assigned",
             "Anika Tabassum", "01755559999", "90 Jigatola, Dhanmondi, Dhaka", "45 Satmasjid Road, Dhanmondi", "Jigatola", "small_box", "USB-C Hub Adapter", "0-1kg", 2200.00, "cod", 2200.00, "2 hours 30 minutes"),
            ("c1000000-0000-0000-0000-000000000010", "PTH-100010", MERCHANT_ID, STORE_IDS[3], DRIVER_IDS[1], "assigned",
             "Mahfuzur Rahman", "01766661111", "45 Sector-4, Uttara, Dhaka", "15 Uttara Sector-3, House 22", "Uttara", "medium_parcel", "Mechanical Keyboard", "1-5kg", 5500.00, "cod", 5500.00, "5 hours"),
            ("c1000000-0000-0000-0000-000000000011", "PTH-100011", MERCHANT_ID, STORE_IDS[4], DRIVER_IDS[6], "assigned",
             "Sumaiya Khatun", "01766662222", "12 Baridhara, Dhaka", "97 Banani Road-11", "Baridhara", "document", "Product Manuals & Catalogs", "0-1kg", 250.00, "prepaid", 0, "1 hour 45 minutes"),
            # PICKED UP (4)
            ("c1000000-0000-0000-0000-000000000012", "PTH-100012", MERCHANT_ID, STORE_IDS[1], DRIVER_IDS[2], "picked_up",
             "Sadia Islam Ritu", "01766663333", "34 Bashundhara R/A, Block-D", "45 Satmasjid Road, Dhanmondi", "Bashundhara", "medium_parcel", "Dell Laptop Charger 65W", "0-1kg", 2800.00, "cod", 2800.00, "5 hours"),
            ("c1000000-0000-0000-0000-000000000013", "PTH-100013", MERCHANT_ID, STORE_IDS[0], DRIVER_IDS[0], "picked_up",
             "Mehedi Hasan Shuvo", "01766664444", "56 Tejgaon Industrial Area, Dhaka", "12/A Gulshan Avenue, Gulshan-2", "Tejgaon", "small_box", "Anker PowerCore 20000mAh", "0-1kg", 3500.00, "prepaid", 0, "6 hours"),
            ("c1000000-0000-0000-0000-000000000014", "PTH-100014", MERCHANT_ID, STORE_IDS[2], DRIVER_IDS[4], "picked_up",
             "Nazmul Haque", "01766665555", "28 Agargaon, Sher-e-Bangla Nagar", "78 Mirpur Road, Section-10", "Agargaon", "fragile", "Wireless Charging Pad x10", "1-5kg", 4200.00, "cod", 4200.00, "7 hours"),
            ("c1000000-0000-0000-0000-000000000015", "PTH-100015", MERCHANT_ID, STORE_IDS[3], DRIVER_IDS[5], "picked_up",
             "Reshma Parvin", "01766666666", "65 Nikunja-2, Khilkhet", "15 Uttara Sector-3, House 22", "Khilkhet", "small_box", "SanDisk 256GB MicroSD", "0-1kg", 1900.00, "bkash", 0, "4 hours 30 minutes"),
            # IN TRANSIT (5)
            ("c1000000-0000-0000-0000-000000000016", "PTH-100016", MERCHANT_ID, STORE_IDS[2], DRIVER_IDS[1], "in_transit",
             "Arif Mahmud", "01777771111", "89 Shantinagar, Dhaka", "78 Mirpur Road, Section-10", "Shantinagar", "medium_parcel", "Logitech MK470 Combo", "1-5kg", 5200.00, "cod", 5200.00, "8 hours"),
            ("c1000000-0000-0000-0000-000000000017", "PTH-100017", MERCHANT_ID, STORE_IDS[0], DRIVER_IDS[2], "in_transit",
             "Shahin Alam", "01777772222", "112 Motijheel C/A, Dhaka", "12/A Gulshan Avenue, Gulshan-2", "Motijheel", "document", "Warranty Cards & Receipts", "0-1kg", 200.00, "prepaid", 0, "10 hours"),
            ("c1000000-0000-0000-0000-000000000018", "PTH-100018", MERCHANT_ID, STORE_IDS[4], DRIVER_IDS[6], "in_transit",
             "Habibur Rahman", "01777773333", "5/A Green Road, Farmgate", "97 Banani Road-11", "Farmgate", "small_box", "TP-Link WiFi Router", "0-1kg", 3800.00, "cod", 3800.00, "9 hours"),
            ("c1000000-0000-0000-0000-000000000019", "PTH-100019", MERCHANT_ID, STORE_IDS[1], DRIVER_IDS[0], "in_transit",
             "Tania Sultana", "01777774444", "18 Shankar, Dhanmondi 15", "45 Satmasjid Road, Dhanmondi", "Dhanmondi", "small_box", "Baseus Car Charger", "0-1kg", 1500.00, "cod", 1500.00, "6 hours 30 minutes"),
            ("c1000000-0000-0000-0000-000000000020", "PTH-100020", MERCHANT_ID, STORE_IDS[3], DRIVER_IDS[4], "in_transit",
             "Kamrul Hassan", "01777775555", "72 Badda Link Road, Dhaka", "15 Uttara Sector-3, House 22", "Badda", "medium_parcel", "Gaming Mouse Pad XL", "0-1kg", 1200.00, "bkash", 0, "7 hours 15 minutes"),
            # DELIVERED (10)
            ("c1000000-0000-0000-0000-000000000021", "PTH-100021", MERCHANT_ID, STORE_IDS[1], DRIVER_IDS[0], "delivered",
             "Rima Akter", "01788881111", "23 Farmgate, Dhaka", "45 Satmasjid Road, Dhanmondi", "Farmgate", "small_box", "Realme Buds Air 5", "0-1kg", 3200.00, "cod", 3200.00, "1 day"),
            ("c1000000-0000-0000-0000-000000000022", "PTH-100022", MERCHANT_ID, STORE_IDS[0], DRIVER_IDS[1], "delivered",
             "Sumon Das", "01788882222", "78 Lalmatia Block-D, Dhaka", "12/A Gulshan Avenue, Gulshan-2", "Lalmatia", "fragile", "Tempered Glass Bulk x50", "5-10kg", 7500.00, "bkash", 0, "2 days"),
            ("c1000000-0000-0000-0000-000000000023", "PTH-100023", MERCHANT_ID, STORE_IDS[2], DRIVER_IDS[2], "delivered",
             "Mitu Khanam", "01788883333", "44 Mirpur-1, Block-A, Dhaka", "78 Mirpur Road, Section-10", "Mirpur-1", "medium_parcel", "Baseus Power Bank 30000mAh", "1-5kg", 4800.00, "cod", 4800.00, "3 days"),
            ("c1000000-0000-0000-0000-000000000024", "PTH-100024", MERCHANT_ID, STORE_IDS[3], DRIVER_IDS[4], "delivered",
             "Zahidul Haque", "01788884444", "55 Tongi, Gazipur", "15 Uttara Sector-3, House 22", "Tongi", "medium_parcel", "TP-Link Deco Mesh WiFi", "1-5kg", 9200.00, "cod", 9200.00, "4 days"),
            ("c1000000-0000-0000-0000-000000000025", "PTH-100025", MERCHANT_ID, STORE_IDS[4], DRIVER_IDS[5], "delivered",
             "Shamima Nasreen", "01788885555", "19 Panthapath, Dhaka", "97 Banani Road-11", "Panthapath", "small_box", "Apple Watch Band", "0-1kg", 1500.00, "prepaid", 0, "1 day 6 hours"),
            ("c1000000-0000-0000-0000-000000000026", "PTH-100026", MERCHANT_ID, STORE_IDS[0], DRIVER_IDS[6], "delivered",
             "Nasir Uddin", "01788886666", "101 Malibagh Chowdhury Para", "12/A Gulshan Avenue, Gulshan-2", "Malibagh", "document", "Return & Exchange Forms", "0-1kg", 100.00, "prepaid", 0, "5 days"),
            ("c1000000-0000-0000-0000-000000000027", "PTH-100027", MERCHANT_ID, STORE_IDS[1], DRIVER_IDS[0], "delivered",
             "Rubina Yasmin", "01788887777", "62 Rampura, Dhaka", "45 Satmasjid Road, Dhanmondi", "Rampura", "small_box", "Xiaomi Redmi Earbuds", "0-1kg", 1800.00, "cod", 1800.00, "6 days"),
            ("c1000000-0000-0000-0000-000000000028", "PTH-100028", MERCHANT_ID, STORE_IDS[2], DRIVER_IDS[1], "delivered",
             "Mustafizur Rahman", "01788888888", "37 Kazipara, Mirpur, Dhaka", "78 Mirpur Road, Section-10", "Kazipara", "medium_parcel", "Havit Gaming Headset", "0-1kg", 2900.00, "cod", 2900.00, "7 days"),
            ("c1000000-0000-0000-0000-000000000029", "PTH-100029", MERCHANT_ID, STORE_IDS[3], DRIVER_IDS[2], "delivered",
             "Jannatul Ferdous", "01788889999", "8 Airport Road, Dhaka", "15 Uttara Sector-3, House 22", "Airport", "small_box", "Ugreen USB-C Cable x5", "0-1kg", 750.00, "bkash", 0, "2 days 5 hours"),
            ("c1000000-0000-0000-0000-000000000030", "PTH-100030", MERCHANT_ID, STORE_IDS[4], DRIVER_IDS[4], "delivered",
             "Tamanna Ahmed", "01799991111", "14 Niketan, Gulshan-1", "97 Banani Road-11", "Gulshan", "fragile", "iPad Mini Screen Protector x15", "0-1kg", 5400.00, "cod", 5400.00, "3 days 8 hours"),
            # CANCELLED (4)
            ("c1000000-0000-0000-0000-000000000031", "PTH-100031", MERCHANT_ID, STORE_IDS[0], None, "cancelled",
             "Jubayer Ahmed", "01799992222", "90 Badda Link Road, Dhaka", "12/A Gulshan Avenue, Gulshan-2", "Badda", "small_box", "Bluetooth Speaker Mini", "0-1kg", 1600.00, "cod", 1600.00, "4 days"),
            ("c1000000-0000-0000-0000-000000000032", "PTH-100032", MERCHANT_ID, STORE_IDS[1], None, "cancelled",
             "Tasnim Sultana", "01799993333", "56 Mohammadpur, Ring Road", "45 Satmasjid Road, Dhanmondi", "Mohammadpur", "document", "Return Invoice Package", "0-1kg", 100.00, "prepaid", 0, "5 days"),
            ("c1000000-0000-0000-0000-000000000033", "PTH-100033", MERCHANT_ID, STORE_IDS[2], None, "cancelled",
             "Monir Hossain", "01799994444", "29 Mirpur-14, Dhaka", "78 Mirpur Road, Section-10", "Mirpur-14", "medium_parcel", "Cancelled - Wrong Address", "0-1kg", 2200.00, "cod", 2200.00, "3 days 12 hours"),
            ("c1000000-0000-0000-0000-000000000034", "PTH-100034", MERCHANT_ID, STORE_IDS[3], None, "cancelled",
             "Farzana Kabir", "01799995555", "77 Sector-11, Uttara", "15 Uttara Sector-3, House 22", "Uttara", "small_box", "Customer Unreachable", "0-1kg", 950.00, "cod", 950.00, "6 days"),
        ]

        for o in orders:
            oid, order_id, mid, sid, did, status, rname, rphone, raddr, pickup, dest, ptype, desc, weight, amt, pay, cod, offset = o
            await conn.execute(
                f"""INSERT INTO orders (id, order_id, merchant_id, store_id, driver_id, status,
                    recipient_name, recipient_phone, recipient_address, pickup_address,
                    destination_area, parcel_type, item_description, item_weight,
                    amount, payment_method, cod_amount, created_at)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, NOW() - INTERVAL '{offset}')""",
                oid, order_id, mid, sid, did, status,
                rname, rphone, raddr, pickup, dest, ptype, desc, weight, amt, pay, cod,
            )

        print(f"Inserted {len(orders)} orders.")

        # Update sequence
        await conn.execute("SELECT setval('order_id_seq', 100035, false)")

        # Status history entries
        history = [
            # Pending (6)
            ("c1000000-0000-0000-0000-000000000001", "pending", "45 minutes", "Order placed"),
            ("c1000000-0000-0000-0000-000000000002", "pending", "1 hour 15 minutes", "Order placed"),
            ("c1000000-0000-0000-0000-000000000003", "pending", "20 minutes", "Order placed"),
            ("c1000000-0000-0000-0000-000000000004", "pending", "10 minutes", "Order placed"),
            ("c1000000-0000-0000-0000-000000000005", "pending", "2 hours", "Order placed"),
            ("c1000000-0000-0000-0000-000000000006", "pending", "3 hours", "Order placed"),
            # Assigned (5) - pending then assigned
            ("c1000000-0000-0000-0000-000000000007", "pending", "3 hours", "Order placed"),
            ("c1000000-0000-0000-0000-000000000007", "assigned", "2 hours 40 minutes", "Driver Karim Sheikh assigned"),
            ("c1000000-0000-0000-0000-000000000008", "pending", "4 hours", "Order placed"),
            ("c1000000-0000-0000-0000-000000000008", "assigned", "3 hours 30 minutes", "Driver Sakib Rahman assigned"),
            ("c1000000-0000-0000-0000-000000000009", "pending", "2 hours 30 minutes", "Order placed"),
            ("c1000000-0000-0000-0000-000000000009", "assigned", "2 hours 10 minutes", "Driver Tasnim Ara assigned"),
            ("c1000000-0000-0000-0000-000000000010", "pending", "5 hours", "Order placed"),
            ("c1000000-0000-0000-0000-000000000010", "assigned", "4 hours 30 minutes", "Driver Jamal Hossain assigned"),
            ("c1000000-0000-0000-0000-000000000011", "pending", "1 hour 45 minutes", "Order placed"),
            ("c1000000-0000-0000-0000-000000000011", "assigned", "1 hour 20 minutes", "Driver Rafiq Uddin assigned"),
            # Picked up (4) - pending, assigned, picked_up
            ("c1000000-0000-0000-0000-000000000012", "pending", "5 hours", "Order placed"),
            ("c1000000-0000-0000-0000-000000000012", "assigned", "4 hours 30 minutes", "Driver Nabila Akter assigned"),
            ("c1000000-0000-0000-0000-000000000012", "picked_up", "4 hours", "Picked up from Dhanmondi Branch"),
            ("c1000000-0000-0000-0000-000000000013", "pending", "6 hours", "Order placed"),
            ("c1000000-0000-0000-0000-000000000013", "assigned", "5 hours 30 minutes", "Driver Karim Sheikh assigned"),
            ("c1000000-0000-0000-0000-000000000013", "picked_up", "5 hours", "Picked up from Main Branch"),
            ("c1000000-0000-0000-0000-000000000014", "pending", "7 hours", "Order placed"),
            ("c1000000-0000-0000-0000-000000000014", "assigned", "6 hours 20 minutes", "Driver Sakib Rahman assigned"),
            ("c1000000-0000-0000-0000-000000000014", "picked_up", "5 hours 40 minutes", "Picked up from Mirpur Branch"),
            ("c1000000-0000-0000-0000-000000000015", "pending", "4 hours 30 minutes", "Order placed"),
            ("c1000000-0000-0000-0000-000000000015", "assigned", "4 hours", "Driver Tasnim Ara assigned"),
            ("c1000000-0000-0000-0000-000000000015", "picked_up", "3 hours 30 minutes", "Picked up from Uttara Outlet"),
            # In transit (5) - pending, assigned, picked_up, in_transit
            ("c1000000-0000-0000-0000-000000000016", "pending", "8 hours", "Order placed"),
            ("c1000000-0000-0000-0000-000000000016", "assigned", "7 hours 30 minutes", "Driver Jamal Hossain assigned"),
            ("c1000000-0000-0000-0000-000000000016", "picked_up", "7 hours", "Picked up from Mirpur Branch"),
            ("c1000000-0000-0000-0000-000000000016", "in_transit", "6 hours", "On the way to Shantinagar"),
            ("c1000000-0000-0000-0000-000000000017", "pending", "10 hours", "Order placed"),
            ("c1000000-0000-0000-0000-000000000017", "assigned", "9 hours 30 minutes", "Driver Nabila Akter assigned"),
            ("c1000000-0000-0000-0000-000000000017", "picked_up", "9 hours", "Picked up from Main Branch"),
            ("c1000000-0000-0000-0000-000000000017", "in_transit", "8 hours", "En route to Motijheel"),
            ("c1000000-0000-0000-0000-000000000018", "pending", "9 hours", "Order placed"),
            ("c1000000-0000-0000-0000-000000000018", "assigned", "8 hours 30 minutes", "Driver Rafiq Uddin assigned"),
            ("c1000000-0000-0000-0000-000000000018", "picked_up", "8 hours", "Picked up from Banani Express"),
            ("c1000000-0000-0000-0000-000000000018", "in_transit", "7 hours", "On the way to Farmgate"),
            ("c1000000-0000-0000-0000-000000000019", "pending", "6 hours 30 minutes", "Order placed"),
            ("c1000000-0000-0000-0000-000000000019", "assigned", "6 hours", "Driver Karim Sheikh assigned"),
            ("c1000000-0000-0000-0000-000000000019", "picked_up", "5 hours 30 minutes", "Picked up from Dhanmondi Branch"),
            ("c1000000-0000-0000-0000-000000000019", "in_transit", "4 hours 30 minutes", "Heading to Dhanmondi 15"),
            ("c1000000-0000-0000-0000-000000000020", "pending", "7 hours 15 minutes", "Order placed"),
            ("c1000000-0000-0000-0000-000000000020", "assigned", "6 hours 45 minutes", "Driver Sakib Rahman assigned"),
            ("c1000000-0000-0000-0000-000000000020", "picked_up", "6 hours 15 minutes", "Picked up from Uttara Outlet"),
            ("c1000000-0000-0000-0000-000000000020", "in_transit", "5 hours 30 minutes", "En route to Badda"),
            # Delivered (10) - full lifecycle
            ("c1000000-0000-0000-0000-000000000021", "pending", "1 day", "Order placed"),
            ("c1000000-0000-0000-0000-000000000021", "assigned", "23 hours", "Driver Karim Sheikh assigned"),
            ("c1000000-0000-0000-0000-000000000021", "picked_up", "22 hours", "Picked up from store"),
            ("c1000000-0000-0000-0000-000000000021", "in_transit", "21 hours", "On the way"),
            ("c1000000-0000-0000-0000-000000000021", "delivered", "20 hours", "Delivered successfully"),
            ("c1000000-0000-0000-0000-000000000022", "pending", "2 days", "Order placed"),
            ("c1000000-0000-0000-0000-000000000022", "assigned", "47 hours", "Driver Jamal Hossain assigned"),
            ("c1000000-0000-0000-0000-000000000022", "picked_up", "46 hours", "Picked up from store"),
            ("c1000000-0000-0000-0000-000000000022", "in_transit", "45 hours", "On the way"),
            ("c1000000-0000-0000-0000-000000000022", "delivered", "44 hours", "Delivered to recipient"),
            ("c1000000-0000-0000-0000-000000000023", "pending", "3 days", "Order placed"),
            ("c1000000-0000-0000-0000-000000000023", "assigned", "71 hours", "Driver Nabila Akter assigned"),
            ("c1000000-0000-0000-0000-000000000023", "picked_up", "70 hours", "Picked up from store"),
            ("c1000000-0000-0000-0000-000000000023", "in_transit", "69 hours", "En route"),
            ("c1000000-0000-0000-0000-000000000023", "delivered", "68 hours", "Delivered successfully"),
            ("c1000000-0000-0000-0000-000000000024", "pending", "4 days", "Order placed"),
            ("c1000000-0000-0000-0000-000000000024", "assigned", "95 hours", "Driver Sakib Rahman assigned"),
            ("c1000000-0000-0000-0000-000000000024", "picked_up", "94 hours", "Picked up from Uttara Outlet"),
            ("c1000000-0000-0000-0000-000000000024", "in_transit", "93 hours", "On the way to Tongi"),
            ("c1000000-0000-0000-0000-000000000024", "delivered", "91 hours", "Delivered to recipient"),
            ("c1000000-0000-0000-0000-000000000025", "pending", "1 day 6 hours", "Order placed"),
            ("c1000000-0000-0000-0000-000000000025", "assigned", "29 hours", "Driver Tasnim Ara assigned"),
            ("c1000000-0000-0000-0000-000000000025", "picked_up", "28 hours", "Picked up from Banani Express"),
            ("c1000000-0000-0000-0000-000000000025", "in_transit", "27 hours", "On the way"),
            ("c1000000-0000-0000-0000-000000000025", "delivered", "26 hours", "Delivered successfully"),
            ("c1000000-0000-0000-0000-000000000026", "pending", "5 days", "Order placed"),
            ("c1000000-0000-0000-0000-000000000026", "assigned", "119 hours", "Driver Rafiq Uddin assigned"),
            ("c1000000-0000-0000-0000-000000000026", "picked_up", "118 hours", "Picked up"),
            ("c1000000-0000-0000-0000-000000000026", "in_transit", "117 hours", "On the way to Malibagh"),
            ("c1000000-0000-0000-0000-000000000026", "delivered", "116 hours", "Delivered"),
            ("c1000000-0000-0000-0000-000000000027", "pending", "6 days", "Order placed"),
            ("c1000000-0000-0000-0000-000000000027", "assigned", "143 hours", "Driver Karim Sheikh assigned"),
            ("c1000000-0000-0000-0000-000000000027", "picked_up", "142 hours", "Picked up from Dhanmondi Branch"),
            ("c1000000-0000-0000-0000-000000000027", "in_transit", "141 hours", "Heading to Rampura"),
            ("c1000000-0000-0000-0000-000000000027", "delivered", "140 hours", "Delivered to Rubina Yasmin"),
            ("c1000000-0000-0000-0000-000000000028", "pending", "7 days", "Order placed"),
            ("c1000000-0000-0000-0000-000000000028", "assigned", "167 hours", "Driver Jamal Hossain assigned"),
            ("c1000000-0000-0000-0000-000000000028", "picked_up", "166 hours", "Picked up from Mirpur Branch"),
            ("c1000000-0000-0000-0000-000000000028", "in_transit", "165 hours", "En route to Kazipara"),
            ("c1000000-0000-0000-0000-000000000028", "delivered", "164 hours", "Delivered successfully"),
            ("c1000000-0000-0000-0000-000000000029", "pending", "2 days 5 hours", "Order placed"),
            ("c1000000-0000-0000-0000-000000000029", "assigned", "52 hours", "Driver Nabila Akter assigned"),
            ("c1000000-0000-0000-0000-000000000029", "picked_up", "51 hours", "Picked up from Uttara Outlet"),
            ("c1000000-0000-0000-0000-000000000029", "in_transit", "50 hours", "On the way to Airport area"),
            ("c1000000-0000-0000-0000-000000000029", "delivered", "49 hours", "Delivered"),
            ("c1000000-0000-0000-0000-000000000030", "pending", "3 days 8 hours", "Order placed"),
            ("c1000000-0000-0000-0000-000000000030", "assigned", "79 hours", "Driver Sakib Rahman assigned"),
            ("c1000000-0000-0000-0000-000000000030", "picked_up", "78 hours", "Picked up from Banani Express"),
            ("c1000000-0000-0000-0000-000000000030", "in_transit", "77 hours", "Heading to Gulshan-1"),
            ("c1000000-0000-0000-0000-000000000030", "delivered", "76 hours", "Delivered to Tamanna Ahmed"),
            # Cancelled (4) - pending then cancelled
            ("c1000000-0000-0000-0000-000000000031", "pending", "4 days", "Order placed"),
            ("c1000000-0000-0000-0000-000000000031", "cancelled", "3 days 20 hours", "Cancelled by merchant - item out of stock"),
            ("c1000000-0000-0000-0000-000000000032", "pending", "5 days", "Order placed"),
            ("c1000000-0000-0000-0000-000000000032", "cancelled", "4 days 22 hours", "Customer requested cancellation"),
            ("c1000000-0000-0000-0000-000000000033", "pending", "3 days 12 hours", "Order placed"),
            ("c1000000-0000-0000-0000-000000000033", "cancelled", "3 days 10 hours", "Wrong delivery address provided"),
            ("c1000000-0000-0000-0000-000000000034", "pending", "6 days", "Order placed"),
            ("c1000000-0000-0000-0000-000000000034", "cancelled", "5 days 20 hours", "Customer unreachable after 3 attempts"),
        ]

        for h in history:
            oid, status, offset, note = h
            await conn.execute(
                f"INSERT INTO order_status_history (order_id, status, changed_at, note) VALUES ($1, $2, NOW() - INTERVAL '{offset}', $3)",
                oid, status, note,
            )
        print(f"Inserted {len(history)} status history entries.")

        # Final verification
        m_count = await conn.fetchval("SELECT count(*) FROM merchants")
        s_count = await conn.fetchval("SELECT count(*) FROM stores")
        d_count = await conn.fetchval("SELECT count(*) FROM drivers")
        o_count = await conn.fetchval("SELECT count(*) FROM orders")
        h_count = await conn.fetchval("SELECT count(*) FROM order_status_history")
        print(f"\nFinal counts: {m_count} merchants, {s_count} stores, {d_count} drivers, {o_count} orders, {h_count} history")

        # Verify login
        row = await conn.fetchrow("SELECT email, password_hash FROM merchants WHERE email = $1", "rahim.ahmed@gmail.com")
        if row:
            import bcrypt
            ok = bcrypt.checkpw(b"demo123", row["password_hash"].encode())
            print(f"Login test: rahim.ahmed@gmail.com -> {'PASS' if ok else 'FAIL'}")
        else:
            print("Login test: MERCHANT NOT FOUND")

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(seed())
