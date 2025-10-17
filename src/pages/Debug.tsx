import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Info } from "lucide-react";
import { useState } from "react";

const Debug = () => {
  const [timestamp] = useState(new Date().toISOString());
  
  const handleHardReload = () => {
    window.location.reload();
  };

  const info = {
    origin: window.location.origin,
    href: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: timestamp,
    isCapacitor: 'Capacitor' in window,
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Origin:</div>
              <div className="text-sm bg-muted p-2 rounded font-mono break-all">
                {info.origin}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Current URL:</div>
              <div className="text-sm bg-muted p-2 rounded font-mono break-all">
                {info.href}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">User Agent:</div>
              <div className="text-sm bg-muted p-2 rounded font-mono break-all">
                {info.userAgent}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Page Load Time:</div>
              <div className="text-sm bg-muted p-2 rounded font-mono">
                {info.timestamp}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Is Capacitor App:</div>
              <div className="text-sm bg-muted p-2 rounded font-mono">
                {info.isCapacitor ? 'YES' : 'NO'}
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Si l'origine est "file://" ou "capacitor://", l'app charge les fichiers locaux au lieu de l'URL distante.
              </p>
              <p className="text-sm text-muted-foreground">
                L'URL devrait être: https://6bcbc9d4-57cb-49d8-b821-4dcda0936c9c.lovableproject.com
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={handleHardReload} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Hard Reload
            </Button>
            <Button
              onClick={() => {
                window.location.href = 'https://6bcbc9d4-57cb-49d8-b821-4dcda0936c9c.lovableproject.com?forceHideBadge=true';
              }}
              className="w-full"
              variant="secondary"
            >
              Ouvrir l’URL distante
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Debug;
