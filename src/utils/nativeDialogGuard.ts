// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Native Browser Dialog Guard (Eliminating Native Alert & Popups)
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

/**
 * Intercepts legacy/native browser window.alert calls and routes them
 * through the architectural in-app notification system to ensure no
 * ugly default OS/browser dialogs ever interrupt the user experience.
 */
export function initializeNativeDialogGuard(): void {
  if (typeof window === 'undefined') return;

  const originalAlert = window.alert;

  window.alert = (message?: any) => {
    console.info('[PCMS DialogGuard] Native window.alert intercepted:', message);
    
    // Dispatch in-app system alert event
    window.dispatchEvent(
      new CustomEvent('pcms:system-alert', {
        detail: {
          title: 'تنبيه أمني وإداري من المنظومة',
          message: String(message ?? ''),
          type: 'warning'
        }
      })
    );
  };
}
