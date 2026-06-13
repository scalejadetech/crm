# Contacts API

## GET `/api/contacts`

List contacts scoped to the provided `user_id`.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | ✅ | Your user ID |
| `search` | string | | Filter by name or email (case-insensitive) |
| `limit` | number | | Max results (default `50`, max `200`) |
| `offset` | number | | Pagination offset (default `0`) |

### Example Request

```bash
curl "/api/contacts?user_id=<user_id>&limit=10"
```

### Example Response

```json
{
  "data": [
    {
      "id": "uuid",
      "full_name": "Jane Doe",
      "email": "jane@example.com",
      "contact_number": null,
      "linkedin_url": null,
      "notes": null,
      "company_id": "uuid",
      "last_contacted_at": null,
      "created_at": "2024-01-01T00:00:00Z",
      "companies": { "id": "uuid", "name": "Acme Inc." }
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

---

## POST `/api/contacts`

Create a new contact.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | ✅ | Your user ID |
| `full_name` | string | ✅ | Full name |
| `email` | string | ✅ | Email address |
| `contact_number` | string | | Phone number |
| `linkedin_url` | string | | LinkedIn profile URL |
| `notes` | string | | Free-form notes |
| `company_id` | string | | UUID of an existing company to link |

### Example Request

```bash
curl -X POST "/api/contacts" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<user_id>","full_name":"Jane Doe","email":"jane@example.com"}'
```

### Example Response

```json
{
  "data": {
    "id": "uuid",
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "contact_number": null,
    "linkedin_url": null,
    "notes": null,
    "company_id": null,
    "last_contacted_at": null,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```
