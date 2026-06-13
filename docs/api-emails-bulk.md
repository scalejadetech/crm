# Bulk Email Drafts API

## POST `/api/emails/bulk`

Create multiple email drafts in a single request. All drafts are inserted atomically.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | ✅ | Your user ID |
| `drafts` | array | ✅ | Array of draft objects (see below) |

**Draft object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | ✅ | Email subject line |
| `body` | string | ✅ | Email body. Supports `{{full_name}}`, `{{email}}` variables |
| `recipients` | array | ✅ | Array of `{contact_id, email, full_name}` objects |
| `is_html` | boolean | | `true` if body contains HTML (default `false`) |

**Recipient object:**

| Field | Type | Description |
|-------|------|-------------|
| `email` | string | Recipient email address |
| `full_name` | string | Recipient display name |
| `contact_id` | string \| null | UUID of a linked contact, or `null` |

### Validation

- Returns `422` if `user_id` is missing.
- Returns `422` if `drafts` is empty or not an array.
- Returns `422` if any draft is missing `subject`, `body`, or `recipients` — the error message includes the index, e.g. `drafts[1]: subject, body, and recipients are required`.

### Example Request

```bash
curl -X POST "/api/emails/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "<user_id>",
    "drafts": [
      {
        "subject": "Hello {{full_name}}",
        "body": "Hi {{full_name}}, just checking in.",
        "recipients": [
          { "contact_id": null, "email": "alice@example.com", "full_name": "Alice" }
        ]
      },
      {
        "subject": "Follow up",
        "body": "<h1>Hi {{full_name}}</h1><p>Wanted to reconnect.</p>",
        "is_html": true,
        "recipients": [
          { "contact_id": "uuid", "email": "bob@example.com", "full_name": "Bob" }
        ]
      }
    ]
  }'
```

### Example Response

```json
{
  "data": [
    {
      "id": "uuid-1",
      "subject": "Hello {{full_name}}",
      "body": "Hi {{full_name}}, just checking in.",
      "is_html": false,
      "recipients": [
        { "contact_id": null, "email": "alice@example.com", "full_name": "Alice" }
      ],
      "user_id": "<user_id>",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid-2",
      "subject": "Follow up",
      "body": "<h1>Hi {{full_name}}</h1><p>Wanted to reconnect.</p>",
      "is_html": true,
      "recipients": [
        { "contact_id": "uuid", "email": "bob@example.com", "full_name": "Bob" }
      ],
      "user_id": "<user_id>",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 2
}
```

## Template Variables

Variables in `subject` and `body` are replaced per recipient at send time:

| Variable | Replaced with |
|----------|---------------|
| `{{full_name}}` | Recipient's full name |
| `{{email}}` | Recipient's email address |
| `{{company_name}}` | *(blank — reserved)* |
