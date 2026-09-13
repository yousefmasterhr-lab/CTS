// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Telemetry & Device Metadata Capture
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import { DeviceTelemetry } from '../types/ticket';
import { User } from '../types/auth';

export function captureDeviceTelemetry(user: User | null, currentRoute = window.location.pathname): DeviceTelemetry {
  const ua = navigator.userAgent;

  // Browser detection
  let browser = 'Unknown Browser';
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';

  // OS detection
  let os = 'Unknown OS';
  if (ua.includes('Windows NT 10.0')) os = 'Windows 11 / 10';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  const resolution = `${window.screen.width}x${window.screen.height} (${window.devicePixelRatio}x)`;

  return {
    current_route: currentRoute,
    user_id: user?.id || 'anonymous',
    user_role: user?.system_role || 'Viewer',
    user_name: user?.full_name || 'Guest User',
    browser,
    os,
    screen_resolution: resolution,
    user_agent: ua,
    timestamp: new Date().toISOString()
  };
}
