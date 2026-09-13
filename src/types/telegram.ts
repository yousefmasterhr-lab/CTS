// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Multi-Bot Telegram Integration Hub Type Definitions
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

export type TelegramEventType = 
  | 'critical_errors'        // Critical System Errors (Admin only)
  | 'sla_overdue'           // Contractual SLA Overdue Breaches
  | 'inbound_logs'           // New Inbound Logs & Intake
  | 'outbound_approvals'     // Outbound Approvals & Stamping
  | 'internal_tasks'         // Internal Engineering Task Assignments
  | 'user_bug_reports';      // User Bug Reports & System Feedback

export interface TelegramBotScopingMatrix {
  critical_errors: boolean;
  sla_overdue: boolean;
  inbound_logs: boolean;
  outbound_approvals: boolean;
  internal_tasks: boolean;
  user_bug_reports: boolean;
}

export interface TelegramBotConfig {
  bot_id: string;
  bot_name: string;                   // e.g. "Admin Master Bot", "Site Alerts Bot"
  bot_token: string;                  // Telegram BotFather token
  default_chat_id: string;            // Default Channel or Group Chat ID
  is_active: boolean;                 // Active toggle
  description?: string;
  scopes: TelegramBotScopingMatrix;   // Granular event permissions
  created_at: string;
  last_dispatched_at?: string;
}

export interface TelegramDispatcherPayload {
  origin: string;                     // Default: "PCMS Engine"
  project_code_name: string;          // e.g. "1233 - مبنى الحراص وزارة الداخلية"
  module: 'Inbound' | 'Outbound' | 'Tickets' | 'SLA' | 'System';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  event: string;                      // Action taken / Event summary
  actor: string;                      // User Name / Role
  timestamp: string;                  // 2026-MM-DD HH:mm:ss
  reference: string;                  // Document Serial / Ticket ID
}
