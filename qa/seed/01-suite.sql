-- Moved from the srs-test-all skill (seed_complete_suite.py), 2026-11-24.
-- Target DB: isppay_suite_run only (guarded by qa.config.json db.allowed).
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Billing Policies
INSERT IGNORE INTO billing_policies
(tenant_id, billing_cycle_day, grace_days, auto_suspend, auto_suspend_days, late_fee_amount_cents, late_fee_percent, reconnection_fee_cents, updated_by)
VALUES 
(1, 1, 5, 1, 7, 5000, 2.50, 20000, 1001)
ON DUPLICATE KEY UPDATE grace_days = 5, auto_suspend = 1;

-- 2. Billing Tax Configs
INSERT IGNORE INTO billing_tax_configs (tenant_id, enabled, label, rate_percent, mode, bin_number, tin_number, registration_number, updated_by)
VALUES 
(1, 1, 'National VAT (5%)', 5.00, 'exclusive', 'BIN-123456789-001', 'TIN-987654321', 'REG-BD-ISP-2026', 1001)
ON DUPLICATE KEY UPDATE enabled = 1, rate_percent = 5.00;

-- 3. Bandwidth SLAs
INSERT IGNORE INTO bandwidth_slas (tenant_id, name, scope, package_id, customer_id, committed_mbps, uptime_target_pct, status, notes)
VALUES 
(1, 'Mission Critical Corporate SLA', 'package', 101, NULL, 50.00, 99.95, 'active', 'Guaranteed CIR with 4-hour MTTR for corporate line'),
(1, 'SME Enterprise SLA', 'customer', NULL, 1041, 30.00, 99.50, 'active', 'Redundant dual-homed fiber connection');

-- 4. Customer KYC Documents
INSERT IGNORE INTO customer_kyc_documents (tenant_id, customer_id, doc_type, doc_number, original_name, mime_type, file_size, storage_path, status, note, uploaded_by, verified_by, verified_at)
VALUES 
(1, 1041, 'nid', 'NID-1990269261234567', 'customer_nid_front.jpg', 'image/jpeg', 245100, '/uploads/kyc/customer_1041_nid.jpg', 'verified', 'NID verified with election commission database', 1001, 1001, NOW()),
(1, 1041, 'utility_bill', 'DESCO-99210-481', 'desco_bill_oct2026.pdf', 'application/pdf', 512000, '/uploads/kyc/customer_1041_desco.pdf', 'verified', 'Billing address matched exactly', 1001, 1001, NOW());

-- 5. Developer API Keys
INSERT IGNORE INTO developer_api_keys (tenant_id, name, key_prefix, key_hash, scopes_json, status, created_by, last_used_at)
VALUES 
(1, 'CRM Sync Production Key', 'isp_live_99', SHA2('isp_live_99_unique_hash_1', 256), '["customer:read", "payment:read", "billing:read"]', 'active', 1001, NOW()),
(1, 'Accounting Webhook Ingestion Key', 'isp_live_88', SHA2('isp_live_88_unique_hash_2', 256), '["*"]', 'active', 1001, NOW());

-- 6. Developer Webhooks
INSERT IGNORE INTO developer_webhooks (tenant_id, url, events_json, active, secret_enc, secret_hint, last_status, created_by)
VALUES 
(1, 'https://crm.alpha-isp.com/api/webhooks/payments', '["payment.received", "customer.suspended", "ticket.created"]', 1, 'enc_secret_key_mock_9921', 'whsec_99', 200, 1001),
(1, 'https://billing.partner.com/hooks/ledger', '["invoice.generated", "pop.funded"]', 1, 'enc_secret_key_mock_8812', 'whsec_88', 200, 1001);

-- 7. Fraud Flags
INSERT IGNORE INTO fraud_flags (tenant_id, rule, match_value, customer_ids_json, user_count, status, note, first_detected_at, last_detected_at)
VALUES 
(1, 'Multiple MAC Flapping', '00:1A:2B:3C:4D:5E', '[1041]', 1, 'open', 'Rapid MAC interface switching detected on Mirpur-10 ONU', NOW(), NOW()),
(1, 'Concurrent PPPoE Login', 'alpha_user_2', '[1042]', 2, 'investigating', 'Simultaneous logins attempted from two distinct NAS ports', NOW(), NOW());

