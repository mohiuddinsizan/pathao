-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║              PATHAO MERCHANT — Demo Seed Data                              ║
-- ║              Run AFTER 001_schema.sql                                      ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  Login credentials:                                                       ║
-- ║    Email    : rahim.ahmed@gmail.com                                       ║
-- ║    Password : demo123                                                     ║
-- ║                                                                           ║
-- ║  Second merchant (for multi-tenant testing):                              ║
-- ║    Email    : fatima.sultana@outlook.com                                  ║
-- ║    Password : demo123                                                     ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  Contents: 2 merchants, 7 stores, 8 drivers, 14 orders + status history  ║
-- ║  All data uses realistic Bangladeshi names, addresses, and products.      ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- NOTE: For a larger dataset (34 orders, 106 history entries), run the Python
-- script instead:  python seed_realistic.py


-- ============================================================================
-- 1. MERCHANTS
-- ============================================================================
-- Password hash = bcrypt("demo123") generated via passlib
-- ============================================================================

INSERT INTO merchants (id, email, password_hash, name, phone, business_name)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'rahim.ahmed@gmail.com',
    '$2b$12$it93kXzSsBAF0wv/fiLcH.f0ksBifzVrBNhEjRTax5fJxJNsjDtF2',
    'Rahim Ahmed',
    '01712345678',
    'Rahim Electronics'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO merchants (id, email, password_hash, name, phone, business_name)
VALUES (
    'a2000000-0000-0000-0000-000000000002',
    'fatima.sultana@outlook.com',
    '$2b$12$it93kXzSsBAF0wv/fiLcH.f0ksBifzVrBNhEjRTax5fJxJNsjDtF2',
    'Fatima Sultana',
    '01898765432',
    'Fatima Fashion House'
) ON CONFLICT (email) DO NOTHING;


-- ============================================================================
-- 2. STORES (7 stores across both merchants)
-- ============================================================================

-- ── Rahim's stores (5) ──
INSERT INTO stores (id, merchant_id, name, branch, address, city, zone, phone, email) VALUES
('b1000000-0000-0000-0000-000000000001',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'Rahim Electronics', 'Main Branch',
 '12/A Gulshan Avenue, Gulshan-2', 'Dhaka', 'Gulshan',
 '01712345678', 'main@rahimelectronics.com'),

('b1000000-0000-0000-0000-000000000002',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'Rahim Electronics', 'Dhanmondi Branch',
 '45 Satmasjid Road, Dhanmondi', 'Dhaka', 'Dhanmondi',
 '01812345678', 'dhanmondi@rahimelectronics.com'),

('b1000000-0000-0000-0000-000000000003',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'Rahim Electronics', 'Mirpur Branch',
 '78 Mirpur Road, Section-10', 'Dhaka', 'Mirpur',
 '01912345678', 'mirpur@rahimelectronics.com'),

('b1000000-0000-0000-0000-000000000004',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'Rahim Electronics', 'Uttara Branch',
 '15 Uttara Sector-3, Dhaka', 'Dhaka', 'Uttara',
 '01512345678', 'uttara@rahimelectronics.com'),

('b1000000-0000-0000-0000-000000000005',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'Rahim Electronics', 'Banani Branch',
 '22 Kemal Ataturk Avenue, Banani', 'Dhaka', 'Banani',
 '01312345678', 'banani@rahimelectronics.com')
ON CONFLICT DO NOTHING;

-- ── Fatima's stores (2) ──
INSERT INTO stores (id, merchant_id, name, branch, address, city, zone, phone, email) VALUES
('b2000000-0000-0000-0000-000000000001',
 'a2000000-0000-0000-0000-000000000002',
 'Fatima Fashion House', 'Main Outlet',
 '88 New Elephant Road, Dhaka', 'Dhaka', 'New Market',
 '01898765432', 'main@fatimafashion.com'),

('b2000000-0000-0000-0000-000000000002',
 'a2000000-0000-0000-0000-000000000002',
 'Fatima Fashion House', 'Bashundhara Outlet',
 '34 Bashundhara R/A, Block-D', 'Dhaka', 'Bashundhara',
 '01798765432', 'bashundhara@fatimafashion.com')
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 3. DRIVERS (8 drivers with varied vehicles and ratings)
-- ============================================================================

