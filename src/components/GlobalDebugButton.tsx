import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";
import { Link } from "react-router-dom";

const GlobalDebugButton = () => {
  return (
    <div className="fixed z-50 bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))]">
      <Button
        asChild
        size="icon"
        variant="secondary"
        className="h-11 w-11 rounded-full shadow-lg"
        aria-label="Ouvrir la page de debug"
      >
        <Link to="/debug">
          <Bug className="h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
};

export default GlobalDebugButton;