-- 8. Free User Requests
INSERT IGNORE INTO free_user_requests (tenant_id, customer_id, requested_by_user_id, status, note, reviewed_by_user_id)
VALUES 
(1, 1041, 1001, 'pending', 'Community clinic trial connection for 3 months', 1001),
(1, 1042, 1001, 'approved', 'Local mosque CCTV monitoring complimentary connection', 1001);

-- 9. Network Nodes (Map & Topology)
INSERT IGNORE INTO network_nodes (tenant_id, parent_id, name, latitude, longitude, maintenance, status)
VALUES 
(1, NULL, 'Mirpur-10 Core Distribution POP', 23.8069, 90.3687, 0, 'active'),
(1, 1, 'Section-6 Aggregation Sub-Node', 23.8120, 90.3645, 0, 'active'),
(1, 1, 'Section-11 Fiber Distribution Hub', 23.8210, 90.3720, 0, 'active'),
(1, NULL, 'Uttara Sector-4 Gateway Node', 23.8720, 90.3980, 0, 'active');

-- 10. NOC Incidents
INSERT IGNORE INTO noc_incidents (tenant_id, kind, title, description, severity, status, router_ids_json, area_ids_json, starts_at, ends_at, created_by)
VALUES 
(1, 'incident', 'Sub-core fiber attenuation on Mirpur feeder cable', 'Optical power dropped from -18dBm to -27dBm due to road construction work.', 'major', 'resolved', '[1060]', '[1]', NOW() - INTERVAL 12 HOUR, NOW() - INTERVAL 2 HOUR, 1001),
(1, 'maintenance', 'Scheduled core router firmware upgrade RouterOS v7.14', 'Planned maintenance window for core routing protocol synchronization.', 'minor', 'scheduled', '[1060]', '[1, 2]', NOW() + INTERVAL 24 HOUR, NOW() + INTERVAL 26 HOUR, 1001);

-- 11. POP Commission Rules
INSERT IGNORE INTO pop_commission_rules (tenant_id, pop_id, commission_type, commission_value, notes)
VALUES 
(1, 1031, 'percent', 15.00, 'Standard 15% downstream renewal commission for POP 1-1'),
(1, 1032, 'percent', 18.00, 'High-volume tier 18% commission for POP 1-2')
ON DUPLICATE KEY UPDATE commission_value = VALUES(commission_value);

-- 12. Purchase Bills
INSERT IGNORE INTO purchase_bills (tenant_id, provider, invoice_number, billing_date, payment_due_date, payment_status, total_cents, discount_cents, payment_method, remarks, paid_cents, paid_by, received_by)
VALUES 
(1, 'Summit Communications IIG', 'SUM-2026-9912', CURDATE() - INTERVAL 5 DAY, CURDATE() + INTERVAL 15 DAY, 'paid', 25000000, 500000, 'Bank Wire', 'Upstream 500Mbps Transit & Peering Settlement', 24500000, 'Alpha Owner', 'Summit Billing Desk'),
(1, 'Fiber@Home NTTN Ltd', 'FAH-NTTN-4412', CURDATE() - INTERVAL 2 DAY, CURDATE() + INTERVAL 20 DAY, 'partial', 12000000, 0, 'Cheque', 'Underground fiber core lease renewal for Dhaka North', 6000000, 'Alpha Owner', 'Finance Team');

-- 13. Requisitions
INSERT IGNORE INTO requisitions (tenant_id, requisition_code, title, vendor_suggestion, status, total_cents, requested_by_user_id, approved_by_user_id)
VALUES 
(1, 'REQ-OPT-001', '50x Gigabit Dual-Band XPON ONUs', 'Huawei Bangladesh Official Distributor', 'approved', 12500000, 1004, 1001),
(1, 'REQ-FBR-002', '10x Drums 4-Core Aerial Drop Cable (1000m)', 'Bengal Fiber Tech', 'pending', 8500000, 1004, NULL);

-- 14. Reward Programs & Transactions
INSERT IGNORE INTO reward_programs (tenant_id, name, points_per_referral, status)
VALUES 
(1, 'ISP Pay Loyal Customer Points Program', 100, 'active');

