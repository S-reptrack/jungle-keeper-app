import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const GDPRConsentDialog = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem("gdpr-consent");
    if (!hasConsented) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    if (accepted) {
      localStorage.setItem("gdpr-consent", "true");
      localStorage.setItem("gdpr-consent-date", new Date().toISOString());
      setOpen(false);
    }
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <AlertDialog open={open} onOpenChange={() => {}}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ touchAction: 'manipulation' }}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">
            {t("gdpr.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-left">
            <p>{t("gdpr.intro")}</p>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">{t("gdpr.dataCollected")}</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>{t("privacy.dataCollection.items.email")}</li>
                <li>{t("privacy.dataCollection.items.reptileData")}</li>
                <li>{t("privacy.dataCollection.items.feedingRecords")}</li>
                <li>{t("privacy.dataCollection.items.healthRecords")}</li>
                <li>{t("privacy.dataCollection.items.images")}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">{t("gdpr.yourRights")}</h3>
              <p className="text-sm">{t("gdpr.rightsDescription")}</p>
            </div>

            <div className="flex items-start space-x-2 pt-4">
              <Checkbox 
                id="consent" 
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
              />
              <Label 
                htmlFor="consent" 
                className="text-sm font-normal cursor-pointer leading-relaxed"
              >
                {t("gdpr.acceptText")}{" "}
                <Link to="/privacy" className="text-primary underline" onClick={() => setOpen(false)}>
                  {t("gdpr.privacyPolicy")}
                </Link>
              </Label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDecline}>
            {t("gdpr.decline")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleAccept} disabled={!accepted}>
            {t("gdpr.accept")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GDPRConsentDialog;
