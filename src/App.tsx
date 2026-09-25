/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KenyanLanguage, SystemPortal } from './types';
import { PortalDirectory } from './components/layout/PortalDirectory';
import { PortalLayout } from './components/layout/PortalLayout';
import { PORTALS_DIRECTORY } from './config/portalNavigation';

// Portals
import { PatientPortal } from './components/portals/PatientPortal';
import { FamilyPortal } from './components/portals/FamilyPortal';
import { CHPFieldPortal } from './components/portals/CHPFieldPortal';
import { HospitalClinicPortal } from './components/portals/HospitalClinicPortal';
import { MinistryOfHealthPortal } from './components/portals/MinistryOfHealthPortal';
import { SuperAdminVaultPortal } from './components/portals/SuperAdminVaultPortal';
import { AmbientNodeInterface } from './components/portals/AmbientNodeInterface';
import { DeveloperPortal } from './components/portals/DeveloperPortal';
import { TrainingSimulationPortal } from './components/portals/TrainingSimulationPortal';
import { ResearchEpidemiologyPortal } from './components/portals/ResearchEpidemiologyPortal';
import { InsurancePayerPortal } from './components/portals/InsurancePayerPortal';
import { CommunityIntelligencePortal } from './components/portals/CommunityIntelligencePortal';
import { RegionalAdminPortal } from './components/portals/RegionalAdminPortal';
import { NGOOrganisationPortal } from './components/portals/NGOOrganisationPortal';
import { AdminPortal } from './components/portals/AdminPortal';

// Modals & Drawers
import { ChannelSimulatorsModal } from './components/modals/ChannelSimulatorsModal';
import { AuditVerificationDrawer } from './components/modals/AuditVerificationDrawer';
import { FHIRViewerModal } from './components/modals/FHIRViewerModal';
import { SystemArchitectureModal } from './components/modals/SystemArchitectureModal';

export default function App() {
  // selectedRole = null means user is on the Home Portal Selector screen (like / in base44.app)
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('health');
  const [currentLanguage, setCurrentLanguage] = useState<KenyanLanguage>('sw');
  const [aiInferenceActive, setAiInferenceActive] = useState<boolean>(true);

  // Modals state
  const [simulatorsOpen, setSimulatorsOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [fhirOpen, setFhirOpen] = useState(false);
  const [archOpen, setArchOpen] = useState(false);

  const handleToggleAiInference = (currentlyActive: boolean) => {
    setAiInferenceActive(!currentlyActive);
  };

  const handleSelectPortal = (role: string) => {
    setSelectedRole(role);
    const meta = PORTALS_DIRECTORY.find((p) => p.role === role);
    if (meta) {
      setActiveTab(meta.defaultTab);
    }
  };

  const handleBackToDirectory = () => {
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {selectedRole === null ? (
        // Home Portal Directory Screen (Matches gh from afiya-sauti-care.base44.app)
        <PortalDirectory
          onSelectPortal={handleSelectPortal}
          onOpenSimulators={() => setSimulatorsOpen(true)}
          onOpenAudit={() => setAuditOpen(true)}
          onOpenFHIR={() => setFhirOpen(true)}
          onOpenArch={() => setArchOpen(true)}
          currentLanguage={currentLanguage}
          onSelectLanguage={setCurrentLanguage}
          aiInferenceActive={aiInferenceActive}
        />
      ) : (
        // Sidebar + Header Portal Layout (Matches ph from afiya-sauti-care.base44.app)
        <PortalLayout
          currentRole={selectedRole}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onBackToDirectory={handleBackToDirectory}
          onSelectPortal={handleSelectPortal}
          onOpenSimulators={() => setSimulatorsOpen(true)}
          onOpenAudit={() => setAuditOpen(true)}
          onOpenFHIR={() => setFhirOpen(true)}
          onOpenArch={() => setArchOpen(true)}
          currentLanguage={currentLanguage}
          onSelectLanguage={setCurrentLanguage}
          aiInferenceActive={aiInferenceActive}
        >
          {/* Active Portal Content */}
          {selectedRole === 'patient' && (
            <PatientPortal
              currentLanguage={currentLanguage}
              onOpenFHIR={() => setFhirOpen(true)}
              activeTab={activeTab}
            />
          )}
          {selectedRole === 'family' && <FamilyPortal />}
          {selectedRole === 'chp' && <CHPFieldPortal />}
          {selectedRole === 'clinician' && <HospitalClinicPortal activeTab={activeTab} />}
          {selectedRole === 'moh_admin' && <MinistryOfHealthPortal />}
          {selectedRole === 'super_admin' && (
            <SuperAdminVaultPortal
              aiInferenceActive={aiInferenceActive}
              onToggleAiInference={handleToggleAiInference}
              onOpenAuditInspector={() => setAuditOpen(true)}
            />
          )}
          {selectedRole === 'ambient' && <AmbientNodeInterface />}
          {selectedRole === 'developer' && <DeveloperPortal />}
          {selectedRole === 'training' && <TrainingSimulationPortal />}
          {selectedRole === 'researcher' && <ResearchEpidemiologyPortal />}
          {selectedRole === 'insurance' && <InsurancePayerPortal />}
          {selectedRole === 'community_intel' && <CommunityIntelligencePortal />}
          {selectedRole === 'regional_admin' && <RegionalAdminPortal />}
          {selectedRole === 'ngo_admin' && <NGOOrganisationPortal />}
          {selectedRole === 'admin' && <AdminPortal />}
        </PortalLayout>
      )}

      {/* Interactive Simulators Modal (WhatsApp, USSD *384#, IVR) */}
      <ChannelSimulatorsModal
        isOpen={simulatorsOpen}
        onClose={() => setSimulatorsOpen(false)}
        currentLanguage={currentLanguage}
      />

      {/* Cryptographic Audit Trail Inspector Drawer */}
      <AuditVerificationDrawer isOpen={auditOpen} onClose={() => setAuditOpen(false)} />

      {/* HL7 FHIR R4 Bundle Modal */}
      <FHIRViewerModal isOpen={fhirOpen} onClose={() => setFhirOpen(false)} />

      {/* System Architecture & Ops Modal */}
      <SystemArchitectureModal isOpen={archOpen} onClose={() => setArchOpen(false)} />
    </div>
  );
}
