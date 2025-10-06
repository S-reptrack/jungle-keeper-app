import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Feeding = () => {
  const { t } = useTranslation();

  const rats = [
    { stage: t("feeding.rats.pinky"), weight: "2-5g" },
    { stage: t("feeding.rats.fuzzy"), weight: "6-15g" },
    { stage: t("feeding.rats.hopper"), weight: "16-30g" },
    { stage: t("feeding.rats.weaner"), weight: "31-50g" },
    { stage: t("feeding.rats.small"), weight: "51-90g" },
    { stage: t("feeding.rats.medium"), weight: "91-170g" },
    { stage: t("feeding.rats.large"), weight: "171-300g" },
    { stage: t("feeding.rats.jumbo"), weight: "301-400g" },
    { stage: t("feeding.rats.extraLarge"), weight: "400g+" },
  ];

  const mice = [
    { stage: t("feeding.mice.pinky"), weight: "1-2g" },
    { stage: t("feeding.mice.fuzzy"), weight: "3-5g" },
    { stage: t("feeding.mice.hopper"), weight: "6-10g" },
    { stage: t("feeding.mice.weaner"), weight: "11-15g" },
    { stage: t("feeding.mice.small"), weight: "16-20g" },
    { stage: t("feeding.mice.medium"), weight: "21-30g" },
    { stage: t("feeding.mice.large"), weight: "31-40g" },
    { stage: t("feeding.mice.jumbo"), weight: "40g+" },
  ];

  const rabbits = [
    { stage: t("feeding.rabbits.baby"), weight: "50-150g" },
    { stage: t("feeding.rabbits.small"), weight: "151-400g" },
    { stage: t("feeding.rabbits.medium"), weight: "401-800g" },
    { stage: t("feeding.rabbits.large"), weight: "801-1200g" },
    { stage: t("feeding.rabbits.extraLarge"), weight: "1200g+" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8 mt-16">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          {t("common.feeding")}
        </h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("feeding.rats.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("feeding.stage")}</TableHead>
                    <TableHead className="text-right">{t("feeding.weight")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rats.map((rat, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{rat.stage}</TableCell>
                      <TableCell className="text-right">{rat.weight}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("feeding.mice.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("feeding.stage")}</TableHead>
                    <TableHead className="text-right">{t("feeding.weight")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mice.map((mouse, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{mouse.stage}</TableCell>
                      <TableCell className="text-right">{mouse.weight}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("feeding.rabbits.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("feeding.stage")}</TableHead>
                    <TableHead className="text-right">{t("feeding.weight")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rabbits.map((rabbit, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{rabbit.stage}</TableCell>
                      <TableCell className="text-right">{rabbit.weight}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Feeding;
