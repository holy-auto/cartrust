import { registerRoot, Composition } from "remotion";
import { Slideshow, totalFrames, type SlideDef } from "./Slideshow";

// ── 説明会 ────────────────────────────────────────────────────────────
import { LedraVideo } from "./LedraVideo";

// ── Admin オンボーディング ─────────────────────────────────────────────
import { AdminWelcome } from "./slides/admin-onboarding/Welcome";
import { AdminInitialSetup } from "./slides/admin-onboarding/InitialSetup";
import { AdminRegisterData } from "./slides/admin-onboarding/RegisterData";
import { AdminFirstCertificate } from "./slides/admin-onboarding/FirstCertificate";
import { AdminFirstInvoice } from "./slides/admin-onboarding/FirstInvoice";
import { AdminNextSteps } from "./slides/admin-onboarding/NextSteps";

// ── Insurer オンボーディング ───────────────────────────────────────────
import { InsurerWelcome } from "./slides/insurer-onboarding/Welcome";
import { InsurerSearchCertificate } from "./slides/insurer-onboarding/SearchCertificate";
import { InsurerCaseManagement } from "./slides/insurer-onboarding/CaseManagement";
import { InsurerTeamAndAnalytics } from "./slides/insurer-onboarding/TeamAndAnalytics";

// ── Agent オンボーディング ─────────────────────────────────────────────
import { AgentWelcome } from "./slides/agent-onboarding/Welcome";
import { AgentReferralLink } from "./slides/agent-onboarding/ReferralLink";
import { AgentRegisterReferral } from "./slides/agent-onboarding/RegisterReferral";
import { AgentCommissionAndGrowth } from "./slides/agent-onboarding/CommissionAndGrowth";

// ── 証明書 深掘り ──────────────────────────────────────────────────────
import { CertStructure } from "./slides/certificate-deep/Structure";
import { CertOCRAndPhotos } from "./slides/certificate-deep/OCRAndPhotos";
import { CertQRAndURL } from "./slides/certificate-deep/QRAndURL";
import { CertBlockchain } from "./slides/certificate-deep/Blockchain";
import { CertBatchAndExport } from "./slides/certificate-deep/BatchAndExport";

// ── Admin 完全ガイド ───────────────────────────────────────────────────
import { AdminFullIntro as AdminIntro } from "./slides/admin-full/00_Intro";
import { Ch1Divider } from "./slides/admin-full/01_Ch1_Divider";
import { DashboardKPI } from "./slides/admin-full/02_Dashboard_KPI";
import { DashboardWidgets } from "./slides/admin-full/03_Dashboard_Widgets";
import { Ch2Divider } from "./slides/admin-full/04_Ch2_Divider";
import { CertList } from "./slides/admin-full/05_Cert_List";
import { CertIssue } from "./slides/admin-full/06_Cert_Issue";
import { CertOps } from "./slides/admin-full/07_Cert_Ops";
import { Ch3Divider } from "./slides/admin-full/08_Ch3_Divider";
import { VehicleRegister } from "./slides/admin-full/09_Vehicle_Register";
import { VehicleTimeline } from "./slides/admin-full/10_Vehicle_Timeline";
import { Customer360 } from "./slides/admin-full/11_Customer_360";
import { Ch4Divider } from "./slides/admin-full/12_Ch4_Divider";
import { ReservationMgmt } from "./slides/admin-full/13_Reservation_Mgmt";
import { JobWorkflow } from "./slides/admin-full/14_Job_Workflow";
import { WalkInJob } from "./slides/admin-full/15_WalkIn_Job";
import { Ch5Divider } from "./slides/admin-full/16_Ch5_Divider";
import { Invoice } from "./slides/admin-full/17_Invoice";
import { POSSquare } from "./slides/admin-full/18_POS_Square";
import { Analytics } from "./slides/admin-full/19_Analytics";
import { Ch6Divider } from "./slides/admin-full/20_Ch6_Divider";
import { BtoBFull } from "./slides/admin-full/21_BtoB";
import { Ch7Divider } from "./slides/admin-full/22_Ch7_Divider";
import { SettingsMembers } from "./slides/admin-full/23_Settings_Members";
import { SecurityBilling } from "./slides/admin-full/24_Security_Billing";

// ── ワークフロー 深掘り ────────────────────────────────────────────────
import { WorkflowOverview } from "./slides/workflow-deep/Overview";
import { WorkflowStatusStepper } from "./slides/workflow-deep/StatusStepper";
import { WorkflowWalkIn } from "./slides/workflow-deep/WalkIn";
import { WorkflowDuplicateGuard } from "./slides/workflow-deep/DuplicateGuard";
import { WorkflowContextCarryover } from "./slides/workflow-deep/ContextCarryover";

// ─────────────────────────────────────────────────────────────────────
// スライド定義
// ─────────────────────────────────────────────────────────────────────

const ADMIN_SLIDES: SlideDef[] = [
  { component: AdminWelcome },
  { component: AdminInitialSetup },
  { component: AdminRegisterData },
  { component: AdminFirstCertificate },
  { component: AdminFirstInvoice },
  { component: AdminNextSteps },
];

