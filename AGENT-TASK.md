# AGENT TASK — WT07 Admin Network

**Worktree:** `.worktrees/wt07-admin-network`  
**Branch:** `wt/07-admin-network`  
**Agent ID:** 07 of 10

---

## Mission

Build **network ops**: routers, OLT, bandwidth buy/sell, hotspot, network map/diagram, IP pools.

## Owned paths

| Path |
|------|
| `src/features/admin/routers/` |
| `src/features/admin/olt/` |
| `src/features/admin/bandwidth/**` |
| `src/features/admin/hotspot/` |
| `src/features/admin/network/**` |
| `src/features/admin/ip-pools/` |
| Matching app routes + `src/data/admin/` |

## Reference

- `isppaybd_isp/app/Views/routers/`, `olt/`, `bandwidth/`, `bandwidth_sell/`, `hotspot/`, `network/`, `ip_pools/`

## Notes

- Network diagram: static SVG / React Flow with mock nodes
- Network map: static image + pins (no live Mapbox key)

## DO NOT touch

- Customers (WT05), HR/finance (WT06), SMS (WT08)

## Done when

- [x] All owned screens pass DoD
- [x] Status badges for online/offline
- [x] `font-mono` for IP/MAC
- [x] Verify commands pass

## Skill

`.cursor/skills/isp-pay-bd/SKILL.md`
