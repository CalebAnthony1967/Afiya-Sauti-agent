import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import PortalLayout from '@/components/PortalLayout';

// Page imports
import Home from '@/pages/Home';
import Simulator from '@/pages/Simulator';
import AmbientHome from '@/pages/ambient/AmbientHome';
import AmbientMonitor from '@/pages/ambient/AmbientMonitor';
import AmbientHistory from '@/pages/ambient/AmbientHistory';

// Patient
import PatientHome from '@/pages/patient/PatientHome';
import PatientAppointments from '@/pages/patient/PatientAppointments';
import PatientMedications from '@/pages/patient/PatientMedications';
import PatientMessages from '@/pages/patient/PatientMessages';
import PatientConsent from '@/pages/patient/PatientConsent';
import PatientTriage from '@/pages/patient/PatientTriage';

// CHP
import ChpHome from '@/pages/chp/ChpHome';
import ChpVisits from '@/pages/chp/ChpVisits';
import ChpGuidance from '@/pages/chp/ChpGuidance';
import ChpMap from '@/pages/chp/ChpMap';
import ChpTriage from '@/pages/chp/ChpTriage';

// Clinician
import ClinicianHome from '@/pages/clinician/ClinicianHome';
import ClinicianDashboard from '@/pages/clinician/ClinicianDashboard';
import ClinicianAnalyticsPage from '@/pages/clinician/ClinicianAnalyticsPage';
import ClinicianCalendarSync from '@/pages/clinician/ClinicianCalendarSync';
import ClinicianScribe from '@/pages/clinician/ClinicianScribe';
import ClinicianAppointments from '@/pages/clinician/ClinicianAppointments';
import ClinicianBeds from '@/pages/clinician/ClinicianBeds';
import ClinicianSign from '@/pages/clinician/ClinicianSign';

// NGO
import NgoHome from '@/pages/ngo/NgoHome';
import NgoAllocation from '@/pages/ngo/NgoAllocation';
import NgoReports from '@/pages/ngo/NgoReports';

// Regional
import RegionalHome from '@/pages/regional/RegionalHome';
import RegionalChp from '@/pages/regional/RegionalChp';
import RegionalLogistics from '@/pages/regional/RegionalLogistics';
import RegionalCompliance from '@/pages/regional/RegionalCompliance';

// MoH
import MohHome from '@/pages/moh/MohHome';
import MohHeatmap from '@/pages/moh/MohHeatmap';
import MohProtocols from '@/pages/moh/MohProtocols';
import MohAccreditation from '@/pages/moh/MohAccreditation';
import MohOutbreaks from '@/pages/moh/MohOutbreaks';

// Research
import ResearchHome from '@/pages/research/ResearchHome';
import ResearchLiterature from '@/pages/research/ResearchLiterature';
import ResearchSignals from '@/pages/research/ResearchSignals';
import ResearchReports from '@/pages/research/ResearchReports';

// Insurance
import InsuranceHome from '@/pages/insurance/InsuranceHome';
import InsuranceRisk from '@/pages/insurance/InsuranceRisk';
import InsuranceAudit from '@/pages/insurance/InsuranceAudit';

// Training
import TrainingHome from '@/pages/training/TrainingHome';
import TrainingPractice from '@/pages/training/TrainingPractice';

// Admin
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminFacilities from '@/pages/admin/AdminFacilities';
import AdminAudit from '@/pages/admin/AdminAudit';
import AdminHealth from '@/pages/admin/AdminHealth';
import AdminTickets from '@/pages/admin/AdminTickets';

// Super Admin
import SuperAdminVault from '@/pages/superadmin/SuperAdminVault';
import SuperAdminUsers from '@/pages/superadmin/SuperAdminUsers';
import SuperAdminAudit from '@/pages/superadmin/SuperAdminAudit';
import SuperAdminAI from '@/pages/superadmin/SuperAdminAI';
import SuperAdminCompliance from '@/pages/superadmin/SuperAdminCompliance';
import SuperAdminMetrics from '@/pages/superadmin/SuperAdminMetrics';
import SuperAdminEmergency from '@/pages/superadmin/SuperAdminEmergency';

// Developer
import DeveloperHome from '@/pages/developer/DeveloperHome';
import DeveloperWebhooks from '@/pages/developer/DeveloperWebhooks';
import DeveloperFhir from '@/pages/developer/DeveloperFhir';
import DeveloperSandbox from '@/pages/developer/DeveloperSandbox';

// Family
import FamilyHome from '@/pages/family/FamilyHome';
import FamilyAppointments, { FamilyMedications, FamilyEmergency } from '@/pages/family/FamilyAppointments';

// Community
import CommunityHome from '@/pages/community/CommunityHome';

