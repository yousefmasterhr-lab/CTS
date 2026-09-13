// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Stakeholder Entities Schema (Consultants, Clients, Contractors, Suppliers)
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

export type EntityRole = 
  | 'Consultant'       // مكتب استشاري
  | 'Owner'            // جهة مالكة / صاحب العمل
  | 'Main_Contractor'  // مقاول عام
  | 'Subcontractor'    // مقاول باطن
  | 'Supplier'         // مورد معتمد
  | 'Government';      // جهة حكومية / تنظيمية

export type LegalEntityType = 
  | 'Company'          // شركة
  | 'Legal_Entity'     // شخص اعتباري / هيئة / وزارة
  | 'Individual';      // شخص فردي / مكتب فردي

export type EntityStatus = 'Active' | 'Inactive';

export interface Entity {
  id: string;                  // Unique UUID, e.g. "ent-01"
  code: string;                // Short code / Acronym e.g. "CON", "CTR", "MOI", "CLI"
  name: string;                // Official Trade Name e.g. "مركز استشارات العفيفي الهندسي"
  short_name?: string;         // e.g. "استشارات العفيفي"
  role: EntityRole;            // Stakeholder classification
  legal_type: LegalEntityType; // Legal constitution
  registration_no?: string;    // السجل التجاري / رخصة المزاولة
  tax_no?: string;             // الرقم الضريبي
  contact_person?: string;     // الشخص المفوض / ضابط الاتصال
  contact_title?: string;      // المسمى الوظيفي
  phone?: string;              // هاتف أرضي
  mobile?: string;             // جوال / واتساب
  email?: string;              // البريد الإلكتروني الرسمي
  address?: string;            // المقر / العنوان
  website?: string;            // الموقع الإلكتروني
  status: EntityStatus;        // الحالة (نشط / غير نشط)
  notes?: string;              // ملاحظات عامة
  created_at: string;
  updated_at?: string;
}

export const ENTITY_ROLE_LABELS: Record<EntityRole, { label: string; bg: string; text: string; border: string }> = {
  Consultant: { label: 'مكتب استشاري', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  Owner: { label: 'جهة مالكة', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Main_Contractor: { label: 'مقاول عام', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  Subcontractor: { label: 'مقاول باطن', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  Supplier: { label: 'مورد معتمد', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  Government: { label: 'جهة حكومية', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' }
};

export const LEGAL_TYPE_LABELS: Record<LegalEntityType, string> = {
  Company: 'شركة',
  Legal_Entity: 'شخص اعتباري (هيئة/وزارة)',
  Individual: 'شخص فردي / مكتب فردي'
};