INSERT INTO drivers (id, name, phone, vehicle, rating, is_available) VALUES
('d1000000-0000-0000-0000-000000000001', 'Karim Sheikh',      '01611111111', 'Motorcycle', 4.8, true),
('d1000000-0000-0000-0000-000000000002', 'Jamal Hossain',     '01622222222', 'Motorcycle', 4.5, true),
('d1000000-0000-0000-0000-000000000003', 'Nabila Akter',      '01633333333', 'Bicycle',    4.9, true),
('d1000000-0000-0000-0000-000000000004', 'Farhan Islam',      '01644444444', 'Motorcycle', 4.2, false),
('d1000000-0000-0000-0000-000000000005', 'Sakib Chowdhury',   '01655555555', 'Motorcycle', 4.7, true),
('d1000000-0000-0000-0000-000000000006', 'Rasel Mia',         '01666666666', 'Van',        4.4, true),
('d1000000-0000-0000-0000-000000000007', 'Tania Begum',       '01677777777', 'Bicycle',    4.6, true),
('d1000000-0000-0000-0000-000000000008', 'Polash Uddin',      '01688888888', 'Motorcycle', 4.3, false)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 4. ORDERS — 14 sample orders covering all 6 statuses
-- ============================================================================

-- Reset sequence
SELECT setval('order_id_seq', 100001, false);

-- ── Pending (3) — waiting for driver assignment ──
INSERT INTO orders (id, order_id, merchant_id, store_id, status,
    recipient_name, recipient_phone, recipient_address, pickup_address,
    destination_area, parcel_type, item_description, item_weight,
    amount, payment_method, cod_amount, created_at)
VALUES
('c1000000-0000-0000-0000-000000000001', 'PTH-100001',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1000000-0000-0000-0000-000000000001',
 'pending', 'Tanvir Rahman', '01755551111',
 'House 5, Road 3, Banani, Dhaka', '12/A Gulshan Avenue, Gulshan-2',
 'Banani', 'small_box', 'Wireless Earbuds', '0-1kg',
 2500.00, 'cod', 2500.00, NOW() - INTERVAL '1 hour'),

('c1000000-0000-0000-0000-000000000002', 'PTH-100002',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1000000-0000-0000-0000-000000000002',
 'pending', 'Nusrat Jahan', '01755552222',
 '15 New Elephant Road, Dhaka', '45 Satmasjid Road, Dhanmondi',
 'New Market', 'document', 'Invoice Documents', '0-1kg',
 150.00, 'prepaid', 0, NOW() - INTERVAL '2 hours'),

('c1000000-0000-0000-0000-000000000003', 'PTH-100003',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1000000-0000-0000-0000-000000000001',
 'pending', 'Imran Khan', '01755553333',
 '22/B Uttara Sector-7, Dhaka', '12/A Gulshan Avenue, Gulshan-2',
 'Uttara', 'medium_parcel', 'Bluetooth Speaker', '1-5kg',
 4200.00, 'cod', 4200.00, NOW() - INTERVAL '30 minutes');

-- ── Assigned (2) — driver accepted ──
INSERT INTO orders (id, order_id, merchant_id, store_id, driver_id, status,
    recipient_name, recipient_phone, recipient_address, pickup_address,
    destination_area, parcel_type, item_description, item_weight,
    amount, payment_method, cod_amount, created_at)
VALUES
('c1000000-0000-0000-0000-000000000004', 'PTH-100004',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1000000-0000-0000-0000-000000000001',
 'd1000000-0000-0000-0000-000000000001', 'assigned',
 'Fatima Begum', '01755554444', '9/C Mohakhali DOHS, Dhaka',
 '12/A Gulshan Avenue, Gulshan-2', 'Mohakhali',
 'small_box', 'Phone Case Set', '0-1kg',
 850.00, 'cod', 850.00, NOW() - INTERVAL '3 hours'),

('c1000000-0000-0000-0000-000000000005', 'PTH-100005',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1000000-0000-0000-0000-000000000003',
 'd1000000-0000-0000-0000-000000000002', 'assigned',
 'Rakibul Hasan', '01755555555', '67 Mirpur-12, Dhaka',
 '78 Mirpur Road, Section-10', 'Mirpur-12',
 'fragile', 'Glass Screen Protectors (x20)', '1-5kg',
 3600.00, 'bkash', 0, NOW() - INTERVAL '4 hours');

