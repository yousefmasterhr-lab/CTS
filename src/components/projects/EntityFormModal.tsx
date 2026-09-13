// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Stakeholder Entity Add / Edit Modal
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState, useEffect } from 'react';
import { Entity, EntityRole, LegalEntityType, EntityStatus, ENTITY_ROLE_LABELS } from '../../types/entity';
import { dbService } from '../../services/db/firestoreService';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { 
  Building2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  FileText, 
  AlertCircle,
  UserCheck,
  Hash
} from 'lucide-react';

interface EntityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  existingEntity?: Entity | null;
}

export const EntityFormModal: React.FC<EntityFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  existingEntity
}) => {
  const { success, error } = useNotification();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [role, setRole] = useState<EntityRole>('Consultant');
  const [legalType, setLegalType] = useState<LegalEntityType>('Company');
  const [registrationNo, setRegistrationNo] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<EntityStatus>('Active');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (existingEntity) {
        setCode(existingEntity.code || '');
        setName(existingEntity.name || '');
        setShortName(existingEntity.short_name || '');
        setRole(existingEntity.role || 'Consultant');
        setLegalType(existingEntity.legal_type || 'Company');
        setRegistrationNo(existingEntity.registration_no || '');
        setTaxNo(existingEntity.tax_no || '');
        setContactPerson(existingEntity.contact_person || '');
        setContactTitle(existingEntity.contact_title || '');
        setPhone(existingEntity.phone || '');
        setMobile(existingEntity.mobile || '');
        setEmail(existingEntity.email || '');
        setAddress(existingEntity.address || '');
        setWebsite(existingEntity.website || '');
        setStatus(existingEntity.status || 'Active');
        setNotes(existingEntity.notes || '');
      } else {
        setCode('');
        setName('');
        setShortName('');
        setRole('Consultant');
        setLegalType('Company');
        setRegistrationNo('');
        setTaxNo('');
        setContactPerson('');
        setContactTitle('');
        setPhone('');
        setMobile('');
        setEmail('');
        setAddress('');
        setWebsite('');
        setStatus('Active');
        setNotes('');
      }
    }
  }, [isOpen, existingEntity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      error('يرجى تحديد كود أو رمز مختصر للجهة.');
      return;
    }

    if (!name.trim()) {
      error('يرجى كتابة الاسم الرسمي أو التجاري للجهة.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingEntity) {
        // Update
        const updated: Entity = {
          ...existingEntity,
          code: code.trim().toUpperCase(),
          name: name.trim(),
          short_name: shortName.trim() || undefined,
          role,
          legal_type: legalType,
          registration_no: registrationNo.trim() || undefined,
          tax_no: taxNo.trim() || undefined,
          contact_person: contactPerson.trim() || undefined,
          contact_title: contactTitle.trim() || undefined,
          phone: phone.trim() || undefined,
          mobile: mobile.trim() || undefined,
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          website: website.trim() || undefined,
          status,
          notes: notes.trim() || undefined
        };

        const res = dbService.updateEntity(updated);
        if (res.success) {
          success(`تم تعديل بيانات الجهة [${updated.name}] بنجاح.`);
          onSaved();
          onClose();
        } else {
          error(res.error?.message || 'فشل تعديل بيانات الجهة.');
        }
      } else {
        // Create
        const newEntity: Entity = {
          id: `ent-${Date.now()}`,
          code: code.trim().toUpperCase(),
          name: name.trim(),
          short_name: shortName.trim() || undefined,
          role,
          legal_type: legalType,
          registration_no: registrationNo.trim() || undefined,
          tax_no: taxNo.trim() || undefined,
          contact_person: contactPerson.trim() || undefined,
          contact_title: contactTitle.trim() || undefined,
          phone: phone.trim() || undefined,
          mobile: mobile.trim() || undefined,
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          website: website.trim() || undefined,
          status,
          notes: notes.trim() || undefined,
          created_at: new Date().toISOString()
        };

        const res = dbService.createEntity(newEntity);
        if (res.success) {
          success(`تمت إضافة الجهة الجديدة [${newEntity.name}] بنجاح.`);
          onSaved();
          onClose();
        } else {
          error(res.error?.message || 'فشل تسجيل الجهة.');
        }
      }
    } catch (err: any) {
      error(err?.message || 'حدث خطأ أثناء حفظ البيانات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingEntity ? 'تعديل بيانات الجهة' : 'إضافة جهة أو شركة جديدة'}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Subtitle */}
        <p className="text-xs text-slate-400">
          تسجيل المكاتب الاستشارية، شركات المقاولات، الجهات المالكة، والموردين بدقة مع تصنيف الكيان وبيانات الاتصال.
        </p>

        {/* Section 1: Classification & Legal Identity */}
        <div className="bg-[#0F172A] p-4 rounded-xl border border-[#334155] space-y-4">
          <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5 border-b border-[#334155]/80 pb-2.5">
            <Building2 className="w-4 h-4" />
            <span>بيانات وتصنيف الجهة أو الشركة</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                نوع الجهة: *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as EntityRole)}
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
              >
                <option value="Consultant">مكتب استشاري (Consultant)</option>
                <option value="Owner">جهة مالكة / صاحب العمل (Owner)</option>
                <option value="Main_Contractor">مقاول عام (Main Contractor)</option>
                <option value="Subcontractor">مقاول باطن (Subcontractor)</option>
                <option value="Supplier">مورد معتمد (Supplier)</option>
                <option value="Government">جهة حكومية / تنظيمية (Regulatory)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الشكل القانوني: *
              </label>
              <select
                value={legalType}
                onChange={(e) => setLegalType(e.target.value as LegalEntityType)}
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
              >
                <option value="Company">شركة (مساهمة / ذ.م.م / تضامن)</option>
                <option value="Legal_Entity">جهة حكومية / هيئة عامة</option>
                <option value="Individual">مؤسسة فردية / مكتب مستقل</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الحالة: *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EntityStatus)}
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
              >
                <option value="Active">نشط (Active)</option>
                <option value="Inactive">غير نشط / معطل (Inactive)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>كود الجهة المختصر: *</span>
                <span className="text-[10px] text-slate-400 font-mono">CON, CTR, MOI</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="مثال: CON-AFIFI"
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                اسم الجهة أو الشركة الكامل: *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: مركز استشارات العفيفي الهندسي"
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الاسم المختصر:
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="مثال: استشارات العفيفي"
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                السجل التجاري:
              </label>
              <input
                type="text"
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                placeholder="رقم السجل التجاري"
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الرقم الضريبي:
              </label>
              <input
                type="text"
                value={taxNo}
                onChange={(e) => setTaxNo(e.target.value)}
                placeholder="الرقم الضريبي"
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Person & Communication */}
        <div className="bg-[#0F172A] p-4 rounded-xl border border-[#334155] space-y-4">
          <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5 border-b border-[#334155] pb-2">
            <UserCheck className="w-4 h-4" />
            <span>بيانات التواصل والمسؤول المباشر</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                اسم الشخص المسؤول:
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="اسم المسؤول أو المهندس المشرف"
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                المسمى الوظيفي:
              </label>
              <input
                type="text"
                value={contactTitle}
                onChange={(e) => setContactTitle(e.target.value)}
                placeholder="مثال: المدير العام / مدير المشروعات"
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                البريد الإلكتروني:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="official@company.com"
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                رقم الموبايل / واتساب:
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+20 100 000 0000"
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الهاتف الأرضي / الفاكس:
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 2 0000 0000"
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                العنوان / المقر الرئيسي:
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="المدينة، الحي، اسم الشارع"
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الموقع الإلكتروني:
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ملاحظات عامة ونطاق الأعمال:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي تفاصيل أو ملاحظات إضافية، سابقة أعمال، أو نطاق التوريد..."
              className="w-full px-3 py-2 text-xs bg-[#1E293B] border border-[#334155] rounded-xl text-white focus:ring-2 focus:ring-[#005B96] outline-none resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#334155]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            className="bg-[#005B96] hover:bg-[#004877]"
          >
            {isSubmitting ? 'جاري الحفظ...' : existingEntity ? 'حفظ التعديلات' : 'تسجيل الجهة الآن'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
