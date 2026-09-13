// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// User Management & Granular Permission Provisioning
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState } from 'react';
import { dbService } from '../../services/db/firestoreService';
import { User, SystemRole } from '../../types/auth';
import { 
  ALL_PERMISSIONS, 
  PERMISSION_CATEGORIES, 
  getRoleTemplates, 
  saveRoleTemplates, 
  DEFAULT_ROLE_PERMISSIONS,
  PermissionCategory
} from '../../types/permissions';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../common/Button';
import { ActionIconButton } from '../common/ActionIconButton';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Building, 
  FolderLock,
  UserCheck,
  UserX,
  FileEdit,
  CheckCircle2,
  Sliders,
  CheckSquare,
  Square,
  RotateCcw,
  Sparkles,
  Layers,
  Search,
  Check,
  X,
  ArrowLeft
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { success, error, info } = useNotification();
  const [users, setUsers] = useState<User[]>(dbService.getUsers());
  const projects = dbService.getProjects();

  // Active top tab: 'users' or 'templates'
  const [activeTab, setActiveTab] = useState<'users' | 'templates'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Role Baseline Templates
  const [roleTemplates, setRoleTemplates] = useState<Record<SystemRole, string[]>>(getRoleTemplates());
  const [selectedTemplateRole, setSelectedTemplateRole] = useState<SystemRole>('Engineer');

  // User Modal State (Create or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [systemRole, setSystemRole] = useState<SystemRole>('Engineer');
  const [department, setDepartment] = useState('المكتب الفني والدراسات الإنشائية');
  const [phone, setPhone] = useState('');
  const [assignedProjects, setAssignedProjects] = useState<string[]>(['PRJ-1233']);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [modalActiveSection, setModalActiveSection] = useState<'info' | 'permissions'>('info');

  const reloadUsers = () => {
    setUsers(dbService.getUsers());
  };

  // Helper to get active permissions for a user (either custom or from role template)
  const resolveUserPermissions = (user: User): string[] => {
    if (user.custom_permissions && Array.isArray(user.custom_permissions)) {
      return user.custom_permissions;
    }
    return roleTemplates[user.system_role] || DEFAULT_ROLE_PERMISSIONS[user.system_role] || [];
  };

  const isCustomPermissions = (user: User): boolean => {
    if (!user.custom_permissions) return false;
    const defaultList = roleTemplates[user.system_role] || DEFAULT_ROLE_PERMISSIONS[user.system_role] || [];
    if (user.custom_permissions.length !== defaultList.length) return true;
    const s1 = [...user.custom_permissions].sort().join(',');
    const s2 = [...defaultList].sort().join(',');
    return s1 !== s2;
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingUserId(null);
    setFullName('');
    setWorkEmail('');
    setSystemRole('Engineer');
    setDepartment('المكتب الفني والدراسات الإنشائية');
    setPhone('');
    setAssignedProjects(['PRJ-1233']);
    // Bulk assign role default permissions automatically
    const defaults = roleTemplates['Engineer'] || DEFAULT_ROLE_PERMISSIONS['Engineer'];
    setSelectedPermissions([...defaults]);
    setModalActiveSection('info');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: User) => {
    setEditingUserId(user.id);
    setFullName(user.full_name);
    setWorkEmail(user.work_email);
    setSystemRole(user.system_role);
    setDepartment(user.department);
    setPhone(user.phone || '');
    setAssignedProjects(user.assigned_projects || []);
    // Load existing permissions (custom or role default)
    const perms = resolveUserPermissions(user);
    setSelectedPermissions([...perms]);
    setModalActiveSection('info');
    setIsModalOpen(true);
  };

  // When role changes inside modal, bulk update permissions to role defaults
  const handleRoleChangeInModal = (newRole: SystemRole) => {
    setSystemRole(newRole);
    const defaults = roleTemplates[newRole] || DEFAULT_ROLE_PERMISSIONS[newRole] || [];
    setSelectedPermissions([...defaults]);
    info('تم تحديث الصلاحيات تلقائياً', `تم تطبيق الحزمة الافتراضية لوظيفة [${roleStyles[newRole].label}]`);
  };

  const handleToggleProject = (projectId: string) => {
    setAssignedProjects(prev => 
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  // Permission selection helpers
  const handleTogglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSelectAllPermissions = () => {
    setSelectedPermissions(ALL_PERMISSIONS.map(p => p.id));
  };

  const handleDeselectAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleResetToRoleDefault = () => {
    const defaults = roleTemplates[systemRole] || DEFAULT_ROLE_PERMISSIONS[systemRole] || [];
    setSelectedPermissions([...defaults]);
    info('تم استعادة الصلاحيات', `تمت مطابقة الصلاحيات مع قالب [${roleStyles[systemRole].label}] الافتراضي`);
  };

  const handleToggleCategory = (category: PermissionCategory) => {
    const catPermIds = ALL_PERMISSIONS.filter(p => p.category === category).map(p => p.id);
    const allSelected = catPermIds.every(id => selectedPermissions.includes(id));
    if (allSelected) {
      // Deselect category
      setSelectedPermissions(prev => prev.filter(id => !catPermIds.includes(id)));
    } else {
      // Select all in category
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...catPermIds])));
    }
  };

  // Save User (Create or Update)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !workEmail.trim()) {
      error('يرجى ملء الاسم والبريد المهني');
      return;
    }

    if (editingUserId) {
      const existing = users.find(u => u.id === editingUserId);
      if (!existing) return;

      const updatedUser: User = {
        ...existing,
        full_name: fullName.trim(),
        work_email: workEmail.trim().toLowerCase(),
        system_role: systemRole,
        department: department.trim(),
        phone: phone.trim() || undefined,
        assigned_projects: systemRole === 'Admin' ? ['ALL'] : assignedProjects,
        custom_permissions: [...selectedPermissions]
      };

      const res = dbService.updateUser(updatedUser);
      if (res.success) {
        success('تم تحديث بيانات وصلاحيات الموظف بنجاح', updatedUser.full_name);
        reloadUsers();
        setIsModalOpen(false);
      } else {
        error('فشل التحديث', res.error?.message);
      }
    } else {
      const newUser: User = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        full_name: fullName.trim(),
        work_email: workEmail.trim().toLowerCase(),
        system_role: systemRole,
        department: department.trim(),
        phone: phone.trim() || undefined,
        assigned_projects: systemRole === 'Admin' ? ['ALL'] : assignedProjects,
        account_status: true,
        created_at: new Date().toISOString(),
        custom_permissions: [...selectedPermissions]
      };

      const res = dbService.createUser(newUser);
      if (res.success) {
        success('تم إنشاء الموظف وتفعيل صلاحياته', newUser.full_name);
        reloadUsers();
        setIsModalOpen(false);
      } else {
        error('فشل إنشاء الحساب', res.error?.message);
      }
    }
  };

  const handleToggleAccountStatus = (user: User) => {
    const updated = { ...user, account_status: !user.account_status };
    const res = dbService.updateUser(updated);
    if (res.success) {
      reloadUsers();
      info(updated.account_status ? 'تم تنشيط الحساب' : 'تم تعطيل الحساب', user.full_name);
    } else {
      error('فشل تحديث الحالة', res.error?.message);
    }
  };

  // Save Baseline Role Template
  const handleSaveRoleTemplate = (role: SystemRole, perms: string[]) => {
    const updated = { ...roleTemplates, [role]: perms };
    setRoleTemplates(updated);
    saveRoleTemplates(updated);
    success('تم حفظ القالب الافتراضي', `تم تحديث حزمة صلاحيات وظيفة [${roleStyles[role].label}]`);
  };

  const roleStyles: Record<SystemRole, { label: string; badge: 'danger' | 'navy' | 'warning' | 'mint' | 'slate' }> = {
    Admin: { label: 'مدير النظام', badge: 'danger' },
    Doc_Controller: { label: 'مراقب المستندات', badge: 'navy' },
    Project_Manager: { label: 'مدير المشروع', badge: 'warning' },
    Engineer: { label: 'مهندس المكتب الفني', badge: 'mint' },
    Viewer: { label: 'مدقق ومستعرض', badge: 'slate' },
  };

  const filteredUsers = users.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.work_email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      roleStyles[u.system_role]?.label.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#1E293B] border border-[#334155] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-sky-400" />
            <span>إدارة الموظفين ونظام الصلاحيات</span>
          </h2>
          <p className="text-xs text-[#8097AE] mt-1">
            إدارة بيانات الموظفين وتخصيص الصلاحيات الفردية وقوالب الوظائف بدقة متناهية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreateModal}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            إنشاء حساب موظف جديد
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-[#334155] pb-2 gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#005B96] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>قائمة الموظفين والصلاحيات ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-[#005B96] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>قوالب الصلاحيات الافتراضية للوظائف</span>
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="relative w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، البريد، أو الوظيفة..."
              className="w-full px-3 py-1.5 pl-8 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        )}
      </div>

      {/* TAB 1: USERS LIST & INDIVIDUAL PERMISSIONS */}
      {activeTab === 'users' && (
        <div className="bg-[#1E293B] rounded-2xl border border-[#334155] shadow-sm overflow-hidden">
          <table className="w-full text-right text-xs table-auto">
            <thead className="bg-[#0F172A] text-white">
              <tr>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">الموظف</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">الوظيفة</th>
                <th className="py-3 px-3 font-semibold">القسم</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">الصلاحيات</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">المشاريع</th>
                <th className="py-3 px-2.5 font-semibold text-center whitespace-nowrap">الحالة</th>
                <th className="py-3 px-3 font-semibold text-center whitespace-nowrap">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#334155]">
              {filteredUsers.map(u => {
                const perms = resolveUserPermissions(u);
                const isCustom = isCustomPermissions(u);

                return (
                  <tr key={u.id} className="hover:bg-slate-800/60 transition-colors">
                    {/* Name & Contact */}
                    <td className="py-3 px-3 font-semibold text-slate-100 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#005B96]/30 text-sky-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-bold text-xs">{u.full_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono" dir="ltr">{u.work_email}</div>
                        </div>
                      </div>
                    </td>

                    {/* System Role */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge variant={roleStyles[u.system_role].badge} size="sm" className="whitespace-nowrap font-bold">
                        {roleStyles[u.system_role].label}
                      </Badge>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3 text-slate-300 text-[11px] leading-relaxed">
                      {u.department}
                    </td>

                    {/* Permissions Counter & Custom Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-sky-300 bg-sky-950/40 px-2 py-0.5 rounded-lg border border-sky-800/40 text-[11px] whitespace-nowrap inline-flex items-center gap-1">
                          <span className="text-white font-bold">{perms.length}</span>
                          <span className="text-slate-500 font-sans">/</span>
                          <span>{ALL_PERMISSIONS.length}</span>
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
                          isCustom 
                            ? 'text-amber-300 bg-amber-950/40 border-amber-800/40' 
                            : 'text-slate-400 bg-slate-800/80 border-slate-700'
                        }`}>
                          {isCustom ? 'مخصصة' : 'افتراضية'}
                        </span>
                      </div>
                    </td>

                    {/* Projects */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {u.system_role === 'Admin' ? (
                          <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40 whitespace-nowrap">
                            كافة المشاريع
                          </span>
                        ) : (
                          u.assigned_projects.map(pid => (
                            <span key={pid} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0F172A] text-slate-300 border border-[#334155] whitespace-nowrap">
                              {pid}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-2.5 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                        u.account_status 
                          ? 'bg-[#A7CCB5]/20 text-[#A7CCB5] border-[#A7CCB5]/40' 
                          : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                      }`}>
                        {u.account_status ? 'مفعل' : 'معطل'}
                      </span>
                    </td>

                    {/* Actions (Icon-Only Buttons with Floating Tooltips) */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <ActionIconButton
                          icon={<FileEdit className="w-3.5 h-3.5 text-amber-400" />}
                          label="تعديل بيانات وصلاحيات الموظف"
                          variant="amber"
                          tooltipAlign="left"
                          onClick={() => handleOpenEditModal(u)}
                        />

                        <ActionIconButton
                          icon={u.account_status ? <UserX className="w-3.5 h-3.5 text-rose-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                          label={u.account_status ? 'تعطيل حساب الموظف' : 'تنشيط وتفعيل الحساب'}
                          variant={u.account_status ? 'rose' : 'mint'}
                          tooltipAlign="left"
                          onClick={() => handleToggleAccountStatus(u)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: ROLE BASELINE TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0F172A]/80 border border-[#334155] text-xs text-slate-300 flex items-start gap-2.5">
            <Sliders className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">تحديد الصلاحيات الافتراضية لكل وظيفة مسبقاً:</span>
              <span>
                تُطبق هذه الحزم التلقائية على أي موظف يتم تعيينه بالوظيفة، ويمكنك في أي وقت فتح بطاقة موظف معين وتعديل أو قفل أي صلاحية فردية له بالذات دون التأثير على بقية زملائه.
              </span>
            </div>
          </div>

          {/* Role selector tabs */}
          <div className="flex flex-wrap gap-2">
            {(['Admin', 'Project_Manager', 'Engineer', 'Doc_Controller', 'Viewer'] as SystemRole[]).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedTemplateRole(role)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTemplateRole === role
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-[#1E293B] text-slate-400 hover:text-white border border-[#334155]'
                }`}
              >
                {roleStyles[role].label}
              </button>
            ))}
          </div>

          {/* Template Permissions Checklist */}
          <div className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#334155]">
              <div>
                <h3 className="font-bold text-sm text-white">
                  قالب صلاحيات: <span className="text-sky-400">{roleStyles[selectedTemplateRole].label}</span>
                </h3>
                <span className="text-xs text-slate-400">
                  مفعل حالياً: {(roleTemplates[selectedTemplateRole] || []).length} من {ALL_PERMISSIONS.length} صلاحية
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const defaults = DEFAULT_ROLE_PERMISSIONS[selectedTemplateRole];
                    handleSaveRoleTemplate(selectedTemplateRole, [...defaults]);
                  }}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  استعادة الافتراضي الأصلي
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleSaveRoleTemplate(selectedTemplateRole, roleTemplates[selectedTemplateRole] || []);
                  }}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  حفظ تعديلات القالب
                </Button>
              </div>
            </div>

            {/* Checklist by categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PERMISSION_CATEGORIES.map(cat => {
                const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat.id);
                const currentPerms = roleTemplates[selectedTemplateRole] || [];

                return (
                  <div key={cat.id} className="p-4 rounded-xl bg-[#0F172A] border border-[#334155] space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-[#334155]">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-sky-400" />
                        <span>{cat.label}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          const catIds = catPerms.map(p => p.id);
                          const allChecked = catIds.every(id => currentPerms.includes(id));
                          const newPerms = allChecked
                            ? currentPerms.filter(id => !catIds.includes(id))
                            : Array.from(new Set([...currentPerms, ...catIds]));
                          setRoleTemplates(prev => ({ ...prev, [selectedTemplateRole]: newPerms }));
                        }}
                        className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold"
                      >
                        تبديل القسم
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {catPerms.map(perm => {
                        const isChecked = currentPerms.includes(perm.id);

                        return (
                          <div
                            key={perm.id}
                            onClick={() => {
                              const newPerms = isChecked
                                ? currentPerms.filter(id => id !== perm.id)
                                : [...currentPerms, perm.id];
                              setRoleTemplates(prev => ({ ...prev, [selectedTemplateRole]: newPerms }));
                            }}
                            className={`p-2 rounded-lg text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                              isChecked ? 'bg-sky-950/40 border border-sky-800/40 text-sky-100' : 'bg-[#1E293B] border border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="mt-0.5 rounded text-[#005B96]"
                            />
                            <div>
                              <div className="font-bold">{perm.label}</div>
                              <div className="text-[10px] text-slate-400">{perm.description}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CREATE & EDIT EMPLOYEE MODAL (WITH GRANULAR PERMISSIONS CHECKLIST) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUserId ? `تعديل بيانات الموظف: ${fullName}` : 'إضافة موظف جديد'}
        subtitle="البيانات الوظيفية وتحديد الصلاحيات"
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveUser} className="space-y-5">
          {/* Modal Tab Switcher */}
          <div className="flex items-center gap-2 border-b border-[#334155] pb-2">
            <button
              type="button"
              onClick={() => setModalActiveSection('info')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                modalActiveSection === 'info'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              البيانات الوظيفية
            </button>
            <button
              type="button"
              onClick={() => setModalActiveSection('permissions')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                modalActiveSection === 'permissions'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>صلاحيات الموظف</span>
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-mono bg-slate-900/80 text-amber-300 border border-amber-500/30">
                {selectedPermissions.length}
              </span>
            </button>
          </div>

          {/* Section 1: Basic Info */}
          {modalActiveSection === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    اسم الموظف: *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: م. أحمد محمد إبراهيم"
                    className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    البريد الإلكتروني: *
                  </label>
                  <input
                    type="email"
                    required
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="eng.ahmed@hrsup.com"
                    className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none font-mono transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    الوظيفة: *
                  </label>
                  <select
                    value={systemRole}
                    onChange={(e) => handleRoleChangeInModal(e.target.value as SystemRole)}
                    className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 focus:ring-2 focus:ring-[#005B96] outline-none font-bold text-sky-400 transition-all cursor-pointer"
                  >
                    <option value="Engineer">مهندس المكتب الفني</option>
                    <option value="Project_Manager">مدير المشروع</option>
                    <option value="Doc_Controller">مراقب المستندات</option>
                    <option value="Viewer">مدقق ومستعرض</option>
                    <option value="Admin">مدير النظام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    القسم:
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  رقم الهاتف:
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+20 100 000 0000"
                  className="w-full px-3 py-2 text-xs bg-[#0F172A] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-[#005B96] outline-none font-mono transition-all"
                />
              </div>

              {/* Projects Assignment */}
              {systemRole !== 'Admin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    المشاريع المصرح بها:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                    {projects.map(p => {
                      const isChecked = assignedProjects.includes(p.project_id);
                      return (
                        <div
                          key={p.project_id}
                          onClick={() => handleToggleProject(p.project_id)}
                          className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all duration-200 ${
                            isChecked ? 'border-[#005B96] bg-[#005B96]/20 font-semibold text-sky-300 shadow-xs' : 'border-[#334155] bg-[#0F172A] hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <span>[{p.project_code}] {p.project_name}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-[#005B96]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/40 via-[#0F172A] to-sky-950/30 border border-sky-800/40 text-xs text-sky-200 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span>
                    الصلاحيات المحددة لهذا الموظف: <strong className="text-white font-mono text-sm mr-1">{selectedPermissions.length}</strong> صلاحية
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setModalActiveSection('permissions')}
                  className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-xs transition-all duration-200 shadow-md shadow-sky-600/20 cursor-pointer"
                >
                  <span>تخصيص الصلاحيات</span>
                  <ArrowLeft className="w-4 h-4 text-sky-200 transition-transform duration-200 group-hover:-translate-x-1" />
                </button>
              </div>
            </div>
          )}

          {/* Section 2: Granular Multi-choice Permissions Checklist */}
          {modalActiveSection === 'permissions' && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="p-3 rounded-xl bg-[#0F172A] border border-[#334155] flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-bold">
                    الصلاحيات المحددة:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-500 text-white shadow-xs">
                    {selectedPermissions.length} من {ALL_PERMISSIONS.length}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSelectAllPermissions}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors cursor-pointer"
                  >
                    تحديد الكل
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllPermissions}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors cursor-pointer"
                  >
                    إلغاء التحديد
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToRoleDefault}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-600/40 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>استعادة الصلاحيات الافتراضية</span>
                  </button>
                </div>
              </div>

              {/* Categorized Checkbox List */}
              <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-1">
                {PERMISSION_CATEGORIES.map(cat => {
                  const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat.id);
                  const selectedCount = catPerms.filter(p => selectedPermissions.includes(p.id)).length;

                  return (
                    <div key={cat.id} className="p-3.5 rounded-xl bg-[#0F172A]/70 border border-[#334155] space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-[#334155]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{cat.label}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                            {selectedCount} / {catPerms.length}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleCategory(cat.id)}
                          className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                        >
                          {selectedCount === catPerms.length ? 'إلغاء تحديد القسم' : 'تحديد كل القسم'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catPerms.map(perm => {
                          const isChecked = selectedPermissions.includes(perm.id);

                          return (
                            <div
                              key={perm.id}
                              onClick={() => handleTogglePermission(perm.id)}
                              className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-sky-950/50 border-sky-500/50 text-white shadow-xs'
                                  : 'bg-[#1E293B]/70 border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // Handled by container onClick
                                className="mt-0.5 rounded text-[#005B96] focus:ring-0 cursor-pointer"
                              />
                              <div className="space-y-0.5">
                                <div className="font-bold leading-tight">{perm.label}</div>
                                <div className="text-[10px] text-slate-400 leading-normal">{perm.description}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#334155]">
            <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" size="md">
              {editingUserId ? 'حفظ وتحديث الصلاحيات' : 'حفظ وإنشاء الموظف'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
