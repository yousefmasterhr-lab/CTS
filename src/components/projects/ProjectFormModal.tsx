// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Engineering Project Add / Edit Modal (Spacious & Modern)
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, CurrencyCode } from '../../types/project';
import { Entity } from '../../types/entity';
import { dbService } from '../../services/db/firestoreService';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { 
  FolderGit2, 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText,
  UserCheck,
  Coins
} from 'lucide-react';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  existingProject?: Project | null;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  existingProject
}) => {
  const { success, error } = useNotification();
  const [entities, setEntities] = useState<Entity[]>([]);

  const [projectCode, setProjectCode] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [consultantName, setConsultantName] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('Active');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [totalBudget, setTotalBudget] = useState<number | ''>('');
  const [currency, setCurrency] = useState<CurrencyCode>('EGP');
  const [description, setDescription] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const allEntities = dbService.getEntities();
      setEntities(allEntities);

      if (existingProject) {
        setProjectCode(existingProject.project_code || '');
        setProjectId(existingProject.project_id || '');
        setProjectName(existingProject.project_name || '');
        setClientName(existingProject.client_name || '');
        setConsultantName(existingProject.consultant_name || '');
        setContractorName(existingProject.contractor_name || '');
        setProjectStatus(existingProject.project_status || 'Active');
        setStartDate(existingProject.start_date || new Date().toISOString().split('T')[0]);
        setEndDate(existingProject.end_date || '');
        setLocation(existingProject.location || '');
        setTotalBudget(
          existingProject.total_budget !== undefined 
            ? existingProject.total_budget 
            : existingProject.total_budget_sar !== undefined 
            ? existingProject.total_budget_sar 
            : ''
        );
        setCurrency(existingProject.currency || 'EGP');
        setDescription(existingProject.description || '');
        setScopeOfWork(existingProject.scope_of_work || '');
        setNotes(existingProject.notes || '');
      } else {
        setProjectCode('');
        setProjectId('');
        setProjectName('');
        // Suggest defaults if entities exist
        const defaultClient = allEntities.find(e => e.role === 'Owner')?.name || '';
        const defaultConsultant = allEntities.find(e => e.role === 'Consultant')?.name || '';
        const defaultContractor = allEntities.find(e => e.role === 'Main_Contractor')?.name || '';

        setClientName(defaultClient);
        setConsultantName(defaultConsultant);
        setContractorName(defaultContractor);
        setProjectStatus('Active');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setLocation('');
        setTotalBudget('');
        setCurrency('EGP');
        setDescription('');
        setScopeOfWork('');
        setNotes('');
      }
    }
  }, [isOpen, existingProject]);

  const handleCodeChange = (val: string) => {
    const cleanCode = val.trim();
    setProjectCode(cleanCode);
    if (!existingProject) {
      setProjectId(cleanCode ? `PRJ-${cleanCode}` : '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectCode.trim()) {
      error('يرجى تحديد كود المشروع (مثال: 1233).');
      return;
    }

    if (!projectName.trim()) {
      error('يرجى كتابة اسم المشروع.');
      return;
    }

    setIsSubmitting(true);

    try {
      const budgetNum = totalBudget !== '' ? Number(totalBudget) : undefined;

      if (existingProject) {
        // Update
        const updated: Project = {
          ...existingProject,
          project_code: projectCode.trim(),
          project_id: projectId.trim() || `PRJ-${projectCode.trim()}`,
          project_name: projectName.trim(),
          client_name: clientName.trim(),
          consultant_name: consultantName.trim(),
          contractor_name: contractorName.trim(),
          project_status: projectStatus,
          start_date: startDate,
          end_date: endDate || undefined,
          location: location.trim() || undefined,
          total_budget: budgetNum,
          total_budget_sar: currency === 'SAR' ? budgetNum : undefined,
          currency,
          description: description.trim() || undefined,
          scope_of_work: scopeOfWork.trim() || undefined,
          notes: notes.trim() || undefined
        };

        const res = dbService.updateProject(updated);
        if (res.success) {
          success(`تم تحديث بيانات المشروع [${updated.project_name}] بنجاح.`);
          onSaved();
          onClose();
        } else {
          error(res.error?.message || 'فشل تحديث بيانات المشروع.');
        }
      } else {
        // Create
        const newProject: Project = {
          project_id: projectId.trim() || `PRJ-${projectCode.trim()}`,
          project_code: projectCode.trim(),
          project_name: projectName.trim(),
          client_name: clientName.trim() || 'الجهة المالكة',
          consultant_name: consultantName.trim() || 'المكتب الاستشاري',
          contractor_name: contractorName.trim() || 'المقاول العام',
          project_status: projectStatus,
          start_date: startDate,
          end_date: endDate || undefined,
          location: location.trim() || undefined,
          total_budget: budgetNum,
          total_budget_sar: currency === 'SAR' ? budgetNum : undefined,
          currency,
          description: description.trim() || undefined,
          scope_of_work: scopeOfWork.trim() || undefined,
          notes: notes.trim() || undefined,
          created_at: new Date().toISOString()
        };

        const res = dbService.createProject(newProject);
        if (res.success) {
          success(`تم إنشاء وتكويد المشروع [${newProject.project_name}] بنجاح.`);
          onSaved();
          onClose();
        } else {
          error(res.error?.message || 'فشل إنشاء المشروع.');
        }
      }
    } catch (err: any) {
      error(err?.message || 'حدث خطأ أثناء حفظ المشروع.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Grouped entities for easier dropdown picking
  const owners = entities.filter(e => e.role === 'Owner' || e.role === 'Government');
  const consultants = entities.filter(e => e.role === 'Consultant');
  const contractors = entities.filter(e => e.role === 'Main_Contractor' || e.role === 'Subcontractor');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingProject ? 'تعديل بيانات المشروع' : 'تسجيل وتكويد مشروع جديد'}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-slate-400 leading-relaxed">
          إدخال بيانات المشروع وتحديد أطرافه (الجهة المالكة، الاستشاري، والمقاول) لضبط أرقام وسجلات المراسلات.
        </p>

        {/* Section 1: Code & Basic Data */}
        <div className="bg-[#0F172A] p-5 sm:p-6 rounded-2xl border border-[#334155] space-y-5">
          <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2 border-b border-[#334155]/80 pb-3">
            <FolderGit2 className="w-4 h-4" />
            <span>بيانات المشروع والكود</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>كود المشروع: *</span>
                <span className="text-[11px] text-slate-400">مثال: 1233</span>
              </label>
              <input
                type="text"
                required
                value={projectCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="1233"
                className="w-full px-3.5 py-2.5 text-sm bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                الرقم المرجعي (Project ID):
              </label>
              <input
                type="text"
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="PRJ-1233"
                className="w-full px-3.5 py-2.5 text-sm bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                حالة المشروع: *
              </label>
              <select
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value as ProjectStatus)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-medium"
              >
                <option value="Active">قيد التنفيذ (Active)</option>
                <option value="Suspended">متوقف مؤقتاً (Suspended)</option>
                <option value="Handed_Over">تم التسليم والانتهاء (Handed Over)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              اسم المشروع الكامل: *
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="مثال: إنشاء مبنى الحراص بمدينة القصاصين الجديدة - وزارة الداخلية"
              className="w-full px-3.5 py-2.5 text-sm bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-medium"
            />
          </div>
        </div>

        {/* Section 2: Stakeholders */}
        <div className="bg-[#0F172A] p-5 sm:p-6 rounded-2xl border border-[#334155] space-y-5">
          <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2 border-b border-[#334155]/80 pb-3">
            <Building2 className="w-4 h-4" />
            <span>أطراف المشروع (المالك، الاستشاري، المقاول)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Client / Owner */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                الجهة المالكة: *
              </label>
              <select
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
              >
                <option value="">-- اختر من الجهات المسجلة --</option>
                {owners.map(o => (
                  <option key={o.id} value={`[${o.code}] ${o.name}`}>
                    [{o.code}] {o.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="أو اكتب اسم الجهة..."
                className="w-full px-3 py-2 text-xs bg-[#1E293B]/70 border border-[#334155] rounded-xl text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none"
              />
            </div>

            {/* Consultant */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                المكتب الاستشاري المشرف: *
              </label>
              <select
                value={consultantName}
                onChange={(e) => setConsultantName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
              >
                <option value="">-- اختر من الاستشاريين --</option>
                {consultants.map(c => (
                  <option key={c.id} value={`[${c.code}] ${c.name}`}>
                    [{c.code}] {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={consultantName}
                onChange={(e) => setConsultantName(e.target.value)}
                placeholder="أو اكتب اسم الاستشاري..."
                className="w-full px-3 py-2 text-xs bg-[#1E293B]/70 border border-[#334155] rounded-xl text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none"
              />
            </div>

            {/* Contractor */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                المقاول العام المنفذ: *
              </label>
              <select
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
              >
                <option value="">-- اختر من المقاولين --</option>
                {contractors.map(c => (
                  <option key={c.id} value={`[${c.code}] ${c.name}`}>
                    [{c.code}] {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                placeholder="أو اكتب اسم المقاول..."
                className="w-full px-3 py-2 text-xs bg-[#1E293B]/70 border border-[#334155] rounded-xl text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Timeline, Budget & Location */}
        <div className="bg-[#0F172A] p-5 sm:p-6 rounded-2xl border border-[#334155] space-y-5">
          <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2 border-b border-[#334155]/80 pb-3">
            <Calendar className="w-4 h-4" />
            <span>المواعيد والميزانية والموقع</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                تاريخ البدء: *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                تاريخ الانتهاء المتوقع:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
              />
            </div>

            {/* Budget with Separate Currency Selector */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>الميزانية والعملة:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value ? Number(e.target.value) : '')}
                  placeholder="مثال: 45000000"
                  className="flex-1 px-3.5 py-2.5 text-sm bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-28 px-3 py-2.5 text-xs bg-[#1E293B] border border-emerald-500/40 rounded-xl text-emerald-300 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="EGP">EGP (جنيه)</option>
                  <option value="SAR">SAR (ريال)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="AED">AED (درهم)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>الموقع والمدينة:</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: القصاصين الجديدة - الإسماعيلية"
                className="w-full px-3.5 py-2.5 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                وصف المشروع والأعمال:
              </label>
              <input
                type="text"
                value={scopeOfWork}
                onChange={(e) => setScopeOfWork(e.target.value)}
                placeholder="موجز عن الأعمال الإنشائية أو المعمارية..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ملاحظات عامة:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات أو تفاصيل إضافية عن المشروع..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#334155]">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="bg-[#005B96] hover:bg-[#004877] px-6 font-semibold"
          >
            {isSubmitting ? 'جاري الحفظ...' : existingProject ? 'حفظ التعديلات' : 'تسجيل المشروع الآن'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
