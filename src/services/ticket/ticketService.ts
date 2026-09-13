// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// In-App Bug Reporting & Issue Ticketing Service
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import { IssueTicket, TicketStatus } from '../../types/ticket';
import { INITIAL_TICKETS } from '../db/seedData';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '../../types/api';
import { telegramService } from '../telegram/telegramService';

const TICKET_STORAGE_KEY = 'pcms_issue_tickets';

export class TicketService {
  private static instance: TicketService;

  private constructor() {
    this.initStorage();
  }

  public static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
  }

  private initStorage(): void {
    if (!localStorage.getItem(TICKET_STORAGE_KEY)) {
      localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
    }
  }

  public getTickets(): IssueTicket[] {
    try {
      const raw = localStorage.getItem(TICKET_STORAGE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  }

  public getTicketsByUser(userId: string): IssueTicket[] {
    return this.getTickets().filter(t => t.telemetry.user_id === userId);
  }

  public async createTicket(ticketData: Omit<IssueTicket, 'ticket_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<IssueTicket>> {
    try {
      const tickets = this.getTickets();
      const ticketId = `TCK-2026-${String(tickets.length + 1).padStart(3, '0')}`;
      const now = new Date().toISOString();

      const newTicket: IssueTicket = {
        ...ticketData,
        ticket_id: ticketId,
        created_at: now,
        updated_at: now,
      };

      tickets.unshift(newTicket);
      localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(tickets));

      // Dispatch to Telegram bots configured for 'user_bug_reports'
      await telegramService.dispatchEvent('user_bug_reports', {
        origin: 'PCMS In-App Ticket Engine',
        project_code_name: 'All Projects / Cross-Platform',
        module: 'Tickets',
        severity: newTicket.category === 'Bug / Error' ? 'WARNING' : 'INFO',
        event: `بلاغ مستخدم جديد [${newTicket.category}]: ${newTicket.title}`,
        actor: `${newTicket.telemetry.user_name} (${newTicket.telemetry.user_role})`,
        timestamp: now.replace('T', ' ').substring(0, 19),
        reference: ticketId
      });

      return createSuccessResponse(newTicket);
    } catch (err: any) {
      return createErrorResponse('TICKET_CREATE_FAILED', err?.message || 'Failed to create ticket');
    }
  }

  public updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    adminRemarks?: string,
    assignedAdmin?: string
  ): ApiResponse<IssueTicket> {
    try {
      const tickets = this.getTickets();
      const idx = tickets.findIndex(t => t.ticket_id === ticketId);
      if (idx === -1) {
        return createErrorResponse('TICKET_NOT_FOUND', 'Ticket not found');
      }

      const now = new Date().toISOString();
      const current = tickets[idx];
      current.status = status;
      current.updated_at = now;
      if (adminRemarks !== undefined) current.admin_resolution_remarks = adminRemarks;
      if (assignedAdmin !== undefined) current.assigned_admin = assignedAdmin;
      if (status === 'Resolved' || status === 'Declined') {
        current.resolved_at = now;
      }

      tickets[idx] = current;
      localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(tickets));
      return createSuccessResponse(current);
    } catch (err: any) {
      return createErrorResponse('TICKET_UPDATE_FAILED', err?.message || 'Failed to update ticket');
    }
  }
}

export const ticketService = TicketService.getInstance();
