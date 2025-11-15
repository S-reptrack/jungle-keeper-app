import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

const CostBreakdown = () => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const content = `================================================================================
        ANALYSE COMPLÈTE DES COÛTS - S-REPTRACK 2025
================================================================================

Date: 2025
Application: S-reptrack - Suivi et gestion de reptiles


================================================================================
1. FRAIS DE DÉVELOPPEMENT
================================================================================

Catégorie          | Détail                    | Coût        | Fréquence | Notes
-------------------|---------------------------|-------------|-----------|------------------
Lovable Pro        | Développement crédits     | 25$/mois    | Mensuel   | Déjà utilisé
Lovable Cloud      | Backend (BDD, auth)       | Gratuit*    | Usage     | Payant si gros volume


================================================================================
2. FRAIS DE PUBLICATION
================================================================================

Plateforme                  | Coût      | Fréquence        | Obligatoire
----------------------------|-----------|------------------|-------------
Google Play (Android)       | 25$       | Une fois à vie   | Oui
Apple App Store (iOS)       | 99$/an    | Annuel           | Oui si iOS


================================================================================
3. FRAIS DE FONCTIONNALITÉS (Optionnels)
================================================================================

Fonctionnalité              | Coût                      | Fréquence  | Nécessité
----------------------------|---------------------------|------------|---------------------------
Plugin NFC Premium          | 29$/mois ou 599$ une fois | Variable   | Si écriture NFC Android
NFC sur iOS                 | 0$ (gratuit)              | -          | Déjà inclus


================================================================================
4. FRAIS BACKEND/CLOUD (Lovable Cloud)
================================================================================

Service                | Limite gratuite          | Coût au-delà        | Notes
-----------------------|--------------------------|---------------------|-------------------
Base de données        | 500 MB                   | Variable            | Reptiles + données
Stockage fichiers      | 1 GB                     | ~0.021$/GB/mois     | Photos reptiles ⚠️
Trafic/Bande passante  | 2 GB                     | ~0.09$/GB           | Transfert données
Edge Functions         | 500k invocations/mois    | Variable            | Upload images


================================================================================
5. FRAIS LÉGAUX/CONFORMITÉ (France)
================================================================================

Obligation                  | Coût estimé      | Fréquence  | Détails
----------------------------|------------------|------------|--------------------------------
RGPD - Mentions légales     | 0$ à 500$        | Une fois   | Politique confidentialité, CGU
RGPD - Audit conformité     | 0$ à 2000$       | Optionnel  | Si beaucoup données perso
DPO/Conseil juridique       | 0$ à 150$/heure  | Si besoin  | Conseils RGPD spécifiques


================================================================================
6. FRAIS CACHÉS
================================================================================

Type                        | Coût              | Quand              | Pourquoi
----------------------------|-------------------|--------------------|--------------------------
Mac pour iOS                | 800$ à 2000$      | Obligatoire iOS    | Xcode Mac uniquement
Certificats signature       | Inclus Apple 99$  | -                  | Déjà payé
Domaine personnalisé        | 10-20$/an         | Optionnel          | sreptrack.com
Backup/Sauvegarde          | Variable          | Mensuel            | Sauvegardes externes
Dépassement stockage       | ~0.021$/GB/mois   | Si >1GB            | Photos HD ⚠️
Analytics/Monitoring       | 0$ à 50$/mois     | Optionnel          | Sentry, etc.
Push notifications         | 0$ à 100$/mois    | Optionnel          | Notifications avancées
Email transactionnel       | 0$ à 20$/mois     | Si emails          | SendGrid, Mailgun
Support client             | 0$ à 50$/mois     | Optionnel          | Zendesk, Intercom
Mises à jour OS            | Temps dev         | Annuel             | Tester nouveaux OS


================================================================================
7. SCÉNARIOS DE COÛTS TOTAUX
================================================================================

🟢 SCÉNARIO MINIMAL (Android uniquement, sans écriture NFC)
─────────────────────────────────────────────────────────────
Lovable Pro (dev)               25$/mois
Google Play                     25$ (une fois)
───────────────────────────────────────────────────────────── 
TOTAL PREMIÈRE ANNÉE            325$
TOTAL ANNÉES SUIVANTES          300$/an


🟡 SCÉNARIO RECOMMANDÉ (Android + iOS, écriture NFC sur iOS)
─────────────────────────────────────────────────────────────
                            Première année    Années suivantes
Lovable Pro                      300$              300$
Google Play                       25$                0$
Apple Developer                   99$               99$
Mac (si besoin)              800-2000$                0$
RGPD basique                  0-200$                 0$
───────────────────────────────────────────────────────────── 
TOTAL                     1,224$ à 2,624$         399$/an


🔴 SCÉNARIO COMPLET (Android + iOS + Écriture NFC Android)
─────────────────────────────────────────────────────────────
                            Première année    Années suivantes
Lovable Pro                      300$              300$
Google Play                       25$                0$
Apple Developer                   99$               99$
Plugin NFC Premium               348$              348$
Mac (si besoin)              800-2000$                0$
RGPD basique                  0-200$                 0$
───────────────────────────────────────────────────────────── 
TOTAL                     1,572$ à 2,972$         747$/an


================================================================================
8. FRAIS VARIABLES À SURVEILLER
================================================================================

Si votre app décolle :

• +1000 utilisateurs actifs → Peut dépasser les limites gratuites
• Photos HD massives → Stockage peut coûter 50-200$/mois
• Edge Functions intensives → Au-delà de 500k appels

Estimation conservative avec croissance :
• Année 1 : 399-747$/an (selon NFC Android ou non)
• Année 2-3 : +50-100$/mois si succès (stockage, bande passante)
• Années suivantes : Peut grimper à 1000$/an si forte adoption


================================================================================
9. RECOMMANDATIONS
================================================================================

1. Commencez Android seul (25$ Play + plugin NFC si besoin)
2. Testez la traction pendant 3-6 mois
3. Ajoutez iOS seulement si demande forte (évite 99$/an + Mac)
4. Surveillez le stockage photos (compresser les images)
5. RGPD DIY au début (générateurs gratuits en ligne)


================================================================================
10. COMPARAISON PLATEFORMES NFC
================================================================================

Plateforme  | Compte dev    | Lecture NFC  | Écriture NFC              | Coût total minimal
------------|---------------|--------------|---------------------------|-------------------
Android     | 25$ (1x)      | ✅ Gratuit   | ❌ Plugin premium requis  | 25$ + 29$/mois
iOS         | 99$/an        | ✅ Gratuit   | ✅ Gratuit                | 99$/an


================================================================================
FIN DU DOCUMENT
================================================================================

Document généré pour S-reptrack
Pour toute question: consultez la documentation du projet`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'analyse-couts-sreptrack.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header avec boutons */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h1 className="text-4xl font-bold">Analyse des Coûts - S-reptrack</h1>
          <div className="flex gap-2">
            <Button onClick={handleDownloadTxt} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Télécharger TXT
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
          </div>
        </div>

        {/* Header pour impression */}
        <div className="hidden print:block mb-8">
          <h1 className="text-3xl font-bold mb-2">Analyse Complète des Coûts</h1>
          <h2 className="text-xl text-muted-foreground">Application S-reptrack - 2025</h2>
          <p className="text-sm text-muted-foreground mt-2">Date d'impression: {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        {/* Frais de développement */}
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-2xl font-bold mb-4 text-primary">🎯 Frais de Développement</h2>
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-3 text-left">Catégorie</th>
                <th className="border border-border p-3 text-left">Détail</th>
                <th className="border border-border p-3 text-left">Coût</th>
                <th className="border border-border p-3 text-left">Fréquence</th>
                <th className="border border-border p-3 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-3 font-semibold">Lovable Pro</td>
                <td className="border border-border p-3">Développement avec crédits</td>
                <td className="border border-border p-3 font-bold">25$/mois</td>
                <td className="border border-border p-3">Mensuel</td>
                <td className="border border-border p-3">Déjà utilisé pour développer l'app</td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-semibold">Lovable Cloud</td>
                <td className="border border-border p-3">Backend (BDD, auth, stockage)</td>
                <td className="border border-border p-3 font-bold">Gratuit*</td>
                <td className="border border-border p-3">Usage</td>
                <td className="border border-border p-3">⚠️ Payant si gros volume</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Frais de publication */}
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-2xl font-bold mb-4 text-primary">📱 Frais de Publication</h2>
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-3 text-left">Plateforme</th>
                <th className="border border-border p-3 text-left">Coût</th>
                <th className="border border-border p-3 text-left">Fréquence</th>
                <th className="border border-border p-3 text-left">Obligatoire</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-3 font-semibold">Google Play (Android)</td>
                <td className="border border-border p-3 font-bold">25$</td>
                <td className="border border-border p-3">Une fois à vie</td>
                <td className="border border-border p-3">✅ Oui</td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-semibold">Apple App Store (iOS)</td>
                <td className="border border-border p-3 font-bold">99$/an</td>
                <td className="border border-border p-3">Annuel</td>
                <td className="border border-border p-3">✅ Oui si iOS</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Frais de fonctionnalités */}
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-2xl font-bold mb-4 text-primary">🔧 Frais de Fonctionnalités (Optionnels)</h2>
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-3 text-left">Fonctionnalité</th>
                <th className="border border-border p-3 text-left">Coût</th>
                <th className="border border-border p-3 text-left">Fréquence</th>
                <th className="border border-border p-3 text-left">Nécessité</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-3 font-semibold">Plugin NFC Premium</td>
                <td className="border border-border p-3 font-bold">29$/mois ou 599$ une fois</td>
                <td className="border border-border p-3">Mensuel ou perpétuel</td>
                <td className="border border-border p-3">⚠️ Si écriture NFC Android uniquement</td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-semibold">NFC sur iOS</td>
                <td className="border border-border p-3 font-bold">0$ (gratuit)</td>
                <td className="border border-border p-3">-</td>
                <td className="border border-border p-3">✅ Déjà inclus</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Frais Backend/Cloud */}
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-2xl font-bold mb-4 text-primary">💾 Frais Backend/Cloud (Lovable Cloud)</h2>
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-3 text-left">Service</th>
                <th className="border border-border p-3 text-left">Limite gratuite</th>
                <th className="border border-border p-3 text-left">Coût au-delà</th>
                <th className="border border-border p-3 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-3 font-semibold">Base de données</td>
                <td className="border border-border p-3">500 MB</td>
                <td className="border border-border p-3">Variable</td>
                <td className="border border-border p-3">Reptiles + données</td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-semibold">Stockage fichiers</td>
                <td className="border border-border p-3">1 GB</td>
                <td className="border border-border p-3">~0.021$/GB/mois</td>
                <td className="border border-border p-3">⚠️ Photos des reptiles</td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-semibold">Trafic/Bande passante</td>
                <td className="border border-border p-3">2 GB</td>
                <td className="border border-border p-3">~0.09$/GB</td>
                <td className="border border-border p-3">Transfert des données</td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-semibold">Edge Functions</td>
                <td className="border border-border p-3">500k invocations/mois</td>
                <td className="border border-border p-3">Variable</td>
                <td className="border border-border p-3">Upload images, etc.</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Frais légaux */}
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-2xl font-bold mb-4 text-primary">⚖️ Frais Légaux/Conformité (France)</h2>
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-3 text-left">Obligation</th>
                <th className="border border-border p-3 text-left">Coût estimé</th>
                <th className="border border-border p-3 text-left">Fréquence</th>
                <th className="border border-border p-3 text-left">Détails</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-3 font-semibold">RGPD - Mentions légales</td>
                <td className="border border-border p-3">0$ à 500$</td>
                <td className="border border-border p-3">Une fois</td>
                <td className="border border-border p-3">Politique confidentialité, CGU</td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-semibold">RGPD - Audit conformité</td>
                <td className="border border-border p-3">0$ à 2000$</td>
                <td className="border border-border p-3">Optionnel</td>
                <td className="border border-border p-3">Si beaucoup de données personnelles</td>
              </tr>
              <tr>
                <td className="border border-border p-3 font-semibold">DPO/Conseil juridique</td>
                <td className="border border-border p-3">0$ à 150$/heure</td>
                <td className="border border-border p-3">Si besoin</td>
                <td className="border border-border p-3">Conseils RGPD spécifiques</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Frais cachés */}
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-2xl font-bold mb-4 text-primary">🛠️ Frais Cachés</h2>
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-3 text-left">Type</th>
                <th className="border border-border p-3 text-left">Coût</th>
                <th className="border border-border p-3 text-left">Quand</th>
                <th className="border border-border p-3 text-left">Pourquoi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-3 font-semibold">Mac pour iOS</td>
                <td className="border border-border p-3 font-bold">800$ à 2000$</td>
                <td className="border border-border p-3">⚠️ Obligatoire pour iOS</td>
                <td className="border border-border p-3">Xcode ne marche que sur Mac</td>
              </tr>
              <tr>
                <td className="border border-border p-3">Certificats de signature</td>
                <td className="border border-border p-3">Inclus dans 99$/an Apple</td>
                <td className="border border-border p-3">-</td>
                <td className="border border-border p-3">Déjà payé</td>
              </tr>
              <tr>
                <td className="border border-border p-3">Domaine personnalisé</td>
                <td className="border border-border p-3">10-20$/an</td>
                <td className="border border-border p-3">Optionnel</td>
                <td className="border border-border p-3">sreptrack.com au lieu de lovable.app</td>
              </tr>
              <tr>
                <td className="border border-border p-3">Backup/Sauvegarde</td>
                <td className="border border-border p-3">Variable</td>
                <td className="border border-border p-3">Mensuel</td>
                <td className="border border-border p-3">Sauvegardes externes recommandées</td>
              </tr>
              <tr>
                <td className="border border-border p-3">Dépassement stockage photos</td>
                <td className="border border-border p-3">~0.021$/GB/mois</td>
                <td className="border border-border p-3">Si &gt;1GB</td>
                <td className="border border-border p-3">⚠️ Peut vite grimper avec photos HD</td>
              </tr>
              <tr>
                <td className="border border-border p-3">Analytics/Monitoring</td>
                <td className="border border-border p-3">0$ à 50$/mois</td>
                <td className="border border-border p-3">Optionnel</td>
                <td className="border border-border p-3">Suivre utilisation (Sentry, etc.)</td>
              </tr>
              <tr>
                <td className="border border-border p-3">Push notifications</td>
                <td className="border border-border p-3">0$ à 100$/mois</td>
                <td className="border border-border p-3">Optionnel</td>
                <td className="border border-border p-3">Si notifications push avancées</td>
              </tr>
              <tr>
                <td className="border border-border p-3">Email transactionnel</td>
                <td className="border border-border p-3">0$ à 20$/mois</td>
                <td className="border border-border p-3">Si emails</td>
                <td className="border border-border p-3">SendGrid, Mailgun (récup. mdp)</td>
              </tr>
              <tr>
                <td className="border border-border p-3">Support client/Bug tracking</td>
                <td className="border border-border p-3">0$ à 50$/mois</td>
                <td className="border border-border p-3">Optionnel</td>
                <td className="border border-border p-3">Zendesk, Intercom, etc.</td>
              </tr>
              <tr>
                <td className="border border-border p-3">Mises à jour OS</td>
                <td className="border border-border p-3">Temps dev</td>
                <td className="border border-border p-3">Annuel</td>
                <td className="border border-border p-3">Tester nouveaux Android/iOS</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Scénarios de coûts */}
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-2xl font-bold mb-4 text-primary">💰 Scénarios de Coûts Totaux</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 text-green-600">🟢 Scénario Minimal (Android uniquement, sans écriture NFC)</h3>
            <table className="w-full border-collapse border border-border mb-2">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left">Poste</th>
                  <th className="border border-border p-3 text-left">Coût</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-3">Lovable Pro (dev)</td>
                  <td className="border border-border p-3">25$/mois</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Google Play</td>
                  <td className="border border-border p-3">25$ (une fois)</td>
                </tr>
                <tr className="bg-green-50 dark:bg-green-950">
                  <td className="border border-border p-3 font-bold">TOTAL PREMIÈRE ANNÉE</td>
                  <td className="border border-border p-3 font-bold">325$</td>
                </tr>
                <tr className="bg-green-50 dark:bg-green-950">
                  <td className="border border-border p-3 font-bold">TOTAL ANNÉES SUIVANTES</td>
                  <td className="border border-border p-3 font-bold">300$/an</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 text-yellow-600">🟡 Scénario Recommandé (Android + iOS, écriture NFC sur iOS)</h3>
            <table className="w-full border-collapse border border-border mb-2">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left">Poste</th>
                  <th className="border border-border p-3 text-left">Première année</th>
                  <th className="border border-border p-3 text-left">Années suivantes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-3">Lovable Pro</td>
                  <td className="border border-border p-3">300$</td>
                  <td className="border border-border p-3">300$</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Google Play</td>
                  <td className="border border-border p-3">25$</td>
                  <td className="border border-border p-3">0$</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Apple Developer</td>
                  <td className="border border-border p-3">99$</td>
                  <td className="border border-border p-3">99$</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Mac (si vous n'avez pas)</td>
                  <td className="border border-border p-3">800-2000$</td>
                  <td className="border border-border p-3">0$</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">RGPD basique (DIY)</td>
                  <td className="border border-border p-3">0-200$</td>
                  <td className="border border-border p-3">0$</td>
                </tr>
                <tr className="bg-yellow-50 dark:bg-yellow-950">
                  <td className="border border-border p-3 font-bold">TOTAL</td>
                  <td className="border border-border p-3 font-bold">1,224$ à 2,624$</td>
                  <td className="border border-border p-3 font-bold">399$/an</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 text-red-600">🔴 Scénario Complet (Android + iOS + Écriture NFC Android)</h3>
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left">Poste</th>
                  <th className="border border-border p-3 text-left">Première année</th>
                  <th className="border border-border p-3 text-left">Années suivantes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-3">Lovable Pro</td>
                  <td className="border border-border p-3">300$</td>
                  <td className="border border-border p-3">300$</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Google Play</td>
                  <td className="border border-border p-3">25$</td>
                  <td className="border border-border p-3">0$</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Apple Developer</td>
                  <td className="border border-border p-3">99$</td>
                  <td className="border border-border p-3">99$</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Plugin NFC Premium</td>
                  <td className="border border-border p-3">348$ (29$/mois)</td>
                  <td className="border border-border p-3">348$</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Mac (si besoin)</td>
                  <td className="border border-border p-3">800-2000$</td>
                  <td className="border border-border p-3">0$</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">RGPD basique</td>
                  <td className="border border-border p-3">0-200$</td>
                  <td className="border border-border p-3">0$</td>
                </tr>
                <tr className="bg-red-50 dark:bg-red-950">
                  <td className="border border-border p-3 font-bold">TOTAL</td>
                  <td className="border border-border p-3 font-bold">1,572$ à 2,972$</td>
                  <td className="border border-border p-3 font-bold">747$/an</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Recommandations */}
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-2xl font-bold mb-4 text-primary">💡 Recommandations</h2>
          <div className="border border-border rounded-lg p-6 bg-muted/30">
            <ol className="list-decimal list-inside space-y-3">
              <li className="font-semibold">Commencez Android seul (25$ Play + plugin NFC si besoin)</li>
              <li className="font-semibold">Testez la traction pendant 3-6 mois</li>
              <li className="font-semibold">Ajoutez iOS seulement si demande forte (évite 99$/an + Mac)</li>
              <li className="font-semibold">Surveillez le stockage photos (compresser les images)</li>
              <li className="font-semibold">RGPD DIY au début (générateurs gratuits en ligne)</li>
            </ol>
          </div>
        </section>

        {/* Notes importantes */}
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-2xl font-bold mb-4 text-primary">⚠️ Frais Variables à Surveiller</h2>
          <div className="border border-border rounded-lg p-6 bg-yellow-50 dark:bg-yellow-950/20">
            <h3 className="font-bold mb-2">Si votre app décolle :</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>+1000 utilisateurs actifs → Peut dépasser les limites gratuites</li>
              <li>Photos HD massives → Stockage peut coûter <strong>50-200$/mois</strong></li>
              <li>Edge Functions intensives → Au-delà de 500k appels</li>
            </ul>
            <h3 className="font-bold mt-4 mb-2">Estimation conservative avec croissance :</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Année 1 : <strong>399-747$/an</strong> (selon NFC Android ou non)</li>
              <li>Année 2-3 : <strong>+50-100$/mois</strong> si succès</li>
              <li>Années suivantes : <strong>Peut grimper à 1000$/an</strong> si forte adoption</li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground mt-12 pt-6 border-t print:mt-8">
          <p>S-reptrack - Application de suivi et gestion de reptiles</p>
          <p className="mt-2">Document généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
        </footer>
      </div>

      {/* Styles pour l'impression */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          table {
            font-size: 10px;
          }
          
          h1 {
            font-size: 24px;
          }
          
          h2 {
            font-size: 18px;
            margin-top: 20px;
          }
          
          h3 {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default CostBreakdown;
