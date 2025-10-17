import { Home, List, Utensils, Settings, Shield, QrCode, RefreshCw, Bug } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import { useUserRole } from "@/hooks/useUserRole";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBottomInset } from "@/hooks/useBottomInset";
import { QRScanner } from "./QRScanner";
import { Button } from "./ui/button";

const Navigation = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isAdmin } = useUserRole();
  const isMobile = useIsMobile();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };
  
  const bottomInset = useBottomInset();
  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
  // Use visual viewport bottom inset (minus a few px) to avoid overlap but keep bar low
  const androidNavExtra = isAndroid ? Math.min(40, Math.max(0, bottomInset - 4)) : 0;
  
  const navStyle = isMobile 
    ? { bottom: `calc(env(safe-area-inset-bottom) + ${8 + androidNavExtra}px)` }
    : undefined;
    
  const qrButtonBottom = `calc(5rem + env(safe-area-inset-bottom) + ${8 + androidNavExtra}px)`;
  
  const navItems = [
    { icon: Home, label: t("common.home"), path: "/" },
    { icon: List, label: t("common.reptiles"), path: "/reptiles" },
    { icon: Utensils, label: t("common.feeding"), path: "/feeding" },
    { icon: Settings, label: t("common.settings"), path: "/settings" },
  ];

  // Ajouter le lien admin si l'utilisateur est admin
  if (isAdmin) {
    navItems.push({ icon: Shield, label: t("admin.dashboard"), path: "/admin" });
  }

  return (
    <>
      <nav className="bg-card/80 backdrop-blur-lg border-t border-border/50 fixed left-0 right-0 z-50 md:top-0 md:bottom-auto pb-[env(safe-area-inset-bottom)]" style={navStyle}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center justify-around md:justify-start md:gap-8 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs md:text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <LanguageSelector />
            </div>
            <div className="flex gap-2">
              {isMobile && (
                <>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9"
                    aria-label="Debug"
                  >
                    <Link to="/debug">
                      <Bug className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    onClick={handleRefresh}
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9"
                    disabled={isRefreshing}
                    aria-label="Rafraîchir l'application"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {isMobile && (
        <>
          <Button
            onClick={() => setScannerOpen(true)}
            size="icon"
            style={{ bottom: qrButtonBottom }}
            className="fixed right-4 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
            aria-label="Scanner un QR code"
          >
            <QrCode className="h-6 w-6" />
          </Button>

          <QRScanner open={scannerOpen} onOpenChange={setScannerOpen} />
        </>
      )}
    </>
  );
};

export default Navigation;
