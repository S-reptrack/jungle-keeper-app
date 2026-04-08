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
          </Routes>
          <TesterSuspensionGuard>
          <Routes>
            
            {/* Route Admin - priorité haute, en dehors du MaintenanceGuard */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/instagram-promo" element={<AdminRoute><InstagramPromo /></AdminRoute>} />
            
            {/* Toutes les autres routes passent par MaintenanceGuard */}
            <Route path="/" element={<MaintenanceGuard><Landing /></MaintenanceGuard>} />
            <Route path="/dashboard" element={<MaintenanceGuard><Index /></MaintenanceGuard>} />
            <Route path="/welcome" element={<MaintenanceGuard><Landing /></MaintenanceGuard>} />
            <Route path="/landing" element={<MaintenanceGuard><Landing /></MaintenanceGuard>} />
            <Route path="/install" element={<MaintenanceGuard><Install /></MaintenanceGuard>} />
            <Route path="/reptiles" element={<MaintenanceGuard><Reptiles /></MaintenanceGuard>} />
            <Route path="/reptile/:id" element={<MaintenanceGuard><ReptileDetail /></MaintenanceGuard>} />
            <Route path="/feeding" element={<MaintenanceGuard><Feeding /></MaintenanceGuard>} />
            <Route path="/feedings-due" element={<MaintenanceGuard><FeedingsDue /></MaintenanceGuard>} />
            <Route path="/settings" element={<MaintenanceGuard><Settings /></MaintenanceGuard>} />
            <Route path="/health" element={<MaintenanceGuard><HealthReptilesList /></MaintenanceGuard>} />
            <Route path="/reproduction" element={<MaintenanceGuard><ReproductionReptilesList /></MaintenanceGuard>} />
            <Route path="/all-reptiles" element={<MaintenanceGuard><AllReptilesList /></MaintenanceGuard>} />
            <Route path="/for-sale" element={<MaintenanceGuard><ForSale /></MaintenanceGuard>} />
            <Route path="/transfers" element={<MaintenanceGuard><Transfers /></MaintenanceGuard>} />
            <Route path="/nfc" element={<MaintenanceGuard><NFCReader /></MaintenanceGuard>} />
            <Route path="/cost-breakdown" element={<MaintenanceGuard><CostBreakdown /></MaintenanceGuard>} />
            
            <Route path="/analytics" element={<MaintenanceGuard><Analytics /></MaintenanceGuard>} />
            <Route path="/genealogy" element={<MaintenanceGuard><Genealogy /></MaintenanceGuard>} />
            <Route path="/morph-calculator" element={<MaintenanceGuard><MorphCalculator /></MaintenanceGuard>} />
            <Route path="/health-dashboard" element={<MaintenanceGuard><HealthDashboard /></MaintenanceGuard>} />
            
            {/* Catch-all route - TOUJOURS en dernier */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </TesterSuspensionGuard>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
