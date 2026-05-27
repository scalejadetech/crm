export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type DealStage = 'Lead' | 'Discovery' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost'

export interface Database {
  crm: {
    Tables: {
      tags: {
        Row: {
          id: string
          name: string
          color: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          name: string
          domain: string | null
          country: string | null
          industry: string | null
          description: string | null
          email: string | null
          phone: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          domain?: string | null
          country?: string | null
          industry?: string | null
          description?: string | null
          email?: string | null
          phone?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          country?: string | null
          industry?: string | null
          description?: string | null
          email?: string | null
          phone?: string | null
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          id: string
          full_name: string
          email: string
          contact_number: string | null
          linkedin_url: string | null
          notes: string | null
          company_id: string | null
          user_id: string
          last_contacted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          contact_number?: string | null
          linkedin_url?: string | null
          notes?: string | null
          company_id?: string | null
          user_id: string
          last_contacted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          contact_number?: string | null
          linkedin_url?: string | null
          notes?: string | null
          company_id?: string | null
          user_id?: string
          last_contacted_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      contact_tags: {
        Row: {
          contact_id: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          tag_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          html_content: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          subject?: string
          html_content?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          html_content?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          id: string
          title: string
          value: number
          stage: DealStage
          contact_id: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          value?: number
          stage?: DealStage
          contact_id?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          value?: number
          stage?: DealStage
          contact_id?: string | null
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tag = Database['crm']['Tables']['tags']['Row']
export type Company = Database['crm']['Tables']['companies']['Row']
export type Contact = Database['crm']['Tables']['contacts']['Row']
export type ContactTag = Database['crm']['Tables']['contact_tags']['Row']
export type Deal = Database['crm']['Tables']['deals']['Row']

export type EmailTemplate = Database['crm']['Tables']['email_templates']['Row']

export type ContactWithRelations = Contact & {
  companies: Company | null
  contact_tags: Array<{ tags: Tag }>
}

export type DealWithRelations = Deal & {
  contacts: (Contact & { companies: Company | null }) | null
}
