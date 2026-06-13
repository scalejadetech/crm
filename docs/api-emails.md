# Email Drafts API

Email drafts are per-user. Always pass `user_id` to scope results.

## GET `/api/emails`

List email drafts for a user.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | ✅ | Your user ID |
| `limit` | number | | Max results (default `50`, max `200`) |
| `offset` | number | | Pagination offset (default `0`) |

### Example Request

```bash
curl "/api/emails?user_id=<user_id>"
```

### Example Response

```json
{
  "data": [
    {
      "id": "uuid",
      "subject": "Hello world",
      "body": "Dear {{full_name}}, ...",
      "is_html": false,
      "recipients": [
        {
          "contact_id": "uuid",
          "email": "jane@example.com",
          "full_name": "Jane Doe"
        }
      ],
      "user_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 3,
  "limit": 50,
  "offset": 0
}
```

---

## POST `/api/emails`

Create a new email draft.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | ✅ | Your user ID |
| `subject` | string | ✅ | Email subject line |
| `body` | string | ✅ | Email body. Supports `{{full_name}}`, `{{email}}` variables |
| `recipients` | array | ✅ | Array of recipient objects (see below) |
| `is_html` | boolean | | `true` if body contains HTML (default `false`) |

**Recipient object:**

| Field | Type | Description |
|-------|------|-------------|
| `email` | string | Recipient email address |
| `full_name` | string | Recipient display name |
| `contact_id` | string \| null | UUID of a linked contact, or `null` |

### Example Request

```bash
curl -X POST "/api/emails" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "<user_id>",
    "subject": "Hi there",
    "body": "Hello {{full_name}}, ...",
    "recipients": [
      { "contact_id": null, "email": "bob@example.com", "full_name": "Bob" }
    ]
  }'
```

### Example Response

```json
{
  "data": {
    "id": "uuid",
    "subject": "Hi there",
    "body": "Hello {{full_name}}, ...",
    "is_html": false,
    "recipients": [
      { "contact_id": null, "email": "bob@example.com", "full_name": "Bob" }
    ],
    "user_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

## Template Variables

The `body` and `subject` fields support these variables which are replaced per recipient at send time:

| Variable | Replaced with |
|----------|---------------|
| `{{full_name}}` | Recipient's full name |
| `{{email}}` | Recipient's email address |
| `{{company_name}}` | *(blank — for future use)* |
