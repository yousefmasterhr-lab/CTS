// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Standardized API Envelope Architecture
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: ApiError;
  timestamp: string;
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse<T = unknown>(code: string, message: string, details?: unknown): ApiResponse<T> {
  return {
    success: false,
    data: null as unknown as T,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}
