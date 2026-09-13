// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Authentication & RBAC Type Definitions
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

export type SystemRole = 
  | 'Admin'             // Super Admin: full management, audit logs, account provisioning
  | 'Doc_Controller'   // Document Controller: intake, atomic reservation, scanning, printing
  | 'Project_Manager'   // Project Manager: approvals, task routing, contractual SLA governance
  | 'Engineer'          // Site / Technical Engineer: drafts, submittals review, task fulfillment
  | 'Viewer';           // Auditor / Client Viewer: read-only reporting and dossiers

export interface User {
  id: string;                      // Unique ID (Firebase UID or persistent UUID)
  full_name: string;               // Full official employee name
  work_email: string;              // Company domain email
  system_role: SystemRole;         // RBAC Role
  department: string;              // Technical Office, Supervision, Executive, Legal
  assigned_projects: string[];     // Array of Project_IDs user can access ('ALL' for Admin)
  account_status: boolean;         // Active (true) or Suspended (false)
  avatar_url?: string;
  phone?: string;
  created_at: string;
  last_login?: string;
  custom_permissions?: string[];   // Individual granular permission overrides
}

export interface AuthSession {
  user: User;
  token: string;
  expires_at: number;
}
