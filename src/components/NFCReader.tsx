import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NFC, NDEFMessagesTransformable } from '@exxili/capacitor-nfc';
import { Capacitor } from '@capacitor/core';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Waves, AlertCircle, Info, Edit, ScanLine } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Reptile {
  id: string;
  name: string;
  species: string;
}

export const NFCReader = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'read' | 'write'>('read');
  const [isScanning, setIsScanning] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reptiles, setReptiles] = useState<Reptile[]>([]);
  const [selectedReptileId, setSelectedReptileId] = useState<string>('');

  useEffect(() => {
    // Configurer l'écouteur NFC pour la lecture
    NFC.onRead((data: NDEFMessagesTransformable) => {
      handleNFCTag(data);
    });

    // Charger la liste des reptiles pour le mode écriture
    loadReptiles();

    return () => {
      stopScanning();
    };
  }, []);

  const loadReptiles = async () => {
    try {
      const { data, error } = await supabase
        .from('reptiles')
        .select('id, name, species')
        .eq('status', 'alive')
        .order('name');

      if (error) throw error;
      setReptiles(data || []);
    } catch (err) {
      console.error('[NFC] Erreur chargement reptiles:', err);
    }
  };

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      if (!Capacitor.isNativePlatform()) {
        throw new Error("La lecture NFC n'est disponible que sur l'application mobile");
      }

      // Démarrer le scan NFC (nécessaire sur iOS, automatique sur Android)
      await NFC.startScan();
      
      toast.success("✓ Lecteur NFC activé - Approchez un tag");
    } catch (err: any) {
      console.error('[NFC] Erreur démarrage scan:', err);
      setError(err.message || "Erreur lors du démarrage du scan NFC");
      setIsScanning(false);
      toast.error("Impossible d'activer le NFC");
    }
  };

  const stopScanning = async () => {
    try {
      if (isScanning) {
        await NFC.cancelScan();
      }
      setIsScanning(false);
      setIsWriting(false);
    } catch (err) {
      console.error('[NFC] Erreur arrêt scan:', err);
    }
  };

  const startWriting = async () => {
    toast.error("L'écriture NFC nécessite le plugin premium (@capawesome-team/capacitor-nfc). Consultez le guide d'installation pour migrer vers la version premium.");
    setError("Fonctionnalité premium requise - Voir documentation");
  };

  const handleNFCTag = async (data: NDEFMessagesTransformable) => {
    try {
      console.log('[NFC] Tag détecté:', data);
      
      // Convertir en string pour lire facilement les données
      const stringData = data.string();
      
      if (!stringData.messages || stringData.messages.length === 0) {
        throw new Error("Tag NFC vide ou non compatible NDEF");
      }

      // Parcourir les records NDEF
      for (const message of stringData.messages) {
        if (!message.records || message.records.length === 0) continue;

        for (const record of message.records) {
          const text = record.payload || '';
          console.log('[NFC] Texte extrait:', text);

          // Vérifier si c'est un ID de reptile
          if (text.startsWith('reptile:')) {
            const reptileId = text.replace('reptile:', '').trim();
            toast.success("🦎 Fiche trouvée !");
            await stopScanning();
            navigate(`/reptile/${reptileId}`);
            return;
          } else if (text.includes('/reptile/')) {
            // Format URL: https://domain.com/reptile/UUID
            const match = text.match(/\/reptile\/([a-f0-9-]{36})/i);
            if (match && match[1]) {
              toast.success("🦎 Fiche trouvée !");
              await stopScanning();
              navigate(`/reptile/${match[1]}`);
              return;
            }
          }
        }
      }

      throw new Error("Tag NFC ne contient pas d'ID de reptile valide");
      
    } catch (err: any) {
      console.error('[NFC] Erreur traitement tag:', err);
      toast.error(err.message || "Impossible de lire ce tag NFC");
      await stopScanning();
    }
  };

  if (!Capacitor.isNativePlatform()) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Application mobile requise</h2>
          <p className="text-muted-foreground">
            La lecture NFC n'est disponible que sur l'application mobile installée sur votre téléphone.
          </p>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <Info className="w-5 h-5 inline-block mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Installez l'app mobile pour utiliser cette fonctionnalité
            </span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Card className="p-8">
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <Smartphone className="w-16 h-16 mx-auto mb-4 text-primary" />
            <Waves className="w-8 h-8 absolute -right-2 -top-2 text-primary/60 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Gestion NFC</h1>
          <p className="text-muted-foreground">
            Lisez ou écrivez des tags NFC pour vos reptiles
          </p>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'read' | 'write')} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="read" className="flex items-center gap-2">
              <ScanLine className="w-4 h-4" />
              Lire un tag
            </TabsTrigger>
            <TabsTrigger value="write" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Écrire un tag
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {mode === 'read' ? (
          <div className="space-y-4">
            {!isScanning ? (
              <Button
                onClick={startScanning}
                className="w-full"
                size="lg"
              >
                <Waves className="w-5 h-5 mr-2" />
                Activer le lecteur NFC
              </Button>
            ) : (
              <>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl p-8 text-center">
                  <Waves className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
                  <p className="text-xl font-semibold text-primary mb-2">En écoute...</p>
                  <p className="text-sm text-muted-foreground">
                    Approchez un tag NFC de l'arrière de votre téléphone
                  </p>
                </div>
                <Button
                  onClick={stopScanning}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Arrêter le lecteur
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Sélectionnez un reptile
              </label>
              <Select value={selectedReptileId} onValueChange={setSelectedReptileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un reptile..." />
                </SelectTrigger>
                <SelectContent>
                  {reptiles.map((reptile) => (
                    <SelectItem key={reptile.id} value={reptile.id}>
                      {reptile.name} ({reptile.species})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isWriting ? (
              <Button
                onClick={startWriting}
                className="w-full"
                size="lg"
                disabled={!selectedReptileId}
              >
                <Edit className="w-5 h-5 mr-2" />
                Écrire sur un tag NFC
              </Button>
            ) : (
              <>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl p-8 text-center">
                  <Edit className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
                  <p className="text-xl font-semibold text-primary mb-2">Prêt à écrire...</p>
                  <p className="text-sm text-muted-foreground">
                    Approchez un tag NFC vierge de l'arrière de votre téléphone
                  </p>
                </div>
                <Button
                  onClick={stopScanning}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Annuler
                </Button>
              </>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Conseils d'utilisation
          </h3>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <span className="text-primary font-bold">1.</span>
              <span>Activez le NFC dans les paramètres de votre téléphone</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <span className="text-primary font-bold">2.</span>
              <span>Approchez le tag du centre arrière de votre téléphone</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <span className="text-primary font-bold">3.</span>
              <span>Maintenez immobile pendant 1-2 secondes</span>
            </div>
            {mode === 'write' && (
              <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                <span className="text-primary font-bold">⚠️</span>
                <span>Utilisez des tags vierges ou réinscriptibles (NTAG213/215/216)</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
