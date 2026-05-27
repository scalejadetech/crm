-- Drop all CRM tables and schema
DROP TABLE IF EXISTS crm.contact_tags    CASCADE;
DROP TABLE IF EXISTS crm.deals           CASCADE;
DROP TABLE IF EXISTS crm.contacts        CASCADE;
DROP TABLE IF EXISTS crm.companies       CASCADE;
DROP TABLE IF EXISTS crm.tags            CASCADE;
DROP TABLE IF EXISTS crm.email_templates CASCADE;
DROP TABLE IF EXISTS crm.smtp_configs    CASCADE;
DROP TABLE IF EXISTS crm.user_profiles   CASCADE;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS crm.handle_new_user();

DROP SCHEMA IF EXISTS crm CASCADE;
