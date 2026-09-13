// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Central Database Service & Anti-Duplicate Pipeline
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import { Correspondence, DocStatus, Direction, DocType } from '../../types/correspondence';
import { Project } from '../../types/project';
import { Entity } from '../../types/entity';
import { User } from '../../types/auth';
import { INITIAL_PROJECTS, INITIAL_USERS, INITIAL_CORRESPONDENCES, INITIAL_AUDIT_LOGS, INITIAL_ENTITIES } from './seedData';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '../../types/api';
import { generateDraftSerial, reserveAtomicOfficialSerial } from './atomicCounter';
import { telegramService } from '../telegram/telegramService';
import { buildCorrespondenceThread, CorrespondenceThread } from '../correspondence/correspondenceGraph';

const STORAGE_PROJECTS = 'pcms_projects';
const STORAGE_ENTITIES = 'pcms_entities';
const STORAGE_USERS = 'pcms_users';
const STORAGE_CORRESPONDENCE = 'pcms_correspondence';
const STORAGE_AUDIT = 'pcms_audit_trail';
const STORAGE_SYSTEM_MODE = 'pcms_system_mode'; // 'demo' | 'production'

export interface AuditLogItem {
  log_id: string;
  user_id: string;
  user_name: string;
  action_type: string;
  target_doc: string;
  timestamp: string;
  details?: string;
  previous_value?: string;
  new_value?: string;
  changed_fields?: string[];
}

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    this.initStorage();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initStorage(): void {
    if (!localStorage.getItem(STORAGE_PROJECTS)) {
      localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(INITIAL_PROJECTS));
    } else {
      try {
        const storedProjects: Project[] = JSON.parse(localStorage.getItem(STORAGE_PROJECTS) || '[]');
        let pChanged = false;
        for (const initP of INITIAL_PROJECTS) {
          const existing = storedProjects.find(p => p.project_id === initP.project_id);
          if (!existing) {
            storedProjects.push(initP);
            pChanged = true;
          } else if (!existing.currency) {
            existing.currency = initP.currency || 'EGP';
            pChanged = true;
          }
        }
        if (pChanged) {
          localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(storedProjects));
        }
      } catch (err) {
        localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(INITIAL_PROJECTS));
      }
    }

    if (!localStorage.getItem(STORAGE_ENTITIES)) {
      localStorage.setItem(STORAGE_ENTITIES, JSON.stringify(INITIAL_ENTITIES));
    } else {
      try {
        const storedEnt: Entity[] = JSON.parse(localStorage.getItem(STORAGE_ENTITIES) || '[]');
        const storedEntCodes = new Set(storedEnt.map(e => e.code.toUpperCase()));
        let eChanged = false;
        for (const initE of INITIAL_ENTITIES) {
          if (!storedEntCodes.has(initE.code.toUpperCase())) {
            storedEnt.push(initE);
            eChanged = true;
          }
        }
        if (eChanged) {
          localStorage.setItem(STORAGE_ENTITIES, JSON.stringify(storedEnt));
        }
      } catch (err) {
        localStorage.setItem(STORAGE_ENTITIES, JSON.stringify(INITIAL_ENTITIES));
      }
    }

    if (!localStorage.getItem(STORAGE_USERS)) {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(INITIAL_USERS));
    }

    const currentMode = this.getSystemMode();
    if (currentMode === 'production') {
      if (!localStorage.getItem(STORAGE_CORRESPONDENCE)) {
        localStorage.setItem(STORAGE_CORRESPONDENCE, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_AUDIT)) {
        localStorage.setItem(STORAGE_AUDIT, JSON.stringify([]));
      }
    } else {
      const existingRaw = localStorage.getItem(STORAGE_CORRESPONDENCE);
      if (!existingRaw) {
        localStorage.setItem(STORAGE_CORRESPONDENCE, JSON.stringify(INITIAL_CORRESPONDENCES));
      } else {
        try {
          const stored: Correspondence[] = JSON.parse(existingRaw);
          const storedIds = new Set(stored.map(c => c.doc_id));
          let changed = false;
          for (const initial of INITIAL_CORRESPONDENCES) {
            if (!storedIds.has(initial.doc_id)) {
              stored.push(initial);
              changed = true;
            }
          }
          if (changed) {
            localStorage.setItem(STORAGE_CORRESPONDENCE, JSON.stringify(stored));
          }
        } catch {
          localStorage.setItem(STORAGE_CORRESPONDENCE, JSON.stringify(INITIAL_CORRESPONDENCES));
        }
      }

      if (!localStorage.getItem(STORAGE_AUDIT)) {
        localStorage.setItem(STORAGE_AUDIT, JSON.stringify(INITIAL_AUDIT_LOGS));
      } else {
        try {
          const raw = localStorage.getItem(STORAGE_AUDIT);
          if (raw) {
            const logs: AuditLogItem[] = JSON.parse(raw);
            let modified = false;
            for (const l of logs) {
              if (l.new_value && (l.new_value.includes('منقحة') || l.new_value.includes('المنقحة'))) {
                l.new_value = 'العنوان: تقرير الموقف التنفيذي ونسب الإنجاز لشهر سبتمبر 2026 (إنجاز 74%)';
                l.details = 'تعديل عنوان الخطاب وإضافة ملخص الأعمال المنجزة ونسبة الإنجاز الفعلية (74%)';
                modified = true;
              }
              if (l.previous_value && l.previous_value.includes('المسودة الأولى')) {
                l.previous_value = 'العنوان: إعداد مسودة التقرير الشهري';
                modified = true;
              }
              if (!l.previous_value || !l.new_value) {
                modified = true;
                if (l.action_type === 'DOC_UPDATED') {
                  l.previous_value = l.previous_value || 'البيانات السابقة للخطاب';
                  l.new_value = l.new_value || 'تعديل البيانات وإرفاق المستندات';
                } else if (l.action_type === 'OUTBOUND_APPROVED_ATOMIC') {
                  l.previous_value = l.previous_value || 'مسودة قيد المراجعة';
                  l.new_value = l.new_value || 'صادر رسمي معتمد';
                } else if (l.action_type === 'RETURNED_FOR_REVISION') {
                  l.previous_value = l.previous_value || 'الحالة: قيد المراجعة';
                  l.new_value = l.new_value || 'الحالة: إرجاع للتصحيح';
                } else if (l.action_type === 'RESUBMITTED_FOR_APPROVAL') {
                  l.previous_value = l.previous_value || 'الحالة: إرجاع للتصحيح';
                  l.new_value = l.new_value || 'الحالة: إعادة تقديم للاعتماد';
                } else {
                  l.previous_value = l.previous_value || '—';
                  l.new_value = l.new_value || 'إنشاء وقيد المعاملة';
                }
              }
            }
            if (logs.length < 5) {
              for (const init of INITIAL_AUDIT_LOGS) {
                if (!logs.some(existing => existing.log_id === init.log_id || (existing.target_doc === init.target_doc && existing.action_type === init.action_type))) {
                  logs.push(init as AuditLogItem);
                  modified = true;
                }
              }
            }
            if (modified) {
              localStorage.setItem(STORAGE_AUDIT, JSON.stringify(logs));
            }
          }
        } catch (err) {
          console.error('Failed to normalize audit logs:', err);
        }
      }
    }
  }

  // -------------------------------------------------------------
  // System Mode Engine (Demo vs Clean Production)
  // -------------------------------------------------------------
  public getSystemMode(): 'demo' | 'production' {
    const mode = localStorage.getItem(STORAGE_SYSTEM_MODE);
    return mode === 'production' ? 'production' : 'demo';
  }

  public setSystemMode(mode: 'demo' | 'production', clearData: boolean = true): void {
    localStorage.setItem(STORAGE_SYSTEM_MODE, mode);
    if (mode === 'production' && clearData) {
      // Clear mock correspondence and audit transactions for clean production operations
      localStorage.setItem(STORAGE_CORRESPONDENCE, JSON.stringify([]));
      localStorage.setItem(STORAGE_AUDIT, JSON.stringify([]));
      localStorage.setItem('pcms_issue_tickets', JSON.stringify([]));
    } else if (mode === 'demo') {
      // Restore demo seeds
      localStorage.setItem(STORAGE_CORRESPONDENCE, JSON.stringify(INITIAL_CORRESPONDENCES));
      localStorage.setItem(STORAGE_AUDIT, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    window.dispatchEvent(new CustomEvent('pcms:system-mode-changed', { detail: { mode } }));
  }

  // -------------------------------------------------------------
  // Projects Engine
  // -------------------------------------------------------------
  public getProjects(): Project[] {
    try {
      const raw = localStorage.getItem(STORAGE_PROJECTS);
      return raw ? JSON.parse(raw) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  }

  public getProjectById(projectId: string): Project | undefined {
    return this.getProjects().find(p => p.project_id === projectId || p.project_code === projectId);
  }

  public createProject(project: Project): ApiResponse<Project> {
    try {
      const projects = this.getProjects();
      if (projects.some(p => p.project_code.trim() === project.project_code.trim())) {
        return createErrorResponse('DUPLICATE_PROJECT_CODE', `كود المشروع ${project.project_code} مسجل بالفعل.`);
      }
      if (!project.project_id) {
        project.project_id = `PRJ-${project.project_code}`;
      }
      project.created_at = project.created_at || new Date().toISOString();
      projects.push(project);
      localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(projects));
      return createSuccessResponse(project);
    } catch (err: any) {
      return createErrorResponse('PROJECT_CREATE_FAILED', err?.message);
    }
  }

  public updateProject(project: Project): ApiResponse<Project> {
    try {
      const projects = this.getProjects();
      const idx = projects.findIndex(p => p.project_id === project.project_id);
      if (idx === -1) {
        return createErrorResponse('PROJECT_NOT_FOUND', 'المشروع غير موجود بالنظام.');
      }
      // Check if project code collides with another project
      const duplicateCode = projects.find(p => p.project_code === project.project_code && p.project_id !== project.project_id);
      if (duplicateCode) {
        return createErrorResponse('DUPLICATE_PROJECT_CODE', `كود المشروع ${project.project_code} مستخدم بالفعل في مشروع آخر.`);
      }

      project.updated_at = new Date().toISOString();
      projects[idx] = project;
      localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(projects));
      return createSuccessResponse(project);
    } catch (err: any) {
      return createErrorResponse('PROJECT_UPDATE_FAILED', err?.message);
    }
  }

  public deleteProject(projectId: string): ApiResponse<boolean> {
    try {
      const projects = this.getProjects();
      const target = projects.find(p => p.project_id === projectId || p.project_code === projectId);
      if (!target) {
        return createErrorResponse('PROJECT_NOT_FOUND', 'المشروع المراد حذفه غير موجود.');
      }

      // Safeguard: Check if any correspondence is linked to this project
      const correspondences = this.getCorrespondences();
      const hasDocs = correspondences.some(
        c => c.project_ref === target.project_id || c.project_ref === target.project_code
      );

      if (hasDocs) {
        return createErrorResponse(
          'PROJECT_HAS_CORRESPONDENCE',
          `لا يمكن حذف المشروع [${target.project_name}] لوجود مراسلات ومعاملات رسمية مرتبطة به. يمكنك تعديل حالة المشروع إلى "معلق" أو "تم التسليم" بدلاً من الحذف للحفاظ على سلامة الأرشيف.`
        );
      }

      const updated = projects.filter(p => p.project_id !== target.project_id);
      localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(updated));
      return createSuccessResponse(true);
    } catch (err: any) {
      return createErrorResponse('PROJECT_DELETE_FAILED', err?.message);
    }
  }

  // -------------------------------------------------------------
  // Entities & Stakeholders Registry Engine (Consultants, Owners, Contractors, Suppliers)
  // -------------------------------------------------------------
  public getEntities(): Entity[] {
    try {
      const raw = localStorage.getItem(STORAGE_ENTITIES);
      return raw ? JSON.parse(raw) : INITIAL_ENTITIES;
    } catch {
      return INITIAL_ENTITIES;
    }
  }

  public getEntityById(entityId: string): Entity | undefined {
    return this.getEntities().find(e => e.id === entityId || e.code.toLowerCase() === entityId.toLowerCase());
  }

  public createEntity(entity: Entity): ApiResponse<Entity> {
    try {
      const entities = this.getEntities();
      if (entities.some(e => e.code.trim().toUpperCase() === entity.code.trim().toUpperCase())) {
        return createErrorResponse('DUPLICATE_ENTITY_CODE', `كود الجهة [${entity.code}] مسجل بالفعل لجهة أخرى.`);
      }
      if (entities.some(e => e.name.trim().toLowerCase() === entity.name.trim().toLowerCase())) {
        return createErrorResponse('DUPLICATE_ENTITY_NAME', `الاسم التجاري/الرسمي [${entity.name}] مسجل بالفعل.`);
      }

      entity.created_at = new Date().toISOString();
      entities.push(entity);
      localStorage.setItem(STORAGE_ENTITIES, JSON.stringify(entities));
      return createSuccessResponse(entity);
    } catch (err: any) {
      return createErrorResponse('ENTITY_CREATE_FAILED', err?.message);
    }
  }

  public updateEntity(entity: Entity): ApiResponse<Entity> {
    try {
      const entities = this.getEntities();
      const idx = entities.findIndex(e => e.id === entity.id);
      if (idx === -1) {
        return createErrorResponse('ENTITY_NOT_FOUND', 'الجهة المراد تعديلها غير موجودة.');
      }

      // Check code uniqueness
      const duplicateCode = entities.find(
        e => e.code.trim().toUpperCase() === entity.code.trim().toUpperCase() && e.id !== entity.id
      );
      if (duplicateCode) {
        return createErrorResponse('DUPLICATE_ENTITY_CODE', `كود الجهة [${entity.code}] مستخدم لجهة أخرى.`);
      }

      entity.updated_at = new Date().toISOString();
      entities[idx] = entity;
      localStorage.setItem(STORAGE_ENTITIES, JSON.stringify(entities));
      return createSuccessResponse(entity);
    } catch (err: any) {
      return createErrorResponse('ENTITY_UPDATE_FAILED', err?.message);
    }
  }

  public deleteEntity(entityId: string): ApiResponse<boolean> {
    try {
      const entities = this.getEntities();
      const target = entities.find(e => e.id === entityId || e.code === entityId);
      if (!target) {
        return createErrorResponse('ENTITY_NOT_FOUND', 'الجهة المراد حذفها غير موجودة.');
      }

      // Safeguard 1: Check projects usage
      const projects = this.getProjects();
      const inProject = projects.some(
        p => (p.client_name && p.client_name.includes(target.name)) ||
             (p.consultant_name && p.consultant_name.includes(target.name)) ||
             (p.contractor_name && p.contractor_name.includes(target.name)) ||
             (p.consultant_name && p.consultant_name.includes(target.code)) ||
             (p.contractor_name && p.contractor_name.includes(target.code))
      );

      if (inProject) {
        return createErrorResponse(
          'ENTITY_IN_USE_PROJECT',
          `لا يمكن حذف الجهة [${target.name}] لأنها مسجلة كطرف رئيسي (مالك أو استشاري أو مقاول) في أحد المشاريع الهندسية. يمكنك تعديل حالتها إلى "غير نشط" بدلاً من الحذف.`
        );
      }

      // Safeguard 2: Check correspondences usage
      const correspondences = this.getCorrespondences();
      const inDocs = correspondences.some(
        c => (c.sender_entity && (c.sender_entity.includes(target.name) || c.sender_entity.includes(target.code))) ||
             (c.receiver_entity && (c.receiver_entity.includes(target.name) || c.receiver_entity.includes(target.code)))
      );

      if (inDocs) {
        return createErrorResponse(
          'ENTITY_IN_USE_DOCS',
          `لا يمكن حذف الجهة [${target.name}] لوجود خطابات ومراسلات سابقة صادرة منها أو واردة إليها. يمكنك تعديل حالتها إلى "غير نشط" لحماية السجل التاريخي.`
        );
      }

      const updated = entities.filter(e => e.id !== target.id);
      localStorage.setItem(STORAGE_ENTITIES, JSON.stringify(updated));
      return createSuccessResponse(true);
    } catch (err: any) {
      return createErrorResponse('ENTITY_DELETE_FAILED', err?.message);
    }
  }

  // -------------------------------------------------------------
  // Users & RBAC Provisioning Engine
  // -------------------------------------------------------------
  public getUsers(): User[] {
    try {
      const raw = localStorage.getItem(STORAGE_USERS);
      return raw ? JSON.parse(raw) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  public getUserById(userId: string): User | undefined {
    return this.getUsers().find(u => u.id === userId);
  }

  public createUser(user: User): ApiResponse<User> {
    try {
      const users = this.getUsers();
      if (users.some(u => u.work_email.toLowerCase() === user.work_email.toLowerCase())) {
        return createErrorResponse('DUPLICATE_EMAIL', 'البريد الإلكتروني مسجل مسبقاً لمستخدم آخر.');
      }
      users.push(user);
      localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
      this.logAudit(user.id, user.full_name, 'USER_CREATED', user.work_email, `تم إنشاء مستخدم جديد برتبة ${user.system_role}`);
      return createSuccessResponse(user);
    } catch (err: any) {
      return createErrorResponse('USER_CREATE_FAILED', err?.message);
    }
  }

  public updateUser(user: User): ApiResponse<User> {
    try {
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx === -1) return createErrorResponse('USER_NOT_FOUND', 'المستخدم غير موجود');
      users[idx] = user;
      localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
      return createSuccessResponse(user);
    } catch (err: any) {
      return createErrorResponse('USER_UPDATE_FAILED', err?.message);
    }
  }

  // -------------------------------------------------------------
  // Correspondence Master Engine
  // -------------------------------------------------------------
  public getCorrespondences(filters?: {
    project_ref?: string;
    doc_type?: Direction;
    classification?: DocType;
    status?: DocStatus;
    search?: string;
    user?: User;
  }): Correspondence[] {
    try {
      const raw = localStorage.getItem(STORAGE_CORRESPONDENCE);
      let list: Correspondence[] = raw ? JSON.parse(raw) : INITIAL_CORRESPONDENCES;

      // Enforce Role-Based Project Tenancy
      if (filters?.user && filters.user.system_role !== 'Admin') {
        const allowed = filters.user.assigned_projects || [];
        list = list.filter(item => allowed.includes(item.project_ref));
      }

      if (filters?.project_ref && filters.project_ref !== 'ALL') {
        list = list.filter(c => c.project_ref === filters.project_ref);
      }

      if (filters?.doc_type) {
        list = list.filter(c => c.doc_type === filters.doc_type);
      }

      if (filters?.classification) {
        list = list.filter(c => c.classification === filters.classification);
      }

      if (filters?.status) {
        list = list.filter(c => c.status === filters.status);
      }

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(c => 
          c.serial_number.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          (c.external_ref_no && c.external_ref_no.toLowerCase().includes(q)) ||
          c.sender_entity.toLowerCase().includes(q) ||
          c.receiver_entity.toLowerCase().includes(q)
        );
      }

      return list;
    } catch {
      return INITIAL_CORRESPONDENCES;
    }
  }

  public getCorrespondenceById(docId: string): Correspondence | undefined {
    return this.getCorrespondences().find(c => c.doc_id === docId);
  }

  /**
   * INBOUND INTAKE PIPELINE
   * Enforces Anti-Duplicate Check: (Project_Ref + Sender_Entity + External_Ref_No)
   */
  public async createInbound(
    data: Omit<Correspondence, 'doc_id' | 'serial_number' | 'is_draft' | 'created_at' | 'updated_at' | 'doc_type'>,
    creator: User
  ): Promise<ApiResponse<Correspondence>> {
    try {
      const list = this.getCorrespondences();

      // Anti-Duplicate Check
      if (data.external_ref_no) {
        const extRef = data.external_ref_no.trim().toLowerCase();
        const isDuplicate = list.some(item => 
          item.doc_type === 'Incoming' &&
          item.project_ref === data.project_ref &&
          item.sender_entity.trim().toLowerCase() === data.sender_entity.trim().toLowerCase() &&
          item.external_ref_no?.trim().toLowerCase() === extRef
        );

        if (isDuplicate) {
          return createErrorResponse(
            'DUPLICATE_INBOUND_RECORD',
            `تحذير أمني: هذا الخطاب مسجل مسبقاً بنفس رقم المرجع الخارجي (${data.external_ref_no}) لنفس المشروع والجهة الراسلة تفادياً للتكرار.`
          );
        }
      }

      // Generate intake internal serial
      const project = this.getProjectById(data.project_ref);
      const projectCode = project?.project_code || '1233';
      const year = new Date().getFullYear().toString().slice(-2);
      const intakeSerial = `${projectCode}-${data.originator_code}-${data.recipient_code}-${data.classification}-${year}-IN${Math.floor(1000 + Math.random() * 9000)}`;

      const now = new Date().toISOString();
      const newDoc: Correspondence = {
        ...data,
        doc_id: 'doc-' + Math.random().toString(36).substring(2, 11),
        doc_type: 'Incoming',
        serial_number: intakeSerial,
        is_draft: false,
        created_at: now,
        updated_at: now,
      };

      list.unshift(newDoc);
      localStorage.setItem(STORAGE_CORRESPONDENCE, JSON.stringify(list));

      this.logAudit(creator.id, creator.full_name, 'INBOUND_REGISTERED', newDoc.serial_number, `تسجيل وارد جديد: ${newDoc.subject}`);

      // Dispatch to Telegram Bots scoped for 'inbound_logs'
      await telegramService.dispatchEvent('inbound_logs', {
        origin: 'PCMS Inbound Engine',
        project_code_name: `${projectCode} - ${project?.project_name || ''}`,
        module: 'Inbound',
        severity: newDoc.priority === 'Immediate' ? 'CRITICAL' : 'INFO',
        event: `تسجيل وارد جديد: ${newDoc.subject}`,
        actor: `${creator.full_name} (${creator.system_role})`,
        timestamp: now.replace('T', ' ').substring(0, 19),
        reference: newDoc.serial_number
      });

      return createSuccessResponse(newDoc);
    } catch (err: any) {
      return createErrorResponse('INBOUND_CREATE_FAILED', err?.message);
    }
  }

  /**
   * OUTBOUND DRAFT PIPELINE
   * Uses DRAFT-XXXX to prevent burning sequential numbers.
   */
  public async createOutboundDraft(
    data: Omit<Correspondence, 'doc_id' | 'serial_number' | 'is_draft' | 'created_at' | 'updated_at' | 'doc_type'>,
    creator: User
  ): Promise<ApiResponse<Correspondence>> {
    try {
      const list = this.getCorrespondences();
      const draftSerial = generateDraftSerial(); // e.g. DRAFT-8912
      const now = new Date().toISOString();

      const newDoc: Correspondence = {
        ...data,
        doc_id: 'doc-' + Math.random().toString(36).substring(2, 11),
        doc_type: 'Outgoing',
        serial_number: draftSerial,
        is_draft: true,
        status: 'Draft',
        created_at: now,
        updated_at: now,
      };

      list.unshift(newDoc);
      localStorage.setItem(STORAGE_CORRESPONDENCE, JSON.stringify(list));

      this.logAudit(creator.id, creator.full_name, 'OUTBOUND_DRAFT_CREATED', draftSerial, `إنشاء مسودة صادر: ${newDoc.subject}`);

      return createSuccessResponse(newDoc);
    } catch (err: any) {
      return createErrorResponse('DRAFT_CREATE_FAILED', err?.message);
    }
  }

  /**
   * ATOMIC APPROVAL & STAMPING CEREMONY
   * Converts DRAFT-XXXX into official atomic serial.
   * Freezes record and cross-references parent inbound if present.
   */
  public async approveOutboundCorrespondence(
    docId: string,
    approver: User
  ): Promise<ApiResponse<Correspondence>> {
    try {
      const list = this.getCorrespondences();
      const idx = list.findIndex(c => c.doc_id === docId);
      if (idx === -1) {
        return createErrorResponse('DOC_NOT_FOUND', 'المعاملة غير موجودة');
      }

      const doc = list[idx];
      const project = this.getProjectById(doc.project_ref);
      const projectCode = project?.project_code || '1233';

      // Atomic Transactional Reservation
      const { serial_number } = reserveAtomicOfficialSerial({
        project_code: projectCode,
        originator_code: doc.originator_code || 'CON',
        recipient_code: doc.recipient_code || 'CTR',
        doc_type: doc.classification || 'LTR'
      });

      const now = new Date().toISOString();
      const oldSerial = doc.serial_number;

      doc.serial_number = serial_number;
      doc.is_draft = false;
      doc.status = 'Approved';
      doc.approved_by_user_id = approver.id;
      doc.approved_by_name = approver.full_name;
      doc.approval_date = now;
      doc.updated_at = now;

      // Close the Loop: Cross-Reference Parent Inbound
      if (doc.parent_doc_id) {
        const parentIdx = list.findIndex(c => c.doc_id === doc.parent_doc_id);
        if (parentIdx !== -1) {
          list[parentIdx].status = 'Replied';
          list[parentIdx].updated_at = now;
        }
      }

      list[idx] = doc;
      localStorage.setItem(STORAGE_CORRESPONDENCE, JSON.stringify(list));

      this.logAudit(
        approver.id,
        approver.full_name,
        'OUTBOUND_APPROVED_ATOMIC',
        doc.serial_number,
        `اعتماد نهائي وتوليد الرقم الصادر (${oldSerial} -> ${serial_number})`,
        `مسودة (${oldSerial})`,
        `صادر معتمد (${serial_number})`,
        ['الرقم الصادر', 'الحالة', 'الباركود']
      );

      // Dispatch to Telegram Bots scoped for 'outbound_approvals'
      await telegramService.dispatchEvent('outbound_approvals', {
        origin: 'PCMS Outbound Engine',
        project_code_name: `${projectCode} - ${project?.project_name || ''}`,
        module: 'Outbound',
        severity: 'INFO',
        event: `اعتماد صادر وحجز الرقم الصادر المعتمد: ${doc.subject}`,
        actor: `${approver.full_name} (${approver.system_role})`,
        timestamp: now.replace('T', ' ').substring(0, 19),
        reference: doc.serial_number
      });

      return createSuccessResponse(doc);
    } catch (err: any) {
      return createErrorResponse('APPROVAL_FAILED', err?.message);
    }
  }

  /**
   * UPDATE / EDIT CORRESPONDENCE
   * Allows modifying letter data (Inbound or Outbound).
   */
  public async updateCorrespondence(
    docId: string,
    updates: Partial<Correspondence>,
    updater: User
  ): Promise<ApiResponse<Correspondence>> {
    try {
      const list = this.getCorrespondences();
      const idx = list.findIndex(c => c.doc_id === docId);
      if (idx === -1) {
        return createErrorResponse('DOC_NOT_FOUND', 'المعاملة غير موجودة');
      }

      const existing = list[idx];
      const now = new Date().toISOString();

      // If document was rejected/returned and is now being updated, advance it back to Pending
      let newStatus = updates.status !== undefined ? updates.status : existing.status;
      if (existing.status === 'Rejected' && updates.status === undefined) {
        newStatus = 'Pending';
      }

      const updatedDoc: Correspondence = {
        ...existing,
        ...updates,
        status: newStatus,
        updated_at: now
      };

      list[idx] = updatedDoc;
      localStorage.setItem(STORAGE_CORRESPONDENCE, JSON.stringify(list));

      const changedKeys: string[] = [];
      let prevValSummary = 'البيانات السابقة';
      let newValSummary = 'البيانات المحدثة';

      if (updates.subject && updates.subject !== existing.subject) {
        changedKeys.push('الموضوع');
        prevValSummary = existing.subject;
        newValSummary = updates.subject;
      } else if (updates.status && updates.status !== existing.status) {
        changedKeys.push('الحالة');
        prevValSummary = existing.status;
        newValSummary = updates.status;
      } else if (updates.receiver_entity && updates.receiver_entity !== existing.receiver_entity) {
        changedKeys.push('الجهة المستقبلة');
        prevValSummary = existing.receiver_entity;
        newValSummary = updates.receiver_entity;
      } else if (updates.sender_entity && updates.sender_entity !== existing.sender_entity) {
        changedKeys.push('الجهة المرسلة');
        prevValSummary = existing.sender_entity;
        newValSummary = updates.sender_entity;
      }

      this.logAudit(
        updater.id,
        updater.full_name,
        'DOC_UPDATED',
        updatedDoc.serial_number,
        `تعديل بيانات الخطاب: ${updatedDoc.subject}`,
        prevValSummary,
        newValSummary,
        changedKeys
      );

      return createSuccessResponse(updatedDoc);
    } catch (err: any) {
      return createErrorResponse('UPDATE_FAILED', err?.message);
    }
  }

  /**
   * RETURN FOR REVISION / REVIEW
   * Manager rejects/returns letter with specific revision remarks back to the creator.
   */
  public async returnCorrespondenceForReview(
    docId: string,
    manager: User,
    remarks: string
  ): Promise<ApiResponse<Correspondence>> {
    try {
      const list = this.getCorrespondences();
      const idx = list.findIndex(c => c.doc_id === docId);
      if (idx === -1) {
        return createErrorResponse('DOC_NOT_FOUND', 'المعاملة غير موجودة');
      }

      const doc = list[idx];
      const now = new Date().toISOString();

      doc.status = 'Rejected';
      doc.review_remarks = remarks.trim();
      doc.returned_by_name = manager.full_name;
      doc.returned_at = now;
      doc.updated_at = now;

      list[idx] = doc;
      localStorage.setItem(STORAGE_CORRESPONDENCE, JSON.stringify(list));

      this.logAudit(
        manager.id,
        manager.full_name,
        'RETURNED_FOR_REVISION',
        doc.serial_number,
        `إرجاع للمراجعة والتعديل: ${remarks.trim()}`,
        'قيد الاعتماد',
        'مرفوض للتصحيح',
        ['الحالة', 'ملاحظات المراجعة']
      );

      return createSuccessResponse(doc);
    } catch (err: any) {
      return createErrorResponse('RETURN_FAILED', err?.message);
    }
  }

  /**
   * RESUBMIT CORRESPONDENCE FOR REVIEW / APPROVAL
   * Creator re-submits a previously rejected letter after making corrections.
   */
  public async resubmitCorrespondenceForReview(
    docId: string,
    user: User
  ): Promise<ApiResponse<Correspondence>> {
    try {
      const list = this.getCorrespondences();
      const idx = list.findIndex(c => c.doc_id === docId);
      if (idx === -1) {
        return createErrorResponse('DOC_NOT_FOUND', 'المعاملة غير موجودة');
      }

      const doc = list[idx];
      const now = new Date().toISOString();

      doc.status = 'Pending';
      doc.updated_at = now;

      list[idx] = doc;
      localStorage.setItem(STORAGE_CORRESPONDENCE, JSON.stringify(list));

      this.logAudit(
        user.id,
        user.full_name,
        'RESUBMITTED_FOR_APPROVAL',
        doc.serial_number,
        `إعادة رفع الخطاب بعد التصحيح للاعتماد`,
        'مرفوض للتصحيح',
        'قيد الاعتماد',
        ['الحالة']
      );

      return createSuccessResponse(doc);
    } catch (err: any) {
      return createErrorResponse('RESUBMIT_FAILED', err?.message);
    }
  }

  // -------------------------------------------------------------
  // Audit Trail
  // -------------------------------------------------------------
  public logAudit(
    userId: string,
    userName: string,
    actionType: string,
    targetDoc: string,
    details?: string,
    previousValue?: string,
    newValue?: string,
    changedFields?: string[]
  ): void {
    try {
      const logs = this.getAuditLogs();
      const item: AuditLogItem = {
        log_id: 'log-' + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        user_name: userName,
        action_type: actionType,
        target_doc: targetDoc,
        timestamp: new Date().toISOString(),
        details,
        previous_value: previousValue,
        new_value: newValue,
        changed_fields: changedFields
      };
      logs.unshift(item);
      localStorage.setItem(STORAGE_AUDIT, JSON.stringify(logs.slice(0, 500)));
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  }

  public getAuditLogs(): AuditLogItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_AUDIT);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // -------------------------------------------------------------
  // Correspondence History Cycle & Thread Discovery
  // -------------------------------------------------------------
  public getCorrespondenceThread(docId: string): CorrespondenceThread | null {
    const allDocs = this.getCorrespondences();
    return buildCorrespondenceThread(docId, allDocs);
  }
}

export const dbService = DatabaseService.getInstance();
