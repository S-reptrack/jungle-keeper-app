import { Wifi, WifiOff, RefreshCw, Cloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const OfflineIndicator = () => {
  const { online, syncing, pendingCount, lastCached, syncPendingActions } = useOfflineSync();

  // Don't show anything if online with no pending actions
  if (online && pendingCount === 0 && !syncing) return null;

  return (
    <div className="fixed bottom-20 left-4 z-40 md:bottom-auto md:top-20 md:left-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {!online && (
              <Badge variant="destructive" className="gap-1.5 py-1.5 px-3 shadow-lg">
                <WifiOff className="w-3.5 h-3.5" />
                Hors ligne
              </Badge>
            )}
            {online && pendingCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={syncPendingActions}
                disabled={syncing}
                className="gap-1.5 shadow-lg bg-card"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Sync..." : `${pendingCount} en attente`}
              </Button>
            )}
            {syncing && (
              <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 shadow-lg">
                <Cloud className="w-3.5 h-3.5 animate-pulse" />
                Synchronisation...
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {!online 
            ? `Mode hors ligne${lastCached ? ` — Dernière sync: ${new Date(lastCached).toLocaleString("fr-FR")}` : ""}` 
            : `${pendingCount} action${pendingCount > 1 ? "s" : ""} en attente de synchronisation`
          }
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default OfflineIndicator;