// AI Healthcare Agent
import HealthcareChatbot from '@/pages/HealthcareChatbot';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/simulator" element={<Simulator />} />
      <Route path="/ai-assistant" element={<HealthcareChatbot />} />
      <Route path="/chatbot" element={<HealthcareChatbot />} />

      {/* Ambient Portal */}
      <Route element={<PortalLayout role="ambient" title="In-Home Ambient Node" />}>
        <Route path="/ambient" element={<AmbientHome />} />
        <Route path="/ambient/monitor" element={<AmbientMonitor />} />
        <Route path="/ambient/history" element={<AmbientHistory />} />
      </Route>

      {/* Patient Portal */}
      <Route element={<PortalLayout role="patient" title="Patient Portal" />}>
        <Route path="/patient" element={<PatientHome />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/patient/medications" element={<PatientMedications />} />
        <Route path="/patient/messages" element={<PatientMessages />} />
        <Route path="/patient/consent" element={<PatientConsent />} />
        <Route path="/patient/triage" element={<PatientTriage />} />
      </Route>

      {/* Family Portal */}
      <Route element={<PortalLayout role="family" title="Family / Caregiver" />}>
        <Route path="/family" element={<FamilyHome />} />
        <Route path="/family/appointments" element={<FamilyAppointments />} />
        <Route path="/family/medications" element={<FamilyMedications />} />
        <Route path="/family/emergency" element={<FamilyEmergency />} />
      </Route>

      {/* CHP Portal */}
      <Route element={<PortalLayout role="chp" title="CHP Field Portal" />}>
        <Route path="/chp" element={<ChpHome />} />
        <Route path="/chp/visits" element={<ChpVisits />} />
        <Route path="/chp/guidance" element={<ChpGuidance />} />
        <Route path="/chp/map" element={<ChpMap />} />
        <Route path="/chp/triage" element={<ChpTriage />} />
      </Route>

      {/* Clinician Portal */}
      <Route element={<PortalLayout role="clinician" title="Hospital / Clinic" />}>
        <Route path="/clinician" element={<ClinicianHome />} />
        <Route path="/clinician/dashboard" element={<ClinicianDashboard />} />
        <Route path="/clinician/analytics" element={<ClinicianAnalyticsPage />} />
        <Route path="/clinician/calendar-sync" element={<ClinicianCalendarSync />} />
        <Route path="/clinician/scribe" element={<ClinicianScribe />} />
        <Route path="/clinician/appointments" element={<ClinicianAppointments />} />
        <Route path="/clinician/beds" element={<ClinicianBeds />} />
        <Route path="/clinician/sign" element={<ClinicianSign />} />
      </Route>

      {/* NGO Portal */}
      <Route element={<PortalLayout role="ngo_admin" title="NGO / Organisation" />}>
        <Route path="/ngo" element={<NgoHome />} />
        <Route path="/ngo/allocation" element={<NgoAllocation />} />
        <Route path="/ngo/reports" element={<NgoReports />} />
      </Route>

      {/* Regional Portal */}
      <Route element={<PortalLayout role="regional_admin" title="Regional Admin" />}>
        <Route path="/regional" element={<RegionalHome />} />
        <Route path="/regional/chp" element={<RegionalChp />} />
        <Route path="/regional/logistics" element={<RegionalLogistics />} />
        <Route path="/regional/compliance" element={<RegionalCompliance />} />
      </Route>

      {/* MoH Portal */}
      <Route element={<PortalLayout role="moh_admin" title="Ministry of Health" />}>
        <Route path="/moh" element={<MohHome />} />
        <Route path="/moh/heatmap" element={<MohHeatmap />} />
        <Route path="/moh/protocols" element={<MohProtocols />} />
        <Route path="/moh/accreditation" element={<MohAccreditation />} />
        <Route path="/moh/outbreaks" element={<MohOutbreaks />} />
      </Route>

      {/* Research Portal */}
      <Route element={<PortalLayout role="researcher" title="Research & Epidemiology" />}>
        <Route path="/research" element={<ResearchHome />} />
        <Route path="/research/literature" element={<ResearchLiterature />} />
        <Route path="/research/signals" element={<ResearchSignals />} />
        <Route path="/research/reports" element={<ResearchReports />} />
      </Route>

      {/* Insurance Portal */}
      <Route element={<PortalLayout role="insurance" title="Insurance / Payer" />}>
        <Route path="/insurance" element={<InsuranceHome />} />
        <Route path="/insurance/risk" element={<InsuranceRisk />} />
        <Route path="/insurance/audit" element={<InsuranceAudit />} />
      </Route>

      {/* Training Portal */}
      <Route element={<PortalLayout role="training" title="Training & Simulation" />}>
        <Route path="/training" element={<TrainingHome />} />
        <Route path="/training/practice" element={<TrainingPractice />} />
      </Route>

      {/* Admin Portal */}
      <Route element={<PortalLayout role="admin" title="Admin Portal" />}>
        <Route path="/admin" element={<AdminUsers />} />
        <Route path="/admin/facilities" element={<AdminFacilities />} />
        <Route path="/admin/audit" element={<AdminAudit />} />
        <Route path="/admin/health" element={<AdminHealth />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
      </Route>

      {/* Super Admin Portal (vault-protected) */}
      <Route path="/super-admin" element={<SuperAdminVault />} />
      <Route element={<PortalLayout role="super_admin" title="Super Admin Vault" />}>
        <Route path="/super-admin/users" element={<SuperAdminUsers />} />
        <Route path="/super-admin/audit" element={<SuperAdminAudit />} />
        <Route path="/super-admin/ai" element={<SuperAdminAI />} />
        <Route path="/super-admin/compliance" element={<SuperAdminCompliance />} />
        <Route path="/super-admin/metrics" element={<SuperAdminMetrics />} />
        <Route path="/super-admin/emergency" element={<SuperAdminEmergency />} />
      </Route>

      {/* Developer Portal */}
      <Route element={<PortalLayout role="developer" title="Developer / Integration" />}>
        <Route path="/developer" element={<DeveloperHome />} />
        <Route path="/developer/webhooks" element={<DeveloperWebhooks />} />
        <Route path="/developer/fhir" element={<DeveloperFhir />} />
        <Route path="/developer/sandbox" element={<DeveloperSandbox />} />
      </Route>

      {/* Community Intelligence Portal */}
      <Route element={<PortalLayout role="community_intel" title="Community Health Intelligence" />}>
        <Route path="/community" element={<CommunityHome />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App