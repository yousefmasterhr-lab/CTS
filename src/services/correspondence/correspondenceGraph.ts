// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Multi-Turn Correspondence Graph & Synchronous Thread Engine
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import { Correspondence } from '../../types/correspondence';

export interface ThreadNode {
  doc: Correspondence;
  turn_number: number;
  depth: number;
  party_side: 'A' | 'B'; // Party A (Initiator) vs Party B (Counterpart)
  party_name: string;
  recipient_name: string;
  parent_serial: string | null;
  days_from_parent: number | null;
  sibling_index: number;
  sibling_total: number;
  is_branch: boolean;
  branch_label?: string;
  has_children: boolean;
}

export interface CorrespondenceThread {
  root_doc: Correspondence;
  nodes: ThreadNode[];
  total_turns: number;
  party_a_name: string;
  party_b_name: string;
  is_closed: boolean;
  latest_doc: Correspondence;
  has_branches: boolean;
}

/**
 * Calculates calendar days elapsed between two date strings (YYYY-MM-DD)
 */
export function calculateDaysBetween(fromDateStr: string, toDateStr: string): number {
  try {
    const from = new Date(fromDateStr.split('T')[0]);
    const to = new Date(toDateStr.split('T')[0]);
    const diffMs = to.getTime() - from.getTime();
    return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

/**
 * Traverses bidirectional relationships starting from any document in a thread,
 * finds the original root, discovers all descendants and parallel branches,
 * and orders them chronologically with turn numbers, party classifications, and timing.
 */
export function buildCorrespondenceThread(
  currentDocId: string,
  allDocs: Correspondence[]
): CorrespondenceThread | null {
  const target = allDocs.find(d => d.doc_id === currentDocId);
  if (!target) return null;

  // 1. Traverse upward to find the root document (no parent or parent not found)
  const visitedAncestors = new Set<string>();
  let rootDoc: Correspondence = target;
  let curr: Correspondence | undefined = target;

  while (curr && curr.parent_doc_id) {
    if (visitedAncestors.has(curr.doc_id)) {
      break; // Guard against circular references
    }
    visitedAncestors.add(curr.doc_id);

    const parent = allDocs.find(d => d.doc_id === curr!.parent_doc_id);
    if (parent) {
      rootDoc = parent;
      curr = parent;
    } else {
      break;
    }
  }

  // 2. Traverse downward from root to collect all descendants (BFS / iterative discovery)
  const threadDocMap = new Map<string, Correspondence>();
  threadDocMap.set(rootDoc.doc_id, rootDoc);

  let addedInLastPass = true;
  while (addedInLastPass) {
    addedInLastPass = false;
    for (const doc of allDocs) {
      if (!threadDocMap.has(doc.doc_id) && doc.parent_doc_id && threadDocMap.has(doc.parent_doc_id)) {
        threadDocMap.set(doc.doc_id, doc);
        addedInLastPass = true;
      }
    }
  }

  const threadDocs = Array.from(threadDocMap.values());

  // 3. Define the two communicating parties (Party A = sender of root, Party B = receiver of root)
  const partyAName = rootDoc.sender_entity;
  const partyBName = rootDoc.receiver_entity;

  // Helper to test if an entity belongs to Party A
  const isPartyA = (sender: string) => {
    const cleanA = partyAName.trim().toLowerCase();
    const cleanSender = sender.trim().toLowerCase();
    return cleanSender === cleanA || cleanSender.includes(cleanA) || cleanA.includes(cleanSender);
  };

  // 4. Sort documents chronologically by issue_date then created_at
  threadDocs.sort((a, b) => {
    const dateA = new Date(a.issue_date).getTime();
    const dateB = new Date(b.issue_date).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  // 5. Group children by parent to identify siblings and branching
  const childrenByParent = new Map<string, Correspondence[]>();
  for (const doc of threadDocs) {
    if (doc.parent_doc_id) {
      const existing = childrenByParent.get(doc.parent_doc_id) || [];
      existing.push(doc);
      childrenByParent.set(doc.parent_doc_id, existing);
    }
  }

  let hasBranches = false;
  for (const siblings of childrenByParent.values()) {
    if (siblings.length > 1) {
      hasBranches = true;
      break;
    }
  }

  // 6. Build Thread Nodes with metadata
  const nodes: ThreadNode[] = threadDocs.map((doc, index) => {
    const isRoot = doc.doc_id === rootDoc.doc_id;
    const parentDoc = doc.parent_doc_id ? threadDocMap.get(doc.parent_doc_id) : undefined;
    const siblings = doc.parent_doc_id ? (childrenByParent.get(doc.parent_doc_id) || []) : [];
    const siblingIndex = siblings.findIndex(s => s.doc_id === doc.doc_id);
    const isBranch = siblings.length > 1;

    let daysFromParent: number | null = null;
    if (parentDoc) {
      daysFromParent = calculateDaysBetween(parentDoc.issue_date, doc.issue_date);
    }

    const partySide: 'A' | 'B' = isPartyA(doc.sender_entity) ? 'A' : 'B';
    const hasChildren = (childrenByParent.get(doc.doc_id)?.length || 0) > 0;

    let branchLabel: string | undefined = undefined;
    if (isBranch) {
      branchLabel = `خطاب متزامن (${siblingIndex + 1} من ${siblings.length})`;
    }

    return {
      doc,
      turn_number: index + 1,
      depth: isRoot ? 0 : 1,
      party_side: partySide,
      party_name: doc.sender_entity,
      recipient_name: doc.receiver_entity,
      parent_serial: doc.parent_serial || (parentDoc ? parentDoc.serial_number : null),
      days_from_parent: daysFromParent,
      sibling_index: Math.max(0, siblingIndex),
      sibling_total: Math.max(1, siblings.length),
      is_branch: isBranch,
      branch_label: branchLabel,
      has_children: hasChildren
    };
  });

  const latestNode = nodes[nodes.length - 1];
  const isClosed = latestNode?.doc.status === 'Closed' || 
    (latestNode?.doc.doc_type === 'Outgoing' && latestNode?.doc.status === 'Approved');

  return {
    root_doc: rootDoc,
    nodes,
    total_turns: nodes.length,
    party_a_name: partyAName,
    party_b_name: partyBName,
    is_closed: isClosed,
    latest_doc: latestNode ? latestNode.doc : rootDoc,
    has_branches: hasBranches
  };
}
