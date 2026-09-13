// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Multi-Bot Telegram Integration Hub & Standardized Dispatcher
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import { TelegramBotConfig, TelegramDispatcherPayload, TelegramEventType } from '../../types/telegram';
import { INITIAL_TELEGRAM_BOTS } from '../db/seedData';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '../../types/api';

const TELEGRAM_STORAGE_KEY = 'pcms_telegram_bots';

export class TelegramService {
  private static instance: TelegramService;

  private constructor() {
    this.initStorage();
  }

  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  private initStorage(): void {
    if (!localStorage.getItem(TELEGRAM_STORAGE_KEY)) {
      localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(INITIAL_TELEGRAM_BOTS));
    }
  }

  public getBots(): TelegramBotConfig[] {
    try {
      const raw = localStorage.getItem(TELEGRAM_STORAGE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_TELEGRAM_BOTS;
    } catch {
      return INITIAL_TELEGRAM_BOTS;
    }
  }

  public saveBot(bot: TelegramBotConfig): ApiResponse<TelegramBotConfig> {
    try {
      const bots = this.getBots();
      const existingIdx = bots.findIndex(b => b.bot_id === bot.bot_id);
      if (existingIdx >= 0) {
        bots[existingIdx] = bot;
      } else {
        bots.push(bot);
      }
      localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(bots));
      return createSuccessResponse(bot);
    } catch (err: any) {
      return createErrorResponse('BOT_SAVE_FAILED', err?.message || 'Could not save bot configuration');
    }
  }

  public deleteBot(botId: string): ApiResponse<boolean> {
    try {
      const bots = this.getBots().filter(b => b.bot_id !== botId);
      localStorage.setItem(TELEGRAM_STORAGE_KEY, JSON.stringify(bots));
      return createSuccessResponse(true);
    } catch (err: any) {
      return createErrorResponse('BOT_DELETE_FAILED', err?.message || 'Could not delete bot');
    }
  }

  /**
   * Formats the message payload strictly conforming to the Mission Directive standard.
   */
  public formatScannablePayload(payload: TelegramDispatcherPayload): string {
    return [
      `🔔 [ORIGIN: ${payload.origin || 'PCMS Engine'}]`,
      `📁 PROJECT: [${payload.project_code_name}]`,
      `🏢 MODULE: [${payload.module}]`,
      `⚡ SEVERITY: [${payload.severity}]`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `📝 EVENT: [${payload.event}]`,
      `👤 ACTOR: [${payload.actor}]`,
      `🕒 TIMESTAMP: [${payload.timestamp}]`,
      `🔗 REFERENCE: [${payload.reference}]`
    ].join('\n');
  }

  /**
   * Dispatches a notification across all registered Telegram Bots matching the specified event scope.
   */
  public async dispatchEvent(
    eventType: TelegramEventType,
    payload: TelegramDispatcherPayload
  ): Promise<{ dispatched_count: number; formatted_message: string; errors: string[] }> {
    const bots = this.getBots();
    const activeScopedBots = bots.filter(b => b.is_active && b.scopes[eventType] === true);
    const messageText = this.formatScannablePayload(payload);
    const errors: string[] = [];
    let dispatchedCount = 0;

    for (const bot of activeScopedBots) {
      // If live token format (containing a colon and numeric id), attempt actual Telegram HTTP API call
      if (bot.bot_token && bot.bot_token.includes(':') && !bot.bot_token.includes('DEMO')) {
        try {
          const url = `https://api.telegram.org/bot${bot.bot_token}/sendMessage`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: bot.default_chat_id,
              text: messageText,
              parse_mode: 'HTML'
            })
          });
          const resJson = await response.json();
          if (resJson.ok) {
            dispatchedCount++;
          } else {
            errors.push(`Bot [${bot.bot_name}]: ${resJson.description || 'API Error'}`);
          }
        } catch (err: any) {
          errors.push(`Bot [${bot.bot_name}]: Network error - ${err.message}`);
        }
      } else {
        // In local/simulated demo mode, log the dispatched payload cleanly
        console.info(`[Telegram Simulated Dispatch] -> [${bot.bot_name}]:\n`, messageText);
        dispatchedCount++;
      }

      // Update last dispatched timestamp
      bot.last_dispatched_at = new Date().toISOString();
      this.saveBot(bot);
    }

    return {
      dispatched_count: dispatchedCount,
      formatted_message: messageText,
      errors
    };
  }
}

export const telegramService = TelegramService.getInstance();
