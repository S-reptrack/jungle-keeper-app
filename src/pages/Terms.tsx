import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
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
            <CardTitle className="text-3xl">{t("terms.title")}</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.preamble.title")}</h2>
              <p className="text-muted-foreground">{t("terms.preamble.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.definitions.title")}</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>{t("terms.definitions.app")}:</strong> {t("terms.definitions.appDef")}</li>
                <li><strong>{t("terms.definitions.user")}:</strong> {t("terms.definitions.userDef")}</li>
                <li><strong>{t("terms.definitions.service")}:</strong> {t("terms.definitions.serviceDef")}</li>
                <li><strong>{t("terms.definitions.content")}:</strong> {t("terms.definitions.contentDef")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.object.title")}</h2>
              <p className="text-muted-foreground">{t("terms.object.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.access.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.access.intro")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("terms.access.items.age")}</li>
                <li>{t("terms.access.items.email")}</li>
                <li>{t("terms.access.items.accurate")}</li>
                <li>{t("terms.access.items.security")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.services.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.services.intro")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("terms.services.items.tracking")}</li>
                <li>{t("terms.services.items.feeding")}</li>
                <li>{t("terms.services.items.health")}</li>
                <li>{t("terms.services.items.reproduction")}</li>
                <li>{t("terms.services.items.nfc")}</li>
                <li>{t("terms.services.items.transfer")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.subscription.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.subscription.intro")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("terms.subscription.items.free")}</li>
                <li>{t("terms.subscription.items.premium")}</li>
                <li>{t("terms.subscription.items.payment")}</li>
                <li>{t("terms.subscription.items.cancel")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.obligations.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.obligations.intro")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("terms.obligations.items.legal")}</li>
                <li>{t("terms.obligations.items.accurate")}</li>
                <li>{t("terms.obligations.items.noAbuse")}</li>
                <li>{t("terms.obligations.items.noHarm")}</li>
                <li>{t("terms.obligations.items.respect")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.intellectual.title")}</h2>
              <p className="text-muted-foreground">{t("terms.intellectual.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.userContent.title")}</h2>
              <p className="text-muted-foreground">{t("terms.userContent.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.liability.title")}</h2>
              <p className="text-muted-foreground mb-2">{t("terms.liability.intro")}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>{t("terms.liability.items.availability")}</li>
                <li>{t("terms.liability.items.data")}</li>
                <li>{t("terms.liability.items.indirect")}</li>
                <li>{t("terms.liability.items.thirdParty")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.termination.title")}</h2>
              <p className="text-muted-foreground">{t("terms.termination.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.modifications.title")}</h2>
              <p className="text-muted-foreground">{t("terms.modifications.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.law.title")}</h2>
              <p className="text-muted-foreground">{t("terms.law.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("terms.contact.title")}</h2>
              <p className="text-muted-foreground">{t("terms.contact.content")}</p>
            </section>

            <section className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {t("terms.lastUpdated")}: 12 décembre 2025
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
