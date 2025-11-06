import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHatchingNotifications } from "@/hooks/useHatchingNotifications";

export function HatchingNotificationDialog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, loading } = useHatchingNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || notifications.length === 0) return;
    
    // Get list of already seen notification IDs
    const seenNotificationsStr = localStorage.getItem("hatching_notifications_seen");
    const seenNotifications: string[] = seenNotificationsStr ? JSON.parse(seenNotificationsStr) : [];
    
    // Check if there are any new notifications not yet seen
    const hasNewNotifications = notifications.some(notif => !seenNotifications.includes(notif.id));
    
    if (hasNewNotifications) {
      setOpen(true);
    }
  }, [loading, notifications]);

  const handleClose = () => {
    setOpen(false);
    
    // Mark all current notifications as seen
    const seenNotificationsStr = localStorage.getItem("hatching_notifications_seen");
    const seenNotifications: string[] = seenNotificationsStr ? JSON.parse(seenNotificationsStr) : [];
    
    // Add all current notification IDs to the seen list
    const allSeenIds = [...new Set([...seenNotifications, ...notifications.map(n => n.id)])];
    localStorage.setItem("hatching_notifications_seen", JSON.stringify(allSeenIds));
  };

  const handleViewReptile = (reptileId: string) => {
    handleClose();
    navigate(`/reptiles/${reptileId}`);
  };

  if (loading || notifications.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🥚 {t("reproduction.hatchingAlerts")}
          </DialogTitle>
          <DialogDescription>
            {notifications.length === 1
              ? t("reproduction.oneHatchingSoon")
              : t("reproduction.multipleHatchingSoon", { count: notifications.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleViewReptile(notif.reptileId)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold">{notif.reptileName}</p>
                  {notif.partnerName && (
                    <p className="text-sm text-muted-foreground">
                      {t("reproduction.partner")}: {notif.partnerName}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("reproduction.expectedDate")}: {new Date(notif.expectedHatchDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={
                    notif.daysUntilHatch === 0 
                      ? "destructive" 
                      : notif.daysUntilHatch <= 3 
                      ? "outline"
                      : "default"
                  }
                  className={
                    notif.daysUntilHatch === 0 
                      ? "shrink-0" 
                      : notif.daysUntilHatch <= 3
                      ? "shrink-0 border-orange-500 text-orange-500"
                      : "shrink-0"
                  }
                >
                  {notif.daysUntilHatch === 0
                    ? t("reproduction.today")
                    : `${notif.daysUntilHatch}j`}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            {t("common.close")}
          </Button>
          <Button onClick={() => { handleClose(); navigate("/reptiles"); }}>
            {t("reptiles.viewAll")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
