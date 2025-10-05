import { Home, List, Utensils, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";

const Navigation = () => {
  const location = useLocation();
  const { t } = useTranslation();
  
  const navItems = [
    { icon: Home, label: t("common.home"), path: "/" },
    { icon: List, label: t("common.reptiles"), path: "/reptiles" },
    { icon: Utensils, label: t("common.feeding"), path: "/feeding" },
    { icon: Settings, label: t("common.settings"), path: "/settings" },
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-lg border-t border-border/50 fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto">
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
          </div>
          <div className="hidden md:flex md:gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
