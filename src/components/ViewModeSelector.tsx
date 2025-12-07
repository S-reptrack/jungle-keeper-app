import { LayoutGrid, List, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list" | "list-with-photos";

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

const ViewModeSelector = ({ viewMode, onViewModeChange, className }: ViewModeSelectorProps) => {
  return (
    <div className={cn("flex items-center gap-1 p-1 bg-muted rounded-lg", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          viewMode === "grid" && "bg-background shadow-sm"
        )}
        onClick={() => onViewModeChange("grid")}
        title="Vue grille avec photos"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          viewMode === "list-with-photos" && "bg-background shadow-sm"
        )}
        onClick={() => onViewModeChange("list-with-photos")}
        title="Vue liste avec miniatures"
      >
        <Image className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          viewMode === "list" && "bg-background shadow-sm"
        )}
        onClick={() => onViewModeChange("list")}
        title="Vue liste compacte"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ViewModeSelector;
