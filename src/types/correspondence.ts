// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Correspondence Central Schema & Numbering
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

export type DocType = 
  | 'LTR'    // Official Correspondence Letter (خطاب رسمي)
  | 'SUB'    // Material / Technical Submittal (اعتماد فني / مواد)
  | 'RFI'    // Request for Information (استفسار فني)
  | 'IPC'    // Interim Payment Certificate (مستخلص جاري)
  | 'MOM'    // Minutes of Meeting (محضر اجتماع)
  | 'TRANS'  // Document Transmittal (مذكرة إرسال)
  | 'SITE';  // Site Instruction / Notice (ملاحظة موقعية)

export type Direction = 'Incoming' | 'Outgoing';

export type DocStatus = 
  | 'Draft'      // In progress draft, carries DRAFT-XXXX
  | 'Pending'    // Pending Review / Approval from PM
  | 'Approved'   // Officially approved with atomic serial generated
  | 'Replied'    // Inbound correspondence that received an official outbound reply
  | 'Closed'     // Completed contractual lifecycle
  | 'Rejected';  // Rejected / Needs revision

export type Priority = 'Normal' | 'Urgent' | 'Immediate';

export interface Attachment {
  file_id: string;
  doc_ref: string;
  file_name: string;
  file_size_mb: number;
  storage_direct_url: string;
  file_category: string;
  upload_timestamp: string;
  mime_type?: string;
}

export interface WorkflowAction {
  action_id: string;
  doc_ref: string;
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  action_required: string;
  instructions: string;
  due_date: string;
  action_status: 'Pending' | 'Completed' | 'Overdue';
  created_at: string;
}

export interface Correspondence {
  doc_id: string;                      // Immutable UUID
  doc_type: Direction;                 // 'Incoming' (وارد) or 'Outgoing' (صادر)
  classification: DocType;             // LTR, SUB, RFI, IPC, etc.
  serial_number: string;               // e.g. 1233-CON-CTR-LTR-26-0045 or DRAFT-9182
  is_draft: boolean;                   // True if unapproved draft
  external_ref_no?: string;            // Sender's external letter number (e.g. MOI/442/26)
  project_ref: string;                 // FK to Project (Project_Code or Project_ID)
  project_name?: string;
  subject: string;                     // Subject title & executive summary
  body_text?: string;                  // Formal letter text content
  sender_entity: string;               // e.g. "CON" / "استشارات العفيفي" / "وزارة الداخلية"
  receiver_entity: string;             // e.g. "CTR" / "شركة المقاولات" / "الاستشاري"
  originator_code: string;             // e.g. "CON"
  recipient_code: string;              // e.g. "CTR"
  priority: Priority;                  // Normal, Urgent, Immediate
  issue_date: string;                  // YYYY-MM-DD
  received_date?: string;              // Intake timestamp
  due_date?: string;                   // Contractual SLA deadline
  status: DocStatus;                   // Draft, Pending, Approved, Replied, Closed
  parent_doc_id?: string | null;       // Link to parent inbound (for cross-referencing)
  parent_serial?: string | null;       // Serial of parent for quick dossier display
  created_by_user_id: string;
  created_by_name: string;
  approved_by_user_id?: string;
  approved_by_name?: string;
  approval_date?: string;
  attachments: Attachment[];
  workflow_history?: WorkflowAction[];
  review_remarks?: string;             // Revision remarks if returned by PM/Admin
  returned_by_name?: string;           // Name of manager who requested revisions
  returned_at?: string;                // Timestamp of return
  created_at: string;
  updated_at: string;
}

export interface SystemCounter {
  counter_key: string;                 // `${project_code}_${doc_type}_${year}` e.g. "1233_LTR_26"
  project_code: string;
  doc_type: DocType;
  year: string;                        // "26"
  last_serial: number;                 // Integer: 42 -> next is 43
  updated_at: string;
}