INSERT IGNORE INTO reward_transactions (tenant_id, customer_id, points, balance_after, source, idempotency_key, status, note, created_at)
VALUES 
(1, 1041, 100, 100, 'bill_payment', 'rw_trx_001_idempotent', 'posted', 'On-time bill payment bonus (November 2026)', NOW() - INTERVAL 2 DAY),
(1, 1041, 50, 150, 'referral', 'rw_trx_002_idempotent', 'posted', 'Referral bonus: invited friend to sign up', NOW() - INTERVAL 5 DAY);

-- 15. Referrals
INSERT IGNORE INTO referrals (tenant_id, referrer_id, referee_id, referral_code, status, referee_name, referee_mobile, package_id, points_awarded)
VALUES 
(1, 1041, 1042, 'REF-ALPHA-99', 'verified', 'Kamal Hossain', '01811223399', 101, 100),
(1, 1041, NULL, 'REF-ALPHA-99', 'pending', 'Sultana Begum', '01911223388', 102, 0);

-- 16. Service Catalog (Addons & Premium Services)
INSERT IGNORE INTO service_catalog (tenant_id, name, code, category, price, description, active)
VALUES 
(1, 'Dedicated Public IPv4 Address', 'STATIC-IPV4', 'ip', 300.00, 'Static global public IP address for CCTV, remote desktop, and servers', 1),
(1, 'VIP Low-Latency Gaming Routing', 'GAMER-ROUTE', 'routing', 200.00, 'Optimized low-ping BDIX routing path for competitive esports', 1),
(1, 'Mesh Wi-Fi Multi-Room Coverage', 'MESH-WIFI', 'hardware', 500.00, 'Managed mesh access point system for large apartments and offices', 1);

-- 17. Shop Orders
INSERT IGNORE INTO shop_orders (admin_id, customer_id, product_id, product_title, unit_price, quantity, total_price, customer_name, customer_mobile, delivery_address, status, notes)
VALUES 
(1001, 1005, 1, 'TP-Link Archer C6 Gigabit Dual-Band AC1200 Router', 3200.00, 1, 3200.00, 'Alpha User', '01711223344', 'House 12, Road 4, Sector 4, Uttara, Dhaka', 'confirmed', 'Customer requested installation support during delivery'),
(1001, 1041, 2, 'Cat6 High-Speed Shielded Patch Cable 10m', 250.00, 2, 500.00, 'Rahim Khan', '01811223344', 'Mirpur-10, Block C, Road 2', 'delivered', 'Handed over by technician');

-- 18. Voice SMS Messages & Templates
INSERT IGNORE INTO voice_sms_messages (tenant_id, to_phone, body, voice_id, status, provider_ref)
VALUES 
(1, '01711223344', 'Dear customer, your ISP internet bill for November is ready. Please pay by the 5th to enjoy uninterrupted service.', 'bn_female_1', 'sent', 'VOC-REF-99210'),
(1, '01811223344', 'Thank you! We have received your monthly internet bill payment.', 'bn_female_1', 'sent', 'VOC-REF-99211');

-- 19. VPN Accounts
INSERT IGNORE INTO vpn_accounts (tenant_id, vpn_type, username, password_enc, assigned_ip, profile, status, router_id, notes)
VALUES 
(1, 'l2tp', 'noc_engineer_dhaka', 'enc_pass_noc_99', '10.250.10.5', 'NOC-Admin-Profile', 'active', 1060, 'Remote engineering access to core Mikrotik router'),
(1, 'openvpn', 'field_support_tech', 'enc_pass_tech_88', '10.250.10.6', 'Field-Staff-Profile', 'active', 1060, 'Field technician remote OLT diagnostic tunnel');

-- 20. Wallet Topup Requests
INSERT IGNORE INTO wallet_topup_requests (tenant_id, requested_by_user_id, amount_cents, status, note, gateway_provider, gateway_trx, payer_number)
VALUES 
(1, 1001, 500000, 'approved', 'Recharge wallet balance via bKash Merchant', 'bkash', 'TRX992104812', '01711000111'),
(1, 1001, 200000, 'pending', 'Monthly advance credit top-up', 'nagad', 'NGD772199042', '01811000222');

