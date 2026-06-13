# Companies API

## GET `/api/companies`

List companies scoped to the provided `user_id`.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | ✅ | Your user ID |
| `search` | string | | Filter by company name (case-insensitive) |
| `limit` | number | | Max results (default `50`, max `200`) |
| `offset` | number | | Pagination offset (default `0`) |

### Example Request

```bash
curl "/api/companies?user_id=<user_id>"
```

### Example Response

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Acme Inc.",
      "domain": "acme.com",
      "country": "US",
      "industry": "Technology",
      "description": null,
      "email": "hello@acme.com",
      "phone": null,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

---

## POST `/api/companies`

Create a new company.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | ✅ | Your user ID |
| `name` | string | ✅ | Company name |
| `domain` | string | | Website domain (e.g. `acme.com`) |
| `country` | string | | Country name or code |
| `industry` | string | | Industry category |
| `description` | string | | Short description |
| `email` | string | | Company contact email |
| `phone` | string | | Phone number |

### Example Request

```bash
curl -X POST "/api/companies" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<user_id>","name":"Globex Corp","domain":"globex.com","industry":"Manufacturing"}'
```

### Example Response

```json
{
  "data": {
    "id": "uuid",
    "name": "Globex Corp",
    "domain": "globex.com",
    "country": null,
    "industry": "Manufacturing",
    "description": null,
    "email": null,
    "phone": null,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```
