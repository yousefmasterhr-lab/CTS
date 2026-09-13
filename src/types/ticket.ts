// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// In-App Bug Reporting & Issue Ticketing Schema
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

export type TicketCategory = 'Bug / Error' | 'System Glitch' | 'Feature Request / Idea';

export type TicketStatus = 'New' | 'In_Review' | 'In_Progress' | 'Resolved' | 'Declined';

export interface DeviceTelemetry {
  current_route: string;
  user_id: string;
  user_role: string;
  user_name: string;
  browser: string;
  os: string;
  screen_resolution: string;
  user_agent: string;
  timestamp: string;
}

export interface IssueTicket {
  ticket_id: string;                  // e.g. "TCK-2026-001"
  category: TicketCategory;
  title: string;
  description: string;
  reproduction_steps?: string;
  screenshot_data_url?: string;       // Base64 screenshot from clipboard or file
  screenshot_file_name?: string;
  telemetry: DeviceTelemetry;
  status: TicketStatus;
  admin_resolution_remarks?: string;
  assigned_admin?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}
