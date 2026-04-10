import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { ThemeProvider } from "next-themes";
import "./i18n/config";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import ComingSoon from "./pages/ComingSoon";
import Auth from "./pages/Auth";
import ReptileDetail from "./pages/ReptileDetail";
import Reptiles from "./pages/Reptiles";
import ForSale from "./pages/ForSale";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import Legal from "./pages/Legal";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

import { HatchingNotificationDialog } from "./components/HatchingNotificationDialog";
import Install from "./pages/Install";
import Transfers from "./pages/Transfers";
import AllReptilesList from "./pages/AllReptilesList";
import NFCReader from "./pages/NFCReader";
import HealthReptilesList from "./pages/HealthReptilesList";
import ReproductionReptilesList from "./pages/ReproductionReptilesList";
import FeedingsDue from "./pages/FeedingsDue";
import CostBreakdown from "./pages/CostBreakdown";

import Feeding from "./pages/Feeding";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import MaintenanceGuard from "./components/MaintenanceGuard";
import Analytics from "./pages/Analytics";
import Genealogy from "./pages/Genealogy";
import TesterActivityTracker from "./components/TesterActivityTracker";
import InstagramPromo from "./pages/InstagramPromo";
import InstallPromptBanner from "./components/InstallPromptBanner";
import TesterSuspensionGuard from "./components/TesterSuspensionGuard";
import OfflineIndicator from "./components/OfflineIndicator";
import Support from "./pages/Support";
import MorphCalculator from "./pages/MorphCalculator";
import HealthDashboard from "./pages/HealthDashboard";

const queryClient = new QueryClient();

const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <TesterActivityTracker />
          
          <HatchingNotificationDialog />
          <InstallPromptBanner />
          <OfflineIndicator />
          <Routes>
            {/* Routes publiques sans garde — accessibles sans auth */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/support" element={<Support />} />

            {/* Route Admin - priorité haute */}
            <Route path="/admin" element={<TesterSuspensionGuard><AdminRoute><AdminDashboard /></AdminRoute></TesterSuspensionGuard>} />
            <Route path="/instagram-promo" element={<TesterSuspensionGuard><AdminRoute><InstagramPromo /></AdminRoute></TesterSuspensionGuard>} />
            
            {/* Toutes les autres routes passent par TesterSuspensionGuard + MaintenanceGuard */}
            <Route path="/" element={<TesterSuspensionGuard><MaintenanceGuard><Landing /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/dashboard" element={<TesterSuspensionGuard><MaintenanceGuard><Index /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/welcome" element={<TesterSuspensionGuard><MaintenanceGuard><Landing /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/landing" element={<TesterSuspensionGuard><MaintenanceGuard><Landing /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/install" element={<TesterSuspensionGuard><MaintenanceGuard><Install /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/reptiles" element={<TesterSuspensionGuard><MaintenanceGuard><Reptiles /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/reptile/:id" element={<TesterSuspensionGuard><MaintenanceGuard><ReptileDetail /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/feeding" element={<TesterSuspensionGuard><MaintenanceGuard><Feeding /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/feedings-due" element={<TesterSuspensionGuard><MaintenanceGuard><FeedingsDue /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/settings" element={<TesterSuspensionGuard><MaintenanceGuard><Settings /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/health" element={<TesterSuspensionGuard><MaintenanceGuard><HealthReptilesList /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/reproduction" element={<TesterSuspensionGuard><MaintenanceGuard><ReproductionReptilesList /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/all-reptiles" element={<TesterSuspensionGuard><MaintenanceGuard><AllReptilesList /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/for-sale" element={<TesterSuspensionGuard><MaintenanceGuard><ForSale /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/transfers" element={<TesterSuspensionGuard><MaintenanceGuard><Transfers /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/nfc" element={<TesterSuspensionGuard><MaintenanceGuard><NFCReader /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/cost-breakdown" element={<TesterSuspensionGuard><MaintenanceGuard><CostBreakdown /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/analytics" element={<TesterSuspensionGuard><MaintenanceGuard><Analytics /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/genealogy" element={<TesterSuspensionGuard><MaintenanceGuard><Genealogy /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/morph-calculator" element={<TesterSuspensionGuard><MaintenanceGuard><MorphCalculator /></MaintenanceGuard></TesterSuspensionGuard>} />
            <Route path="/health-dashboard" element={<TesterSuspensionGuard><MaintenanceGuard><HealthDashboard /></MaintenanceGuard></TesterSuspensionGuard>} />
            
            {/* Catch-all route - TOUJOURS en dernier */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
