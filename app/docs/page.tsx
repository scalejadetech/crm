'use client'

import { useState } from 'react'
import { Copy, Check, Code2, ChevronDown, ChevronUp, Terminal, Database, AlertTriangle } from 'lucide-react'

const BASE = ''

// ─── helpers ─────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <pre className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto text-zinc-300 leading-relaxed">
        {code}
      </pre>
      <div className="absolute top-2 right-2">
        <CopyButton text={code} />
      </div>
    </div>
  )
}

// ─── endpoint ─────────────────────────────────────────────────────────────────

interface Param { name: string; type: string; required?: boolean; description: string }

interface EndpointProps {
  method: 'GET' | 'POST'
  path: string
  description: string
  queryParams?: Param[]
  bodyParams?: Param[]
  exampleRequest: string
  exampleResponse: string
}

function Endpoint({ method, path, description, queryParams, bodyParams, exampleRequest, exampleResponse }: EndpointProps) {
  const [open, setOpen] = useState(false)
  const methodColor = method === 'GET'
    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50'
    : 'text-blue-400 bg-blue-950/40 border-blue-800/50'

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/40 transition-colors">
        <span className={`text-xs font-bold px-2 py-0.5 rounded border font-mono shrink-0 ${methodColor}`}>{method}</span>
        <code className="text-sm text-zinc-200 font-mono flex-1">{path}</code>
        <span className="text-xs text-zinc-500 hidden sm:block flex-1">{description}</span>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-zinc-800 px-4 py-4 space-y-5 bg-zinc-900/50">
          <p className="text-sm text-zinc-400">{description}</p>

          {queryParams && queryParams.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Query Parameters</p>
              <div className="border border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-800">
                {queryParams.map(p => (
                  <div key={p.name} className="flex items-start gap-3 px-3 py-2.5">
                    <code className="text-indigo-400 font-mono text-xs shrink-0 mt-0.5 w-24">{p.name}</code>
                    <span className="text-zinc-600 text-xs shrink-0 mt-0.5 w-12">{p.type}</span>
                    {p.required && <span className="text-red-400 text-xs shrink-0 mt-0.5 w-12">required</span>}
                    <span className="text-zinc-400 text-xs">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bodyParams && bodyParams.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Request Body (JSON)</p>
              <div className="border border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-800">
                {bodyParams.map(p => (
                  <div key={p.name} className="flex items-start gap-3 px-3 py-2.5">
                    <code className="text-indigo-400 font-mono text-xs shrink-0 mt-0.5 w-24">{p.name}</code>
                    <span className="text-zinc-600 text-xs shrink-0 mt-0.5 w-12">{p.type}</span>
                    {p.required && <span className="text-red-400 text-xs shrink-0 mt-0.5 w-12">required</span>}
                    <span className="text-zinc-400 text-xs">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Example Request</p>
            <CodeBlock code={exampleRequest} />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Example Response</p>
            <CodeBlock code={exampleResponse} />
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
        <Code2 className="w-4 h-4 text-indigo-400" />
        <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10 pb-20">
      <div className="pt-2">
        <h1 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
          <Terminal className="w-7 h-7 text-indigo-400" /> API Reference
        </h1>
        <p className="text-zinc-400 mt-2">
          Programmatic access to CRM data. No authentication headers required. All responses are JSON.
        </p>
      </div>

      {/* Base URL */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-zinc-100">Base URL</h2>
        <CodeBlock code={`${BASE}/api`} />
        <p className="text-sm text-zinc-400">
          Every request — GET and POST — requires a <code className="text-indigo-400 text-xs bg-zinc-800 px-1.5 py-0.5 rounded">user_id</code> parameter.
          For GET requests pass it as a query param. For POST requests include it in the JSON body.
          Missing <code className="text-indigo-400 text-xs bg-zinc-800 px-1.5 py-0.5 rounded">user_id</code> returns <code className="text-red-400 text-xs bg-zinc-800 px-1.5 py-0.5 rounded">422</code>.
        </p>
      </div>

      {/* Contacts */}
      <Section title="Contacts">
        <Endpoint
          method="GET"
          path="/api/contacts"
          description="List contacts scoped to the provided user_id."
          queryParams={[
            { name: 'user_id', type: 'string', required: true, description: 'Your user ID' },
            { name: 'search', type: 'string', description: 'Filter by name or email (case-insensitive)' },
            { name: 'limit', type: 'number', description: 'Max results (default 50, max 200)' },
            { name: 'offset', type: 'number', description: 'Pagination offset (default 0)' },
          ]}
          exampleRequest={`curl "${BASE}/api/contacts?user_id=<user_id>&limit=10"`}
          exampleResponse={`{
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
}`}
        />
        <Endpoint
          method="POST"
          path="/api/contacts"
          description="Create a new contact."
          bodyParams={[
            { name: 'user_id', type: 'string', required: true, description: 'Your user ID' },
            { name: 'full_name', type: 'string', required: true, description: 'Full name' },
            { name: 'email', type: 'string', required: true, description: 'Email address' },
            { name: 'contact_number', type: 'string', description: 'Phone number' },
            { name: 'linkedin_url', type: 'string', description: 'LinkedIn profile URL' },
            { name: 'notes', type: 'string', description: 'Free-form notes' },
            { name: 'company_id', type: 'string', description: 'UUID of an existing company' },
          ]}
          exampleRequest={`curl -X POST "${BASE}/api/contacts" \\
  -H "Content-Type: application/json" \\
  -d '{"user_id":"<user_id>","full_name":"Jane Doe","email":"jane@example.com"}'`}
          exampleResponse={`{
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
}`}
        />
      </Section>

      {/* Companies */}
      <Section title="Companies">
        <Endpoint
          method="GET"
          path="/api/companies"
          description="List companies scoped to the provided user_id."
          queryParams={[
            { name: 'user_id', type: 'string', required: true, description: 'Your user ID' },
            { name: 'search', type: 'string', description: 'Filter by name (case-insensitive)' },
            { name: 'limit', type: 'number', description: 'Max results (default 50, max 200)' },
            { name: 'offset', type: 'number', description: 'Pagination offset (default 0)' },
          ]}
          exampleRequest={`curl "${BASE}/api/companies?user_id=<user_id>"`}
          exampleResponse={`{
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
}`}
        />
        <Endpoint
          method="POST"
          path="/api/companies"
          description="Create a new company."
          bodyParams={[
            { name: 'user_id', type: 'string', required: true, description: 'Your user ID' },
            { name: 'name', type: 'string', required: true, description: 'Company name' },
            { name: 'domain', type: 'string', description: 'Website domain (e.g. acme.com)' },
            { name: 'country', type: 'string', description: 'Country name or code' },
            { name: 'industry', type: 'string', description: 'Industry category' },
            { name: 'description', type: 'string', description: 'Short description' },
            { name: 'email', type: 'string', description: 'Company contact email' },
            { name: 'phone', type: 'string', description: 'Phone number' },
          ]}
          exampleRequest={`curl -X POST "${BASE}/api/companies" \\
  -H "Content-Type: application/json" \\
  -d '{"user_id":"<user_id>","name":"Globex Corp","domain":"globex.com"}'`}
          exampleResponse={`{
  "data": {
    "id": "uuid",
    "name": "Globex Corp",
    "domain": "globex.com",
    "country": null,
    "industry": null,
    "description": null,
    "email": null,
    "phone": null,
    "created_at": "2024-01-01T00:00:00Z"
  }
}`}
        />
      </Section>

      {/* Emails */}
      <Section title="Email Drafts">
        <Endpoint
          method="GET"
          path="/api/emails"
          description="List email drafts scoped to the provided user_id."
          queryParams={[
            { name: 'user_id', type: 'string', required: true, description: 'Your user ID' },
            { name: 'limit', type: 'number', description: 'Max results (default 50, max 200)' },
            { name: 'offset', type: 'number', description: 'Pagination offset (default 0)' },
          ]}
          exampleRequest={`curl "${BASE}/api/emails?user_id=<user_id>"`}
          exampleResponse={`{
  "data": [
    {
      "id": "uuid",
      "subject": "Hello world",
      "body": "Dear {{full_name}}, ...",
      "is_html": false,
      "recipients": [
        { "contact_id": "uuid", "email": "jane@example.com", "full_name": "Jane Doe" }
      ],
      "user_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 3,
  "limit": 50,
  "offset": 0
}`}
        />
        <Endpoint
          method="POST"
          path="/api/emails"
          description="Create a new email draft. Requires user_id."
          bodyParams={[
            { name: 'user_id', type: 'string', required: true, description: 'Owner user ID' },
            { name: 'subject', type: 'string', required: true, description: 'Email subject line' },
            { name: 'body', type: 'string', required: true, description: 'Email body. Supports {{full_name}}, {{email}} variables.' },
            { name: 'is_html', type: 'boolean', description: 'true if body is HTML (default false)' },
            { name: 'recipients', type: 'array', required: true, description: 'Array of {contact_id, email, full_name}. contact_id may be null.' },
          ]}
          exampleRequest={`curl -X POST "${BASE}/api/emails" \\
  -H "Content-Type: application/json" \\
  -d '{"user_id":"<user_id>","subject":"Hi","body":"Hello {{full_name}}","recipients":[{"contact_id":null,"email":"bob@example.com","full_name":"Bob"}]}'`}
          exampleResponse={`{
  "data": {
    "id": "uuid",
    "subject": "Hi",
    "body": "Hello {{full_name}}",
    "is_html": false,
    "recipients": [
      { "contact_id": null, "email": "bob@example.com", "full_name": "Bob" }
    ],
    "user_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}`}
        />
        <Endpoint
          method="POST"
          path="/api/emails/bulk"
          description="Create multiple email drafts in a single request."
          bodyParams={[
            { name: 'user_id', type: 'string', required: true, description: 'Your user ID' },
            { name: 'drafts', type: 'array', required: true, description: 'Array of draft objects (see fields below)' },
            { name: 'drafts[].subject', type: 'string', required: true, description: 'Email subject line' },
            { name: 'drafts[].body', type: 'string', required: true, description: 'Email body. Supports {{full_name}}, {{email}} variables.' },
            { name: 'drafts[].recipients', type: 'array', required: true, description: 'Array of {contact_id, email, full_name}' },
            { name: 'drafts[].is_html', type: 'boolean', description: 'true if body is HTML (default false)' },
          ]}
          exampleRequest={`curl -X POST "/api/emails/bulk" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_id": "<user_id>",
    "drafts": [
      {
        "subject": "Hello {{full_name}}",
        "body": "Hi {{full_name}}, just checking in.",
        "recipients": [{"contact_id": null, "email": "alice@example.com", "full_name": "Alice"}]
      },
      {
        "subject": "Follow up",
        "body": "<h1>Hi {{full_name}}</h1>",
        "is_html": true,
        "recipients": [{"contact_id": null, "email": "bob@example.com", "full_name": "Bob"}]
      }
    ]
  }'`}
          exampleResponse={`{
  "data": [
    {
      "id": "uuid-1",
      "subject": "Hello {{full_name}}",
      "body": "Hi {{full_name}}, just checking in.",
      "is_html": false,
      "recipients": [{"contact_id": null, "email": "alice@example.com", "full_name": "Alice"}],
      "user_id": "<user_id>",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid-2",
      "subject": "Follow up",
      "body": "<h1>Hi {{full_name}}</h1>",
      "is_html": true,
      "recipients": [{"contact_id": null, "email": "bob@example.com", "full_name": "Bob"}],
      "user_id": "<user_id>",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 2
}`}
        />
      </Section>

      {/* Templates */}
      <Section title="Email Templates">
        <Endpoint
          method="GET"
          path="/api/templates"
          description="List templates scoped to the provided user_id."
          queryParams={[
            { name: 'user_id', type: 'string', required: true, description: 'Your user ID' },
            { name: 'search', type: 'string', description: 'Filter by name (case-insensitive)' },
            { name: 'limit', type: 'number', description: 'Max results (default 50, max 200)' },
            { name: 'offset', type: 'number', description: 'Pagination offset (default 0)' },
          ]}
          exampleRequest={`curl "${BASE}/api/templates?user_id=<user_id>"`}
          exampleResponse={`{
  "data": [
    {
      "id": "uuid",
      "name": "Welcome Email",
      "subject": "Welcome!",
      "html_content": "<h1>Hello {{full_name}}</h1>",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0
}`}
        />
        <Endpoint
          method="POST"
          path="/api/templates"
          description="Create a new email template."
          bodyParams={[
            { name: 'user_id', type: 'string', required: true, description: 'Your user ID' },
            { name: 'name', type: 'string', required: true, description: 'Template display name' },
            { name: 'html_content', type: 'string', required: true, description: 'HTML content. Supports {{full_name}}, {{email}} variables.' },
            { name: 'subject', type: 'string', description: 'Default subject line' },
          ]}
          exampleRequest={`curl -X POST "${BASE}/api/templates" \\
  -H "Content-Type: application/json" \\
  -d '{"user_id":"<user_id>","name":"Onboarding","subject":"Welcome!","html_content":"<h1>Hi {{full_name}}</h1>"}'`}
          exampleResponse={`{
  "data": {
    "id": "uuid",
    "name": "Onboarding",
    "subject": "Welcome!",
    "html_content": "<h1>Hi {{full_name}}</h1>",
    "created_at": "2024-01-01T00:00:00Z"
  }
}`}
        />
      </Section>

      {/* SQL Migration */}
      <div className="bg-zinc-900 border border-amber-800/40 rounded-xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-zinc-100">Database Migration</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Run this once in your Supabase <span className="text-zinc-200 font-medium">SQL Editor</span> to switch
              companies, contacts, deals, tags, and templates to the shared model.
              Existing data is preserved. Email drafts remain per-user.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-950/30 border border-amber-800/30 rounded-lg text-xs text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Re-running is safe — all DROP POLICY statements use IF EXISTS.
        </div>
        <CodeBlock code={`-- ================================================================
-- Migration: shared data model
-- companies, contacts, deals, tags, email_templates → shared
-- email_drafts                                      → per-user (unchanged)
-- ================================================================

-- 1. Make user_id nullable on shared tables
ALTER TABLE crm.companies       ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE crm.contacts        ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE crm.deals           ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE crm.tags            ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE crm.email_templates ALTER COLUMN user_id DROP NOT NULL;

-- 2. Drop existing per-user policies
DROP POLICY IF EXISTS "Users can view their own companies"       ON crm.companies;
DROP POLICY IF EXISTS "Users can insert their own companies"     ON crm.companies;
DROP POLICY IF EXISTS "Users can update their own companies"     ON crm.companies;
DROP POLICY IF EXISTS "Users can delete their own companies"     ON crm.companies;

DROP POLICY IF EXISTS "Users can view their own contacts"        ON crm.contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts"      ON crm.contacts;
DROP POLICY IF EXISTS "Users can update their own contacts"      ON crm.contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts"      ON crm.contacts;

DROP POLICY IF EXISTS "Users can view their own deals"           ON crm.deals;
DROP POLICY IF EXISTS "Users can insert their own deals"         ON crm.deals;
DROP POLICY IF EXISTS "Users can update their own deals"         ON crm.deals;
DROP POLICY IF EXISTS "Users can delete their own deals"         ON crm.deals;

DROP POLICY IF EXISTS "Users can view their own tags"            ON crm.tags;
DROP POLICY IF EXISTS "Users can insert their own tags"          ON crm.tags;
DROP POLICY IF EXISTS "Users can update their own tags"          ON crm.tags;
DROP POLICY IF EXISTS "Users can delete their own tags"          ON crm.tags;

DROP POLICY IF EXISTS "Users can view their own templates"       ON crm.email_templates;
DROP POLICY IF EXISTS "Users can insert their own templates"     ON crm.email_templates;
DROP POLICY IF EXISTS "Users can update their own templates"     ON crm.email_templates;
DROP POLICY IF EXISTS "Users can delete their own templates"     ON crm.email_templates;

-- 3. Create shared policies (any authenticated user can read/write)
CREATE POLICY "shared_all" ON crm.companies
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "shared_all" ON crm.contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "shared_all" ON crm.deals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "shared_all" ON crm.tags
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "shared_all" ON crm.email_templates
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. contact_tags junction table
DROP POLICY IF EXISTS "Users can manage their own contact_tags"  ON crm.contact_tags;
CREATE POLICY "shared_all" ON crm.contact_tags
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. email_drafts: unchanged (stays per-user)

-- Verify:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'crm';`} />
      </div>

      {/* Errors */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-zinc-100">Error Responses</h2>
        <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-lg overflow-hidden">
          {[
            ['400', 'Bad Request', 'Request body is not valid JSON'],
            ['422', 'Unprocessable Entity', 'Required fields are missing'],
            ['500', 'Internal Server Error', 'Database error — see error field for details'],
          ].map(([code, name, desc]) => (
            <div key={code} className="flex items-start gap-3 px-3 py-2.5">
              <code className="text-red-400 font-mono text-xs shrink-0 mt-0.5 w-8">{code}</code>
              <span className="text-zinc-300 text-xs shrink-0 w-44">{name}</span>
              <span className="text-zinc-500 text-xs">{desc}</span>
            </div>
          ))}
        </div>
        <CodeBlock code={`{ "error": "full_name and email are required" }`} />
      </div>
    </div>
  )
}
