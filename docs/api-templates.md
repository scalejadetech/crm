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

---

## POST `/api/templates/upload`

Upload a Markdown file (or raw Markdown text), convert it to HTML, and store it
as an email template. Accepts either a `multipart/form-data` file upload or a
JSON body with raw Markdown.

### Multipart Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | ✅ | Your user ID |
| `file` | file | ✅ | A `.md` / `.markdown` file |
| `name` | string | | Template display name (defaults to the file name) |
| `subject` | string | | Default subject line for this template |

> Instead of `file`, you may send a `markdown` form field with raw Markdown
> text. When using `markdown`, `name` is required.

### JSON Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | ✅ | Your user ID |
| `name` | string | ✅ | Template display name |
| `markdown` | string | ✅ | Raw Markdown content to convert |
| `subject` | string | | Default subject line for this template |

The Markdown is rendered to HTML and stored in `html_content`. The
[supported variables](#supported-variables) above also work inside the
Markdown source.

### Example Request

```bash
# File upload
curl -X POST "/api/templates/upload" \
  -F "user_id=<user_id>" \
  -F "name=Welcome" \
  -F "subject=Welcome, {{full_name}}!" \
  -F "file=@welcome.md"

# Raw Markdown (JSON)
curl -X POST "/api/templates/upload" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "<user_id>",
    "name": "Welcome",
    "markdown": "# Hi {{full_name}}\n\nThanks for joining."
  }'
```

### Example Response

```json
{
  "data": {
    "id": "uuid",
    "name": "Welcome",
    "subject": "Welcome, {{full_name}}!",
    "html_content": "<h1>Hi {{full_name}}</h1>\n<p>Thanks for joining.</p>",
    "user_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```
