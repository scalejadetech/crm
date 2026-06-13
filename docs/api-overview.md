# CRM API Overview

Base URL: `/api`

All responses are JSON. No authentication headers required.  
Every request must include a `user_id` parameter — as a query param for `GET`, or in the JSON body for `POST`.

## Resources

| Resource | Endpoint |
|----------|----------|
| Contacts | `/api/contacts` |
| Companies | `/api/companies` |
| Email Drafts | `/api/emails` |
| Email Templates | `/api/templates` |

## Common Parameters

| Parameter | Type | Where | Description |
|-----------|------|--------|-------------|
| `user_id` | string | query / body | **Required.** Scopes the request to your account |
| `limit` | number | query | Max results to return (default `50`, max `200`) |
| `offset` | number | query | Pagination offset (default `0`) |

## Error Responses

All errors return a JSON object with an `error` field.

| Status | Meaning |
|--------|---------|
| `400` | Invalid JSON body |
| `422` | Missing required field |
| `500` | Database error |

**Example:**
```json
{ "error": "user_id is required" }
```
