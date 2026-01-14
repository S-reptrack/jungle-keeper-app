import { Home, List, Tag, Settings, QrCode, Waves, User, Shield } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBottomInset } from "@/hooks/useBottomInset";
import { QRScanner } from "./QRScanner";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "./ui/badge";
import { useUserRole } from "@/hooks/useUserRole";

const isIOS = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [scannerOpen, setScannerOpen] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  // Extraire le pseudo de l'email (partie avant @)
  const userDisplayName = user?.email?.split('@')[0] || null;
  
  const qrButtonBottom = `calc(5rem + env(safe-area-inset-bottom))`;
  
  const navItems = [
    { icon: Home, label: t("common.home"), path: "/" },
    { icon: List, label: t("common.reptiles"), path: "/reptiles" },
    { icon: Tag, label: t("common.forSale"), path: "/for-sale" },
    { icon: Settings, label: t("common.settings"), path: "/settings" },
  ];

  const handleNFCClick = () => {
    if (isIOS()) {
      toast.info(t("nfc.iosNotSupported"), {
        description: t("nfc.iosNotSupportedDescription"),
        duration: 6000,
      });
    } else {
      navigate("/nfc");
    }
  };

  return (
    <>
      <nav className="bg-card/80 backdrop-blur-lg border-t border-border/50 fixed left-0 right-0 bottom-0 z-50 md:top-0 md:bottom-auto pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center justify-around md:justify-start md:gap-8 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 px-1.5 py-2 rounded-lg transition-all duration-300 flex-1 max-w-[80px] md:flex-none md:max-w-none ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[9px] md:text-sm font-medium text-center leading-none whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
              <LanguageSelector />
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && !isMobile && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    location.pathname === "/admin"
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin</span>
                </Link>
              )}
              {userDisplayName && !isMobile && (
                <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-sm font-medium max-w-[120px] truncate">{userDisplayName}</span>
                </Badge>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {isMobile && (
        <>
          <Button
            onClick={handleNFCClick}
            size="icon"
            style={{ bottom: qrButtonBottom }}
            className="fixed right-20 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-primary to-primary/80"
            aria-label="Lecteur NFC"
          >
            <Waves className="h-6 w-6" />
          </Button>

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
