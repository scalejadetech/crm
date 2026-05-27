-- ─────────────────────────────────────────
-- Create & expose the crm schema
-- ─────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS crm;

GRANT USAGE ON SCHEMA crm TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA crm GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA crm GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA crm GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ─────────────────────────────────────────
-- TAGS
-- ─────────────────────────────────────────
CREATE TABLE crm.tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6366f1',
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE crm.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags: owner full access"
  ON crm.tags FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- COMPANIES
-- ─────────────────────────────────────────
CREATE TABLE crm.companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  domain      TEXT,
  country     TEXT,
  industry    TEXT,
  description TEXT,
  email       TEXT,
  phone       TEXT,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE crm.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies: owner full access"
  ON crm.companies FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- CONTACTS
-- ─────────────────────────────────────────
CREATE TABLE crm.contacts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name          TEXT NOT NULL,
  email              TEXT NOT NULL,
  contact_number     TEXT,
  linkedin_url       TEXT,
  notes              TEXT,
  company_id         UUID REFERENCES crm.companies(id) ON DELETE SET NULL,
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_contacted_at  TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE crm.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts: owner full access"
  ON crm.contacts FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- CONTACT_TAGS  (join table)
-- ─────────────────────────────────────────
CREATE TABLE crm.contact_tags (
  contact_id UUID NOT NULL REFERENCES crm.contacts(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES crm.tags(id)    ON DELETE CASCADE,
  PRIMARY KEY (contact_id, tag_id)
);

ALTER TABLE crm.contact_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_tags: owner full access"
  ON crm.contact_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM crm.contacts c
      WHERE c.id = contact_id AND c.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- DEALS
-- ─────────────────────────────────────────
CREATE TABLE crm.deals (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  value      NUMERIC DEFAULT 0,
  stage      TEXT NOT NULL DEFAULT 'Lead'
               CHECK (stage IN ('Lead','Discovery','Proposal','Negotiation','Won','Lost')),
  contact_id UUID REFERENCES crm.contacts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE crm.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals: owner full access"
  ON crm.deals FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- USER PROFILES  (mirror of auth.users)
-- ─────────────────────────────────────────
CREATE TABLE crm.user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE crm.user_profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can see the list
CREATE POLICY "user_profiles: authenticated read all"
  ON crm.user_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION crm.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO crm.user_profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION crm.handle_new_user();

-- ─────────────────────────────────────────
-- SMTP CONFIGS  (per user)
-- ─────────────────────────────────────────
CREATE TABLE crm.smtp_configs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  host       TEXT NOT NULL DEFAULT '',
  port       INTEGER NOT NULL DEFAULT 587,
  secure     BOOLEAN NOT NULL DEFAULT false,
  username   TEXT NOT NULL DEFAULT '',
  password   TEXT NOT NULL DEFAULT '',
  from_name  TEXT NOT NULL DEFAULT '',
  from_email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE crm.smtp_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "smtp_configs: owner full access"
  ON crm.smtp_configs FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- EMAIL TEMPLATES
-- ─────────────────────────────────────────
CREATE TABLE crm.email_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  subject      TEXT NOT NULL DEFAULT '',
  html_content TEXT NOT NULL DEFAULT '',
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE crm.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_templates: owner full access"
  ON crm.email_templates FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX ON crm.tags(user_id);
CREATE INDEX ON crm.companies(user_id);
CREATE INDEX ON crm.contacts(user_id);
CREATE INDEX ON crm.contacts(company_id);
CREATE INDEX ON crm.deals(user_id);
CREATE INDEX ON crm.deals(stage);
CREATE INDEX ON crm.email_templates(user_id);
CREATE INDEX ON crm.smtp_configs(user_id);

-- ─────────────────────────────────────────
-- BACKFILL existing auth users into profiles
-- ─────────────────────────────────────────
INSERT INTO crm.user_profiles (id, email, created_at)
SELECT id, email, created_at FROM auth.users
ON CONFLICT (id) DO NOTHING;
