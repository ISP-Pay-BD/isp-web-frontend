# Guide: Logging, Diagnostics & Error Handling

## 1. Standard Response Envelope
All API endpoints return standard JSON envelopes:

### Success Response (`200 OK` / `201 Created`)
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "id": 369,
    "name": "Parvez Rahman"
  },
  "error": null
}
```

### Paginated Success Response
```json
{
  "statusCode": 200,
  "success": true,
  "data": [...],
  "meta": {
    "total": 127,
    "page": 1,
    "limit": 20,
    "totalPages": 7
  }
}
```

### Error Response (`400`, `401`, `403`, `404`, `500`)
```json
{
  "statusCode": 404,
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found.",
    "details": []
  }
}
```

## 2. Server-side Logging (`isppaybd_isp`)
- Logs are written to `writable/logs/log-YYYY-MM-DD.log`.
- Format: `LEVEL - YYYY-MM-DD HH:MM:SS --> Message`
- Performance profiling: Every completed request logs `{ "method", "path", "status", "ms", "mem_kb", "ip", "ts" }`.