const INSURER_SLIDES: SlideDef[] = [
  { component: InsurerWelcome },
  { component: InsurerSearchCertificate },
  { component: InsurerCaseManagement },
  { component: InsurerTeamAndAnalytics },
];

const AGENT_SLIDES: SlideDef[] = [
  { component: AgentWelcome },
  { component: AgentReferralLink },
  { component: AgentRegisterReferral },
  { component: AgentCommissionAndGrowth },
];

const CERT_SLIDES: SlideDef[] = [
  { component: CertStructure },
  { component: CertOCRAndPhotos },
  { component: CertQRAndURL },
  { component: CertBlockchain },
  { component: CertBatchAndExport },
];

// チャプター区切りは短め (450f = 15s)、本編スライドは長め (1500f = 50s)
const ADMIN_FULL_SLIDES: SlideDef[] = [
  { component: AdminIntro,        frames: 900  }, // 30s
  { component: Ch1Divider,        frames: 450  }, // 15s
  { component: DashboardKPI,      frames: 1500 },
  { component: DashboardWidgets,  frames: 1500 },
  { component: Ch2Divider,        frames: 450  },
  { component: CertList,          frames: 1500 },
  { component: CertIssue,         frames: 1500 },
  { component: CertOps,           frames: 1500 },
  { component: Ch3Divider,        frames: 450  },
  { component: VehicleRegister,   frames: 1500 },
  { component: VehicleTimeline,   frames: 1500 },
  { component: Customer360,       frames: 1500 },
  { component: Ch4Divider,        frames: 450  },
  { component: ReservationMgmt,   frames: 1500 },
  { component: JobWorkflow,       frames: 1500 },
  { component: WalkInJob,         frames: 1500 },
  { component: Ch5Divider,        frames: 450  },
  { component: Invoice,           frames: 1500 },
  { component: POSSquare,         frames: 1500 },
  { component: Analytics,         frames: 1500 },
  { component: Ch6Divider,        frames: 450  },
  { component: BtoBFull,          frames: 1500 },
  { component: Ch7Divider,        frames: 450  },
  { component: SettingsMembers,   frames: 1500 },
  { component: SecurityBilling,   frames: 1500 },
  // 合計: 900 + 450×7 + 1500×18 = 900 + 3150 + 27000 = 31050f ≈ 17.3 min
];

const WORKFLOW_SLIDES: SlideDef[] = [
  { component: WorkflowOverview },
  { component: WorkflowStatusStepper },
  { component: WorkflowWalkIn },
  { component: WorkflowDuplicateGuard },
  { component: WorkflowContextCarryover },
];

// ─────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────

const FPS = 30;
const W = 1920;
const H = 1080;
const DEFAULT_FRAMES = 810; // 27s per slide

export const RemotionRoot = () => (
  <>
    {/* 説明会 (10スライド × 27s = 270s = 4.5min) */}
    <Composition
      id="LedraIntro"
      component={LedraVideo}
      durationInFrames={9000}
      fps={FPS} width={W} height={H}
      defaultProps={{}}
    />

    {/* Admin オンボーディング */}
    <Composition
      id="AdminOnboarding"
      component={Slideshow}
      durationInFrames={totalFrames(ADMIN_SLIDES, DEFAULT_FRAMES)}
      fps={FPS} width={W} height={H}
      defaultProps={{ slides: ADMIN_SLIDES, defaultFrames: DEFAULT_FRAMES }}
    />

    {/* Insurer オンボーディング */}
    <Composition
      id="InsurerOnboarding"
      component={Slideshow}
      durationInFrames={totalFrames(INSURER_SLIDES, DEFAULT_FRAMES)}
      fps={FPS} width={W} height={H}
      defaultProps={{ slides: INSURER_SLIDES, defaultFrames: DEFAULT_FRAMES }}
    />

    {/* Agent オンボーディング */}
    <Composition
      id="AgentOnboarding"
      component={Slideshow}
      durationInFrames={totalFrames(AGENT_SLIDES, DEFAULT_FRAMES)}
      fps={FPS} width={W} height={H}
      defaultProps={{ slides: AGENT_SLIDES, defaultFrames: DEFAULT_FRAMES }}
    />

    {/* 証明書 深掘り */}
    <Composition
      id="CertificateDeepDive"
      component={Slideshow}
      durationInFrames={totalFrames(CERT_SLIDES, DEFAULT_FRAMES)}
      fps={FPS} width={W} height={H}
      defaultProps={{ slides: CERT_SLIDES, defaultFrames: DEFAULT_FRAMES }}
    />

    {/* ワークフロー 深掘り */}
    <Composition
      id="WorkflowDeepDive"
      component={Slideshow}
      durationInFrames={totalFrames(WORKFLOW_SLIDES, DEFAULT_FRAMES)}
      fps={FPS} width={W} height={H}
      defaultProps={{ slides: WORKFLOW_SLIDES, defaultFrames: DEFAULT_FRAMES }}
    />

    {/* Admin 完全ガイド (長尺 約17分) */}
    <Composition
      id="AdminFullGuide"
      component={Slideshow}
      durationInFrames={totalFrames(ADMIN_FULL_SLIDES)}
      fps={FPS} width={W} height={H}
      defaultProps={{ slides: ADMIN_FULL_SLIDES }}
    />
  </>
);

registerRoot(RemotionRoot);