-- 21. WhatsApp Campaigns & Opt-Ins
INSERT IGNORE INTO whatsapp_campaigns (tenant_id, name, template_id, body, status, queued_count)
VALUES 
(1, 'November Due Bill Reminder Blast', 1, 'Hello {{name}}, your high-speed internet bill of ৳{{amount}} is due on {{date}}. Tap link to pay instantly: {{pay_link}}', 'sent', 35),
(1, 'Winter High-Speed 50Mbps Upgrade Offer', 2, 'Special upgrade offer! Double your bandwidth to 50Mbps for only ৳200 extra this month.', 'active', 50);

INSERT IGNORE INTO whatsapp_opt_ins (tenant_id, phone, state, source)
VALUES 
(1, '01711223344', 'opted_in', 'manual'),
(1, '01811223344', 'opted_in', 'manual');

-- 22. Recycle Bin Items
INSERT IGNORE INTO recycle_bin_items (tenant_id, entity_type, entity_id, label, source_table, ip_address, deleted_by_user_id, created_at, expires_at)
VALUES 
(1, 'customer', 9991, 'Old Trial Customer (Tanvir Ahmed)', 'customers', '127.0.0.1', 1001, NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 28 DAY),
(1, 'package', 9992, 'Deprecated Legacy 3Mbps Plan', 'packages', '127.0.0.1', 1001, NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 25 DAY);

-- 23. Dealers
INSERT IGNORE INTO dealers (tenant_id, name, contact_person, mobile, commission_percent, status)
VALUES 
(1, 'Uttara Telecom Dealer', 'Kamal Hossain', '01711002233', 10.00, 'active'),
(1, 'Dhanmondi Broadband Hub', 'Rafiqul Islam', '01811002233', 12.50, 'active');

-- 24. Suppliers
INSERT IGNORE INTO suppliers (tenant_id, name, phone, email, status, contact_person, mobile_number, website, address)
VALUES 
(1, 'Bangladesh Fiber Optic Ltd', '029876543', 'sales@bdfiber.com', 'active', 'Mohsin Ali', '01911223344', 'https://bdfiber.com', 'Plot 42, Tejgaon I/A, Dhaka'),
(1, 'Smart Technologies BD', '028876543', 'orders@smart-bd.com', 'active', 'Tanvir Ahmed', '01611223344', 'https://smart-bd.com', 'IDB Bhaban, Agargaon, Dhaka');

-- 25. Units
INSERT IGNORE INTO units (tenant_id, code, name, status)
VALUES 
(1, 'PCS', 'Pieces', 'active'),
(1, 'BOX', 'Box (100 pcs)', 'active'),
(1, 'MTR', 'Meters', 'active'),
(1, 'ROLL', 'Roll (305m)', 'active');

-- 26. Expense Types
INSERT IGNORE INTO expense_types (tenant_id, name, code, status)
VALUES 
(1, 'Office Rent', 'EXP-RENT', 'active'),
(1, 'Electricity & Utility', 'EXP-UTIL', 'active'),
(1, 'Fiber Maintenance & Splicing', 'EXP-FIBER', 'active'),
(1, 'Staff Refreshment', 'EXP-REFRESH', 'active');

-- 27. Income Types
INSERT IGNORE INTO income_types (tenant_id, name, code, status)
VALUES 
(1, 'New Fiber Connection Fee', 'INC-CONN', 'active'),
(1, 'Router & ONU Sales', 'INC-HARDWARE', 'active'),
(1, 'Static Public IP Rental', 'INC-IP', 'active'),
(1, 'Late Payment Penalty', 'INC-LATE', 'active');

-- 28. Inventory Categories
INSERT IGNORE INTO inventory_categories (tenant_id, name, status, short_description)
VALUES 
(1, 'Fiber Optical Cables', 'active', 'Single-core, 2-core and 4-core armored drop cables'),
(1, 'Customer Premises Equipment (CPE)', 'active', 'Dual-band Wi-Fi routers and XPON ONUs'),
(1, 'Network Switches & Media Converters', 'active', 'Gigabit managed switches, SFP modules and MCs');

-- 29. Inventory Providers
INSERT IGNORE INTO inventory_providers (tenant_id, name, status)
VALUES 
(1, 'MikroTik SIA Latvia', 'active'),
(1, 'Huawei Technologies BD', 'active'),
(1, 'TP-Link Bangladesh Ltd', 'active');

-- 30. Bandwidth Vendors
INSERT IGNORE INTO bandwidth_vendors (tenant_id, name, status)
VALUES 
(1, 'Summit Communications Ltd', 'active'),
(1, 'Fiber@Home Ltd', 'active'),
(1, 'Bangladesh Submarine Cable Company (BSCCL)', 'active');

