// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Main Application Shell & View Coordinator (Eye-Care Theme)
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

import React, { useState } from 'react';
import { Sidebar, NavigationTab } from './Sidebar';
import { Header } from './Header';
import { Footer } from '../common/Footer';
import { ExecutiveDashboard } from '../dashboard/ExecutiveDashboard';
import { OmniSearchGrid } from '../correspondence/OmniSearchGrid';
import { InboundWorkspace } from '../correspondence/InboundWorkspace';
import { OutboundWorkspace } from '../correspondence/OutboundWorkspace';
import { InboundEntryModal } from '../correspondence/InboundEntryModal';
import { OutboundDraftModal } from '../correspondence/OutboundDraftModal';
import { DocumentDossierModal } from '../correspondence/DocumentDossierModal';
import { ReturnForRevisionModal } from '../correspondence/ReturnForRevisionModal';
import { TelegramBotHub } from '../admin/TelegramBotHub';
import { TicketKanbanBoard } from '../admin/TicketKanbanBoard';
import { UserManagement } from '../admin/UserManagement';
import { AuditTrailView } from '../admin/AuditTrailView';
import { ProjectManagementHub } from '../projects/ProjectManagementHub';
import { IssueReporterModal } from '../feedback/IssueReporterModal';
import { MySubmissionsDrawer } from '../feedback/MySubmissionsDrawer';
import { Correspondence } from '../../types/correspondence';
import { dbService } from '../../services/db/firestoreService';

