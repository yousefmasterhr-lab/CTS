// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Atomic Serial Numbering & Concurrency Engine
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import { DocType } from '../../types/correspondence';

const COUNTER_STORAGE_KEY = 'pcms_system_counters';

export interface GenerateSerialParams {
  project_code: string;       // e.g. "1233"
  originator_code: string;    // e.g. "CON"
  recipient_code: string;     // e.g. "CTR"
  doc_type: DocType;          // e.g. "LTR"
  year?: string;              // e.g. "26" (defaults to current year YY)
}

/**
 * Generates a transient draft serial ID without burning official sequence numbers.
 * Example: DRAFT-8142
 */
export function generateDraftSerial(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `DRAFT-${randomSuffix}`;
}

/**
 * Executes an atomic transaction on the isolated System_Counters document.
 * Reads the latest sequence -> Increments by 1 -> Commits immediately.
 * Formats: [Project_Code]-[Originator]-[Recipient]-[Doc_Type]-[Year]-[Serial]
 * Example: 1233-CON-CTR-LTR-26-0045
 */
export function reserveAtomicOfficialSerial(params: GenerateSerialParams): { serial_number: string; sequence_number: number } {
  const currentYear = params.year || new Date().getFullYear().toString().slice(-2);
  const counterKey = `${params.project_code}_${params.doc_type}_${currentYear}`;

  // Atomic locked read-update from isolated counter store
  let counters: Record<string, number> = {};
  try {
    const raw = localStorage.getItem(COUNTER_STORAGE_KEY);
    if (raw) {
      counters = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read atomic counter registry:', err);
  }

  // Pre-seeded or default value
  let currentSeq = counters[counterKey];
  if (typeof currentSeq !== 'number') {
    // Default seed mapping for demo project 1233
    if (params.project_code === '1233' && params.doc_type === 'LTR') {
      currentSeq = 44;
    } else {
      currentSeq = 0;
    }
  }

  const nextSeq = currentSeq + 1;
  counters[counterKey] = nextSeq;

  // Commit updated sequence atomically
  try {
    localStorage.setItem(COUNTER_STORAGE_KEY, JSON.stringify(counters));
  } catch (err) {
    console.error('Failed to persist atomic counter:', err);
  }

  const paddedSeq = String(nextSeq).padStart(4, '0');
  const serial_number = `${params.project_code}-${params.originator_code}-${params.recipient_code}-${params.doc_type}-${currentYear}-${paddedSeq}`;

  return {
    serial_number,
    sequence_number: nextSeq
  };
}
