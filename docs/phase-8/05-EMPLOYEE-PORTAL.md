# Phase 8 — Module 12: Employee Portal Integration

---

## 1. Overview
Self-service portal for ISP staff and technicians to view payslips, request advance salaries, log attendance, and manage tasks.

---

## 2. Endpoints & Integration Mapping

| Feature | Backend Endpoint | Method | Role Scope |
|---|---|---|---|
| **Salary Slips** | `GET /api/reseller/employee-payments/{resellerId}` | GET | Scoped to current employee token |
| **Salary Summary** | `GET /api/reseller/employee-payments/{resellerId}/salary-summary/{empId}/{month}` | GET | Breakdown of base, bonus, deductions |
| **Advance Salary History** | `GET /api/reseller/employees/{resellerId}/advance-salary` | GET | List submitted loan/advance requests |
| **Apply Advance Salary** | `POST /api/reseller/employees/{resellerId}/advance-salary` | POST | Submit advance request with reason & amount |
| **Check-In Attendance** | `POST /api/reseller/employees/{resellerId}/attendance/check-in` | POST | Record timestamp & IP |
| **Check-Out Attendance** | `POST /api/reseller/employees/{resellerId}/attendance/check-out` | POST | Log exit time |
| **My Attendance History** | `GET /api/reseller/employees/{resellerId}/attendance` | GET | Monthly attendance log |
| **Employee Profile** | `GET /api/v1/auth/me` | GET | Self profile details & role assignments |

---

## 3. Frontend Files to Wire

* `src/lib/api/services/employee.service.ts`
* `src/lib/api/adapters/employee.adapter.ts`
* `src/features/employee/salaries/hooks/`
* `src/features/employee/advance-salary/hooks/`
* `src/features/employee/attendance/hooks/`
* `src/features/employee/profile/hooks/`
