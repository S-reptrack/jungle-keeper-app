import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import GDPRConsentDialog from "./components/GDPRConsentDialog";
import { HatchingNotificationDialog } from "./components/HatchingNotificationDialog";
import Install from "./pages/Install";
import Transfers from "./pages/Transfers";
import AllReptilesList from "./pages/AllReptilesList";
import NFCReader from "./pages/NFCReader";
import HealthReptilesList from "./pages/HealthReptilesList";
import ReproductionReptilesList from "./pages/ReproductionReptilesList";
import FeedingsDue from "./pages/FeedingsDue";
import CostBreakdown from "./pages/CostBreakdown";
import QRCodeBatch from "./pages/QRCodeBatch";
import Feeding from "./pages/Feeding";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import MaintenanceGuard from "./components/MaintenanceGuard";
import Analytics from "./pages/Analytics";
import Genealogy from "./pages/Genealogy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MaintenanceGuard>
            <GDPRConsentDialog />
            <HatchingNotificationDialog />
            <Routes>
              {/* ROUTES NORMALES - Landing page en racine pour la production */}
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/welcome" element={<Landing />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/install" element={<Install />} />
              <Route path="/reptiles" element={<Reptiles />} />
              <Route path="/reptile/:id" element={<ReptileDetail />} />
              <Route path="/feeding" element={<Feeding />} />
              <Route path="/feedings-due" element={<FeedingsDue />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/health" element={<HealthReptilesList />} />
              <Route path="/reproduction" element={<ReproductionReptilesList />} />
              <Route path="/all-reptiles" element={<AllReptilesList />} />
              <Route path="/for-sale" element={<ForSale />} />
              <Route path="/transfers" element={<Transfers />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/nfc" element={<NFCReader />} />
              <Route path="/cost-breakdown" element={<CostBreakdown />} />
              <Route path="/qr-codes" element={<QRCodeBatch />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/genealogy" element={<Genealogy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MaintenanceGuard>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