-- ── Picked Up (2) — driver collected from store ──
INSERT INTO orders (id, order_id, merchant_id, store_id, driver_id, status,
    recipient_name, recipient_phone, recipient_address, pickup_address,
    destination_area, parcel_type, item_description, item_weight,
    amount, payment_method, cod_amount, created_at)
VALUES
('c1000000-0000-0000-0000-000000000006', 'PTH-100006',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1000000-0000-0000-0000-000000000002',
 'd1000000-0000-0000-0000-000000000003', 'picked_up',
 'Sadia Islam', '01755556666', '34 Bashundhara R/A, Block-D',
 '45 Satmasjid Road, Dhanmondi', 'Bashundhara',
 'medium_parcel', 'Laptop Charger', '0-1kg',
 1800.00, 'cod', 1800.00, NOW() - INTERVAL '5 hours'),

('c1000000-0000-0000-0000-000000000007', 'PTH-100007',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1000000-0000-0000-0000-000000000001',
 'd1000000-0000-0000-0000-000000000001', 'picked_up',
 'Mehedi Hasan', '01755557777', '56 Tejgaon Industrial Area',
 '12/A Gulshan Avenue, Gulshan-2', 'Tejgaon',
 'small_box', 'USB Hub', '0-1kg',
 950.00, 'prepaid', 0, NOW() - INTERVAL '6 hours');

-- ── In Transit (2) — on the way ──
INSERT INTO orders (id, order_id, merchant_id, store_id, driver_id, status,
    recipient_name, recipient_phone, recipient_address, pickup_address,
    destination_area, parcel_type, item_description, item_weight,
    amount, payment_method, cod_amount, created_at)
VALUES
('c1000000-0000-0000-0000-000000000008', 'PTH-100008',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1000000-0000-0000-0000-000000000003',
 'd1000000-0000-0000-0000-000000000002', 'in_transit',
 'Arif Mahmud', '01755558888', '89 Shantinagar, Dhaka',
 '78 Mirpur Road, Section-10', 'Shantinagar',
 'medium_parcel', 'Keyboard & Mouse Combo', '1-5kg',
 3200.00, 'cod', 3200.00, NOW() - INTERVAL '8 hours'),

('c1000000-0000-0000-0000-000000000009', 'PTH-100009',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1000000-0000-0000-0000-000000000001',
 'd1000000-0000-0000-0000-000000000003', 'in_transit',
 'Shahin Alam', '01755559999', '112 Motijheel C/A',
 '12/A Gulshan Avenue, Gulshan-2', 'Motijheel',
 'document', 'Warranty Cards', '0-1kg',
 200.00, 'prepaid', 0, NOW() - INTERVAL '10 hours');

-- ── Delivered (3) — successfully completed ──
INSERT INTO orders (id, order_id, merchant_id, store_id, driver_id, status,
    recipient_name, recipient_phone, recipient_address, pickup_address,
    destination_area, parcel_type, item_description, item_weight,
    amount, payment_method, cod_amount, created_at)
VALUES
('c1000000-0000-0000-0000-000000000010', 'PTH-100010',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1000000-0000-0000-0000-000000000002',
 'd1000000-0000-0000-0000-000000000001', 'delivered',
 'Rima Akter', '01766661111', '23 Farmgate, Dhaka',
 '45 Satmasjid Road, Dhanmondi', 'Farmgate',
 'small_box', 'Earphone Set', '0-1kg',
 1200.00, 'cod', 1200.00, NOW() - INTERVAL '1 day'),

('c1000000-0000-0000-0000-000000000011', 'PTH-100011',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1000000-0000-0000-0000-000000000001',
 'd1000000-0000-0000-0000-000000000002', 'delivered',
 'Sumon Das', '01766662222', '78 Lalmatia Block-D',
 '12/A Gulshan Avenue, Gulshan-2', 'Lalmatia',
 'fragile', 'Tempered Glass (x50)', '5-10kg',
 7500.00, 'bkash', 0, NOW() - INTERVAL '2 days'),

