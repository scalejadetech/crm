# Email Templates API

## GET `/api/templates`

List email templates scoped to the provided `user_id`.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | ✅ | Your user ID |
| `search` | string | | Filter by template name (case-insensitive) |
| `limit` | number | | Max results (default `50`, max `200`) |
| `offset` | number | | Pagination offset (default `0`) |

### Example Request

```bash
curl "/api/templates?user_id=<user_id>"
```

### Example Response

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Welcome Email",
      "subject": "Welcome to our platform!",
      "html_content": "<h1>Hello {{full_name}}</h1><p>...</p>",
      "user_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0
}
```

---

## POST `/api/templates`

Create a new email template.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | ✅ | Your user ID |
| `name` | string | ✅ | Template display name |
| `html_content` | string | ✅ | Full HTML content of the template |
| `subject` | string | | Default subject line for this template |

### Supported Variables

Use these placeholders inside `html_content` and `subject` — they are replaced per recipient when sending:

| Variable | Description |
|----------|-------------|
| `{{full_name}}` | Recipient's full name |
| `{{email}}` | Recipient's email address |
| `{{company_name}}` | *(blank — reserved for future use)* |
| `{{contact_number}}` | Recipient's phone number |

### Example Request

```bash
curl -X POST "/api/templates" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "<user_id>",
    "name": "Onboarding",
    "subject": "Welcome, {{full_name}}!",
    "html_content": "<h1>Hi {{full_name}}</h1><p>Thanks for joining.</p>"
  }'
```

### Example Response

```json
{
  "data": {
    "id": "uuid",
    "name": "Onboarding",
    "subject": "Welcome, {{full_name}}!",
    "html_content": "<h1>Hi {{full_name}}</h1><p>Thanks for joining.</p>",
    "user_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```