export const AppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal Controls
  const [isInboundOpen, setIsInboundOpen] = useState(false);
  const [editingInboundDoc, setEditingInboundDoc] = useState<Correspondence | null>(null);
  const [parentOutboundForInboundReply, setParentOutboundForInboundReply] = useState<Correspondence | null>(null);
  const [isOutboundOpen, setIsOutboundOpen] = useState(false);
  const [parentInboundForReply, setParentInboundForReply] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<Correspondence | null>(null);

  // Return for Revision Modal State
  const [returningDoc, setReturningDoc] = useState<Correspondence | null>(null);

  const [selectedDossierDoc, setSelectedDossierDoc] = useState<Correspondence | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);

  // Refresh trigger counter for child components
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenDocById = (docId: string) => {
    const doc = dbService.getCorrespondenceById(docId);
    if (doc) {
      setSelectedDossierDoc(doc);
    }
  };

  const handleReplyToInbound = (inboundDoc: Correspondence) => {
    setParentInboundForReply(inboundDoc.doc_id);
    setEditingDraft(null);
    setIsOutboundOpen(true);
  };

  const handleRecordInboundReply = (outboundDoc: Correspondence) => {
    setParentOutboundForInboundReply(outboundDoc);
    setEditingInboundDoc(null);
    setIsInboundOpen(true);
  };

  const handleQuickApproveDraft = (draftDoc: Correspondence) => {
    setEditingDraft(draftDoc);
    setParentInboundForReply(draftDoc.parent_doc_id || null);
    setIsOutboundOpen(true);
  };

  const handleEditDoc = (doc: Correspondence) => {
    if (doc.doc_type === 'Incoming') {
      setEditingInboundDoc(doc);
      setIsInboundOpen(true);
    } else {
      setEditingDraft(doc);
      setParentInboundForReply(doc.parent_doc_id || null);
      setIsOutboundOpen(true);
    }
  };

  const handleReturnDoc = (doc: Correspondence) => {
    setReturningDoc(doc);
  };

  // Handle Tab Switch: Clean navigation to the workspace
  const handleTabChange = (tab: NavigationTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B1120] text-[#F1F5F9] font-sans antialiased">
      {/* 1. Deep-Navy Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenMySubmissions={() => setIsSubmissionsOpen(true)}
        />

        {/* Scrollable View Area (Eye-Friendly Dark Slate Background) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0B1120] bg-cad-grid-dark">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <ExecutiveDashboard
                onNavigateTab={handleTabChange}
                onOpenInbound={() => setIsInboundOpen(true)}
                onOpenOutbound={() => {
                  setEditingDraft(null);
                  setParentInboundForReply(null);
                  setIsOutboundOpen(true);
                }}
                onSelectDoc={handleOpenDocById}
              />
            )}

            {activeTab === 'correspondence' && (
              <OmniSearchGrid
                key={refreshTrigger}
                onOpenDossier={(doc) => setSelectedDossierDoc(doc)}
                onReplyToInbound={handleReplyToInbound}
                onOpenInboundModal={() => setIsInboundOpen(true)}
                onOpenOutboundModal={() => {
                  setEditingDraft(null);
                  setParentInboundForReply(null);
                  setIsOutboundOpen(true);
                }}
              />
            )}

            {activeTab === 'inbound' && (
              <InboundWorkspace
                key={refreshTrigger}
                onOpenIntakeModal={() => {
                  setEditingInboundDoc(null);
                  setIsInboundOpen(true);
                }}
                onOpenDossier={(doc) => setSelectedDossierDoc(doc)}
                onReplyToInbound={handleReplyToInbound}
                onEditInbound={(doc) => {
                  setEditingInboundDoc(doc);
                  setIsInboundOpen(true);
                }}
                onReturnInbound={handleReturnDoc}
              />
            )}

            {activeTab === 'outbound' && (
              <OutboundWorkspace
                key={refreshTrigger}
                onOpenDraftModal={() => {
                  setEditingDraft(null);
                  setParentInboundForReply(null);
                  setIsOutboundOpen(true);
                }}
                onOpenDossier={(doc) => setSelectedDossierDoc(doc)}
                onQuickApprove={handleQuickApproveDraft}
                onEditOutbound={(doc) => {
                  setEditingDraft(doc);
                  setParentInboundForReply(doc.parent_doc_id || null);
                  setIsOutboundOpen(true);
                }}
                onReturnOutbound={handleReturnDoc}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectManagementHub 
                key={refreshTrigger} 
                onRefreshGlobal={handleRefreshData}
                onOpenDocDossier={(doc) => setSelectedDossierDoc(doc)}
              />
            )}

            {activeTab === 'tickets' && (
              <TicketKanbanBoard key={refreshTrigger} />
            )}

            {activeTab === 'telegram' && (
              <TelegramBotHub key={refreshTrigger} />
            )}

            {activeTab === 'users' && (
              <UserManagement key={refreshTrigger} />
            )}

            {activeTab === 'audit' && (
              <AuditTrailView key={refreshTrigger} />
            )}
          </div>
        </main>

        {/* Enterprise Footer with Mandatory Copyright Notice */}
        <Footer />
      </div>

      {/* ================= MODALS & DRAWERS ================= */}
      {/* Inbound Intake Pipeline Modal */}
      <InboundEntryModal
        isOpen={isInboundOpen}
        onClose={() => {
          setIsInboundOpen(false);
          setEditingInboundDoc(null);
          setParentOutboundForInboundReply(null);
        }}
        onSaved={handleRefreshData}
        existingDoc={editingInboundDoc}
        parentOutboundDoc={parentOutboundForInboundReply}
      />

      {/* Outbound Drafting & Atomic Approval Stamping Modal */}
      <OutboundDraftModal
        isOpen={isOutboundOpen}
        onClose={() => {
          setIsOutboundOpen(false);
          setParentInboundForReply(null);
          setEditingDraft(null);
        }}
        onSaved={handleRefreshData}
        existingDraft={editingDraft}
        parentInboundId={parentInboundForReply}
      />

      {/* Document Dossier & Contractual Threading Modal */}
      <DocumentDossierModal
        isOpen={!!selectedDossierDoc}
        onClose={() => setSelectedDossierDoc(null)}
        document={selectedDossierDoc}
        onReply={handleReplyToInbound}
        onRecordInboundReply={handleRecordInboundReply}
        onEdit={handleEditDoc}
        onReturnForRevision={handleReturnDoc}
      />

      {/* Return for Revision Modal */}
      <ReturnForRevisionModal
        isOpen={!!returningDoc}
        onClose={() => setReturningDoc(null)}
        document={returningDoc}
        onReturned={handleRefreshData}
      />

      {/* In-App Issue Reporter Modal (Clipboard Screenshot Ctrl+V Supported) */}
      <IssueReporterModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitted={handleRefreshData}
      />

      {/* User Submissions Status Tracker Drawer */}
      <MySubmissionsDrawer
        isOpen={isSubmissionsOpen}
        onClose={() => setIsSubmissionsOpen(false)}
      />
    </div>
  );
};