('c1000000-0000-0000-0000-000000000012', 'PTH-100012',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1000000-0000-0000-0000-000000000003',
 'd1000000-0000-0000-0000-000000000003', 'delivered',
 'Mitu Khanam', '01766663333', '44 Mirpur-1, Block-A',
 '78 Mirpur Road, Section-10', 'Mirpur-1',
 'medium_parcel', 'Power Bank', '0-1kg',
 2800.00, 'cod', 2800.00, NOW() - INTERVAL '3 days');

-- ── Cancelled (2) — order was cancelled ──
INSERT INTO orders (id, order_id, merchant_id, store_id, status,
    recipient_name, recipient_phone, recipient_address, pickup_address,
    destination_area, parcel_type, item_description, item_weight,
    amount, payment_method, cod_amount, created_at)
VALUES
('c1000000-0000-0000-0000-000000000013', 'PTH-100013',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1000000-0000-0000-0000-000000000001',
 'cancelled', 'Jubayer Ahmed', '01766664444',
 '90 Badda Link Road', '12/A Gulshan Avenue, Gulshan-2',
 'Badda', 'small_box', 'Phone Charger', '0-1kg',
 600.00, 'cod', 600.00, NOW() - INTERVAL '4 days'),

('c1000000-0000-0000-0000-000000000014', 'PTH-100014',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1000000-0000-0000-0000-000000000002',
 'cancelled', 'Tasnim Sultana', '01766665555',
 '56 Mohammadpur, Dhaka', '45 Satmasjid Road, Dhanmondi',
 'Mohammadpur', 'document', 'Return Invoice', '0-1kg',
 100.00, 'prepaid', 0, NOW() - INTERVAL '5 days');

-- Update sequence past all our manual IDs
SELECT setval('order_id_seq', 100015, false);


-- ============================================================================
-- 5. ORDER STATUS HISTORY — Full lifecycle audit trail
-- ============================================================================
-- Every order gets at least its initial "pending" entry.
-- Orders in later stages have the full chain recorded.
-- ============================================================================

-- ── Pending orders: just the initial status ──
INSERT INTO order_status_history (order_id, status, changed_at, note) VALUES
('c1000000-0000-0000-0000-000000000001', 'pending', NOW() - INTERVAL '1 hour',       'Order placed'),
('c1000000-0000-0000-0000-000000000002', 'pending', NOW() - INTERVAL '2 hours',      'Order placed'),
('c1000000-0000-0000-0000-000000000003', 'pending', NOW() - INTERVAL '30 minutes',   'Order placed');

-- ── Assigned orders: pending → assigned ──
INSERT INTO order_status_history (order_id, status, changed_at, note) VALUES
('c1000000-0000-0000-0000-000000000004', 'pending',  NOW() - INTERVAL '3 hours',              'Order placed'),
('c1000000-0000-0000-0000-000000000004', 'assigned', NOW() - INTERVAL '2 hours 45 minutes',   'Driver Karim assigned'),
('c1000000-0000-0000-0000-000000000005', 'pending',  NOW() - INTERVAL '4 hours',              'Order placed'),
('c1000000-0000-0000-0000-000000000005', 'assigned', NOW() - INTERVAL '3 hours 30 minutes',   'Driver Jamal assigned');

-- ── Picked up: pending → assigned → picked_up ──
INSERT INTO order_status_history (order_id, status, changed_at, note) VALUES
('c1000000-0000-0000-0000-000000000006', 'pending',   NOW() - INTERVAL '5 hours',              'Order placed'),
('c1000000-0000-0000-0000-000000000006', 'assigned',  NOW() - INTERVAL '4 hours 30 minutes',   'Driver Nabila assigned'),
('c1000000-0000-0000-0000-000000000006', 'picked_up', NOW() - INTERVAL '4 hours',              'Picked up from store'),
('c1000000-0000-0000-0000-000000000007', 'pending',   NOW() - INTERVAL '6 hours',              'Order placed'),
('c1000000-0000-0000-0000-000000000007', 'assigned',  NOW() - INTERVAL '5 hours 30 minutes',   'Driver Karim assigned'),
('c1000000-0000-0000-0000-000000000007', 'picked_up', NOW() - INTERVAL '5 hours',              'Picked up from store');

