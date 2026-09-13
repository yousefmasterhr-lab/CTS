// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Engineering Projects Schema
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

export type ProjectStatus = 'Active' | 'Suspended' | 'Handed_Over';
export type CurrencyCode = 'EGP' | 'SAR' | 'USD' | 'EUR' | 'AED';

export interface Project {
  project_id: string;          // e.g. "PRJ-1233" or "1233"
  project_code: string;        // Short code, e.g. "1233"
  project_name: string;        // Official name
  client_name: string;         // Owner
  consultant_name: string;     // Consultant entity
  contractor_name: string;     // Contractor entity
  project_status: ProjectStatus;
  start_date: string;
  end_date?: string;
  location?: string;
  total_budget?: number;
  total_budget_sar?: number;
  currency?: CurrencyCode;     // default: 'EGP'
  description?: string;
  scope_of_work?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, { label: string; bg: string; text: string; border: string }> = {
  Active: { label: 'قيد التنفيذ', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Suspended: { label: 'معلق / متوقف', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  Handed_Over: { label: 'تم التسليم النهائي', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' }
};
