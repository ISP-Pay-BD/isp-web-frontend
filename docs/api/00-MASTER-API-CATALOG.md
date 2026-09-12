# ISP Pay BD — Master API Catalog & Architecture

> Complete reference index for all **488 registered Zapi and Core API endpoints** across the ISP Pay BD Platform.

## 1. System Overview & Base URLs

| Environment | Base URL | Auth Mechanism |
|---|---|---|
| **Local Development** | `http://localhost:8080/api` | JWT Bearer Token (`Authorization: Bearer <token>`) |
| **Staging** | `https://stage-api.isppaybd.com/api` | JWT Bearer Token |
| **Production** | `https://api.isppaybd.com/api` | JWT Bearer Token |

## 2. API Scope & Module Inventory

| Module | Endpoints Count | Specification Document |
|---|---|---|
| **Authentication & Sessions** | **3** | [`01-AUTH-API.md`](./01-AUTH-API.md) |
| **Reseller / Admin Portal** | **270** | [`02-RESELLER-ADMIN-PORTAL-API.md`](./02-RESELLER-ADMIN-PORTAL-API.md) |
| **Customer Portal & Self-Care** | **88** | [`03-CUSTOMER-PORTAL-API.md`](./03-CUSTOMER-PORTAL-API.md) |
| **Platform SuperAdmin** | **12** | [`04-PLATFORM-SUPERADMIN-API.md`](./04-PLATFORM-SUPERADMIN-API.md) |
| **Engines Suite, OLT & Hotspot** | **4** | [`05-EXTENDED-ENGINES-API.md`](./05-EXTENDED-ENGINES-API.md) |
| **AI Assistant & Leads** | **33** | [`06-AI-CHATBOT-API.md`](./06-AI-CHATBOT-API.md) |
| **Common & System Services** | **30** | [`07-COMMON-SYSTEM-API.md`](./07-COMMON-SYSTEM-API.md) |
| **Legacy & Webhook Callbacks** | **48** | [`08-LEGACY-AND-CALLBACKS-API.md`](./08-LEGACY-AND-CALLBACKS-API.md) |
| **Total Registered Endpoints** | **488** | |

## 3. Core Technical Guides
- 🔐 [Authentication, JWT & Role-Based Access Control](./GUIDE-AUTH-AND-PERMISSIONS.md)
- 📊 [Logging, Diagnostics & Error Handling Guide](./GUIDE-LOGGING-AND-ERRORS.md)