-- ── In transit: pending → assigned → picked_up → in_transit ──
INSERT INTO order_status_history (order_id, status, changed_at, note) VALUES
('c1000000-0000-0000-0000-000000000008', 'pending',    NOW() - INTERVAL '8 hours',              'Order placed'),
('c1000000-0000-0000-0000-000000000008', 'assigned',   NOW() - INTERVAL '7 hours 30 minutes',   'Driver Jamal assigned'),
('c1000000-0000-0000-0000-000000000008', 'picked_up',  NOW() - INTERVAL '7 hours',              'Picked up from store'),
('c1000000-0000-0000-0000-000000000008', 'in_transit', NOW() - INTERVAL '6 hours',              'On the way to recipient'),
('c1000000-0000-0000-0000-000000000009', 'pending',    NOW() - INTERVAL '10 hours',             'Order placed'),
('c1000000-0000-0000-0000-000000000009', 'assigned',   NOW() - INTERVAL '9 hours 30 minutes',   'Driver Nabila assigned'),
('c1000000-0000-0000-0000-000000000009', 'picked_up',  NOW() - INTERVAL '9 hours',              'Picked up from store'),
('c1000000-0000-0000-0000-000000000009', 'in_transit', NOW() - INTERVAL '8 hours',              'On the way');

-- ── Delivered: full lifecycle ──
INSERT INTO order_status_history (order_id, status, changed_at, note) VALUES
('c1000000-0000-0000-0000-000000000010', 'pending',    NOW() - INTERVAL '1 day',      'Order placed'),
('c1000000-0000-0000-0000-000000000010', 'assigned',   NOW() - INTERVAL '23 hours',   'Driver Karim assigned'),
('c1000000-0000-0000-0000-000000000010', 'picked_up',  NOW() - INTERVAL '22 hours',   'Picked up'),
('c1000000-0000-0000-0000-000000000010', 'in_transit', NOW() - INTERVAL '21 hours',   'On the way'),
('c1000000-0000-0000-0000-000000000010', 'delivered',  NOW() - INTERVAL '20 hours',   'Delivered successfully'),

('c1000000-0000-0000-0000-000000000011', 'pending',    NOW() - INTERVAL '2 days',     'Order placed'),
('c1000000-0000-0000-0000-000000000011', 'assigned',   NOW() - INTERVAL '47 hours',   'Driver Jamal assigned'),
('c1000000-0000-0000-0000-000000000011', 'picked_up',  NOW() - INTERVAL '46 hours',   'Picked up'),
('c1000000-0000-0000-0000-000000000011', 'in_transit', NOW() - INTERVAL '45 hours',   'On the way'),
('c1000000-0000-0000-0000-000000000011', 'delivered',  NOW() - INTERVAL '44 hours',   'Delivered to recipient'),

('c1000000-0000-0000-0000-000000000012', 'pending',    NOW() - INTERVAL '3 days',     'Order placed'),
('c1000000-0000-0000-0000-000000000012', 'assigned',   NOW() - INTERVAL '71 hours',   'Driver Nabila assigned'),
('c1000000-0000-0000-0000-000000000012', 'picked_up',  NOW() - INTERVAL '70 hours',   'Picked up'),
('c1000000-0000-0000-0000-000000000012', 'in_transit', NOW() - INTERVAL '69 hours',   'En route'),
('c1000000-0000-0000-0000-000000000012', 'delivered',  NOW() - INTERVAL '68 hours',   'Delivered');

-- ── Cancelled: pending → cancelled ──
INSERT INTO order_status_history (order_id, status, changed_at, note) VALUES
('c1000000-0000-0000-0000-000000000013', 'pending',   NOW() - INTERVAL '4 days',          'Order placed'),
('c1000000-0000-0000-0000-000000000013', 'cancelled', NOW() - INTERVAL '3 days 20 hours', 'Cancelled by merchant'),
('c1000000-0000-0000-0000-000000000014', 'pending',   NOW() - INTERVAL '5 days',          'Order placed'),
('c1000000-0000-0000-0000-000000000014', 'cancelled', NOW() - INTERVAL '4 days 22 hours', 'Customer requested cancellation');


-- ============================================================================
-- ✅ SEED COMPLETE
-- ============================================================================
-- You should now be able to:
--   1. Login at /login with rahim.ahmed@gmail.com / demo123
--   2. See 14 orders across all statuses on the dashboard
--   3. View 5 stores under "Stores" page
--   4. Browse order timelines with full status history
--
-- For a larger dataset (34 orders), run:  python seed_realistic.py
-- ============================================================================