-- 31. PON Ports (for OLT 1)
INSERT IGNORE INTO pon_ports (tenant_id, olt_id, port_code, onu_count, status)
VALUES 
(1, 1, 'EPON0/1', 48, 'up'),
(1, 1, 'EPON0/2', 32, 'up'),
(1, 1, 'EPON0/3', 55, 'up'),
(1, 1, 'EPON0/4', 12, 'up');

-- 32. Splitters
INSERT IGNORE INTO splitters (tenant_id, olt_id, pon_port_id, name, ratio, latitude, longitude, status)
VALUES 
(1, 1, 1, 'Splitter Sector 4 Box A', '1:8', 23.8698, 90.3984, 'active'),
(1, 1, 1, 'Splitter Sector 4 Box B', '1:16', 23.8710, 90.4012, 'active');

-- 33. Purchase Orders & Items
INSERT IGNORE INTO purchase_orders (tenant_id, purchase_code, supplier_id, title, amount_cents, status)
VALUES 
(1, 'PO-2026-001', 1, 'Bulk 2-Core Drop Fiber Cables (10km)', 12500000, 'approved'),
(1, 'PO-2026-002', 2, 'Gigabit Dual-Band XPON ONUs (100 pcs)', 18500000, 'completed');

INSERT IGNORE INTO purchase_order_items (tenant_id, purchase_order_id, name, qty, unit_cents, line_total_cents)
VALUES 
(1, 1, '2-Core Armored Drop Cable Roll', 10, 1250000, 12500000),
(1, 2, 'Dual Band AC1200 XPON ONU', 100, 185000, 18500000);

-- 34. Registration Requests (Lead Inquiries)
INSERT IGNORE INTO registration_requests (tenant_slug, name, email, phone, company, division, district, upazilla, message, status)
VALUES 
('alpha', 'Jahangir Alam', 'jahangir@corp-tech.com', '01719988776', 'Corp Tech Solutions', 'Dhaka', 'Dhaka', 'Uttara', 'Need 50Mbps corporate dedicated line for 35 computers', 'pending'),
('alpha', 'Sadia Sultana', 'sadia.s@gmail.com', '01819988776', 'Home Broadband', 'Dhaka', 'Dhaka', 'Gulshan', 'Want 20Mbps fiber connection for home office', 'contacted');

-- 35. Store Locations (Warehouses)
INSERT IGNORE INTO store_locations (tenant_id, name, code, status)
VALUES 
(1, 'Central Operations Warehouse', 'WH-MAIN', 'active'),
(1, 'Uttara Sector 11 Sub-Store', 'WH-UTTARA', 'active');

-- 36. App Releases
INSERT IGNORE INTO app_releases (platform, min_supported_version, latest_version, force_upgrade_message_bn, store_url, use_new_backend)
VALUES 
('android', '1.0.0', '2.4.1', 'নতুন এবং উন্নত ফিচারের জন্য অ্যাপটি গুগল প্লে স্টোর থেকে আপডেট করুন।', 'https://play.google.com/store/apps/details?id=com.isppaybd.customer', 1),
('ios', '1.0.0', '2.4.0', 'নতুন ফিচারের জন্য অ্যাপল অ্যাপ স্টোর থেকে আপডেট করুন।', 'https://apps.apple.com/app/isppay-customer/id123456789', 1)
ON DUPLICATE KEY UPDATE latest_version = VALUES(latest_version);

-- 37. Dunning Rules (Automated billing alerts)
INSERT IGNORE INTO dunning_rules (admin_id, name, days_offset, channel, message, active)
VALUES 
(1001, 'Bill Due in 3 Days Reminder', -3, 'sms', 'Dear {customer_name}, your internet bill of Tk {amount} is due on {due_date}. Please pay to avoid suspension.', 1),
(1001, 'Bill Due Date Warning', 0, 'sms', 'Dear {customer_name}, today is the last date to pay your internet bill Tk {amount}. Pay now via bKash/Nagad.', 1),
(1001, 'Line Suspension Notice', 3, 'sms', 'Dear {customer_name}, your line is temporarily suspended due to unpaid bill. Pay immediately to auto-reconnect.', 1);

