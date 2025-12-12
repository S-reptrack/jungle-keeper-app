import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{t("privacy.title")}</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.intro.title")}</h2>
              <p className="text-muted-foreground">{t("privacy.intro.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.dataController.title")}</h2>
              <p className="text-muted-foreground">{t("privacy.dataController.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.dataCollection.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("privacy.dataCollection.intro")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("privacy.dataCollection.items.email")}</li>
                <li>{t("privacy.dataCollection.items.reptileData")}</li>
                <li>{t("privacy.dataCollection.items.feedingRecords")}</li>
                <li>{t("privacy.dataCollection.items.healthRecords")}</li>
                <li>{t("privacy.dataCollection.items.reproductionRecords")}</li>
                <li>{t("privacy.dataCollection.items.weightRecords")}</li>
                <li>{t("privacy.dataCollection.items.images")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.legalBasis.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("privacy.legalBasis.intro")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("privacy.legalBasis.items.consent")}</li>
                <li>{t("privacy.legalBasis.items.contract")}</li>
                <li>{t("privacy.legalBasis.items.legitimate")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.dataUsage.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("privacy.dataUsage.intro")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("privacy.dataUsage.items.service")}</li>
                <li>{t("privacy.dataUsage.items.management")}</li>
                <li>{t("privacy.dataUsage.items.notifications")}</li>
                <li>{t("privacy.dataUsage.items.improvements")}</li>
                <li>{t("privacy.dataUsage.items.support")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.dataRetention.title")}</h2>
              <p className="text-muted-foreground">{t("privacy.dataRetention.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.dataSecurity.title")}</h2>
              <p className="text-muted-foreground">{t("privacy.dataSecurity.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.userRights.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("privacy.userRights.intro")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("privacy.userRights.items.access")}</li>
                <li>{t("privacy.userRights.items.correction")}</li>
                <li>{t("privacy.userRights.items.deletion")}</li>
                <li>{t("privacy.userRights.items.export")}</li>
                <li>{t("privacy.userRights.items.restriction")}</li>
                <li>{t("privacy.userRights.items.opposition")}</li>
              </ul>
              <p className="text-muted-foreground mt-3">{t("privacy.userRights.exercise")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.dataSharing.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("privacy.dataSharing.content")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("privacy.dataSharing.items.hosting")}</li>
                <li>{t("privacy.dataSharing.items.payment")}</li>
                <li>{t("privacy.dataSharing.items.legal")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.cookies.title")}</h2>
              <p className="text-muted-foreground">{t("privacy.cookies.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.international.title")}</h2>
              <p className="text-muted-foreground">{t("privacy.international.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.minors.title")}</h2>
              <p className="text-muted-foreground">{t("privacy.minors.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.changes.title")}</h2>
              <p className="text-muted-foreground">{t("privacy.changes.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.contact.title")}</h2>
              <p className="text-muted-foreground">{t("privacy.contact.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.copyright.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("privacy.copyright.content")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("privacy.copyright.items.code")}</li>
                <li>{t("privacy.copyright.items.design")}</li>
                <li>{t("privacy.copyright.items.content")}</li>
                <li>{t("privacy.copyright.items.prohibited")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("privacy.authority.title")}</h2>
              <p className="text-muted-foreground">{t("privacy.authority.content")}</p>
            </section>

            <section className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {t("privacy.lastUpdated")}: 12 décembre 2025
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
