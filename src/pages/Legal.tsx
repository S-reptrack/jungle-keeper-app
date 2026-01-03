import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Legal = () => {
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
            <CardTitle className="text-3xl">{t("legal.title")}</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("legal.editor.title")}</h2>
              <div className="text-muted-foreground space-y-2">
                <p><strong>{t("legal.editor.name")}:</strong> F.M. BERTIN</p>
                <p><strong>{t("legal.editor.status")}:</strong> {t("legal.editor.statusValue")}</p>
                <p><strong>{t("legal.editor.siret")}:</strong> 99500161700019</p>
                <p><strong>{t("legal.editor.address")}:</strong> Nogent-sur-Seine, France</p>
                <p><strong>{t("legal.editor.email")}:</strong> contact@s-reptrack.app</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("legal.director.title")}</h2>
              <p className="text-muted-foreground">F.M. BERTIN</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("legal.hosting.title")}</h2>
              <div className="text-muted-foreground space-y-2">
                <p><strong>{t("legal.hosting.name")}:</strong> Lovable Technologies / Supabase Inc.</p>
                <p><strong>{t("legal.hosting.address")}:</strong> 970 Toa Payoh North, #07-04, Singapore 318992</p>
                <p><strong>{t("legal.hosting.website")}:</strong> https://lovable.dev / https://supabase.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("legal.intellectual.title")}</h2>
              <p className="text-muted-foreground">{t("legal.intellectual.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("legal.liability.title")}</h2>
              <p className="text-muted-foreground">{t("legal.liability.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("legal.personalData.title")}</h2>
              <p className="text-muted-foreground">
                {t("legal.personalData.content")}{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  {t("legal.personalData.link")}
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("legal.cookies.title")}</h2>
              <p className="text-muted-foreground">{t("legal.cookies.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">{t("legal.law.title")}</h2>
              <p className="text-muted-foreground">{t("legal.law.content")}</p>
            </section>

            <section className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {t("legal.lastUpdated")}: 3 janvier 2026
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Legal;