-- 38. Landing Testimonials
INSERT IGNORE INTO landing_testimonials (tenant_id, name, role, company, quote, rating, sort_order, is_active, status)
VALUES 
(1, 'Dr. Mahfuzur Rahman', 'Managing Director', 'Apex IT Park', 'ISP Pay has eliminated all our manual billing headaches. Instant online recharge works flawlessly!', 5, 1, 1, 'approved'),
(1, 'Nasir Uddin', 'Head of IT', 'Prime Textile Mills', 'Outstanding uptime and rapid support ticketing. The customer portal is very easy to use for our staff.', 5, 2, 1, 'approved'),
(1, 'Farhana Yesmin', 'Freelance Designer', 'Creative Hub', 'Super stable 30Mbps connection with zero packet loss. Online bill payment is super fast via Nagad.', 5, 3, 1, 'approved');

-- 39. Captive Pages (Hotspot login portal)
INSERT IGNORE INTO captive_pages (tenant_id, slug, title, body_html, status)
VALUES 
(1, 'alpha-public-wifi', 'Welcome to Alpha High-Speed Wi-Fi', '<h1>Welcome to Alpha High-Speed Public Wi-Fi</h1><p>Please enter your mobile number or voucher code to connect.</p>', 'active'),
(1, 'guest-lounge', 'VIP Guest Lounge Internet', '<h1>Alpha VIP Guest Wi-Fi</h1><p>Enjoy uninterrupted 20Mbps internet access during your visit.</p>', 'active');

-- 40. Customer Credit Notes
INSERT IGNORE INTO customer_credit_notes (tenant_id, customer_id, amount_cents, reason, created_by)
VALUES 
(1, 1041, 15000, 'Upstream backbone outage compensation (6 hours downtime)', 1001),
(1, 1042, 10000, 'Promotional referral credit discount', 1001);

-- 41. Usage Alert Rules
INSERT IGNORE INTO usage_alert_rules (admin_id, name, quota_gb, threshold_pct, channel, message, active)
VALUES 
(1001, '80% Monthly Data Usage Warning', 100.00, 80, 'sms', 'Dear {customer_name}, you have reached 80% of your monthly data limit.', 1),
(1001, '95% Critical Data Limit Alert', 100.00, 95, 'sms', 'Dear {customer_name}, 95% data consumed. Consider purchasing an addon package to stay connected.', 1);

-- 42. WhatsApp Templates
INSERT IGNORE INTO whatsapp_templates (tenant_id, name, body, status, language, category)
VALUES 
(1, 'monthly_bill_notification', 'Hello {{1}}, your monthly ISP bill of BDT {{2}} for the month of {{3}} is ready. Pay online: {{4}}', 'active', 'en', 'UTILITY'),
(1, 'payment_success_receipt', 'Thank you {{1}}! Your payment of BDT {{2}} (TrxID: {{3}}) was successful. Your account validity is extended to {{4}}.', 'active', 'en', 'UTILITY'),
(1, 'ticket_status_update', 'Dear {{1}}, your support ticket #{{2}} ({3}) status has been updated to: {{4}}.', 'active', 'en', 'UTILITY');

-- 43. Hotspot Profiles
INSERT IGNORE INTO hotspot_profiles (tenant_id, router_id, name, rate_limit, shared_users, address_pool, validity, price_cents, selling_price_cents, status)
VALUES 
(1, 1, '1 Hour Free Wi-Fi', '5M/5M', 1, 'dhcp_pool_hotspot', '1h', 0, 0, 'active'),
(1, 1, '1 Day 10Mbps Unlimited', '10M/10M', 1, 'dhcp_pool_hotspot', '1d', 3000, 3000, 'active'),
(1, 1, '7 Days 15Mbps Student Pack', '15M/15M', 1, 'dhcp_pool_hotspot', '7d', 15000, 15000, 'active');

-- 44. Hotspot Users
INSERT IGNORE INTO hotspot_users (tenant_id, router_id, profile_id, username, password_hint, status, comment)
VALUES 
(1, 1, 1, 'guest_visitor_01', 'guest123', 'active', 'Cafeteria visitor daily voucher'),
(1, 1, 2, 'student_0842', 'pass789', 'active', 'Campus library 1-day pass');

SET FOREIGN_KEY_CHECKS = 1;
