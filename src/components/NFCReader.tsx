import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Nfc, NfcUtils, NfcTagScannedEvent } from '@capawesome-team/capacitor-nfc';

// Types temporaires pour le développement
interface NfcTagScannedEvent {
  nfcTag?: {
    message?: {
      records?: Array<{
        payload?: number[];
        type?: string;
        tnf?: number;
      }>;
    };
  };
}

// Stub temporaire pour l'environnement Lovable
const StubNfc = {
  addListener: (_event: string, _callback: any) => Promise.resolve({ remove: () => {} }),
  startScanSession: () => Promise.resolve(),
  stopScanSession: () => Promise.resolve(),
  write: (_options: any) => Promise.resolve(),
};

class NfcUtils {
  createNdefTextRecord(options: { text: string }) {
    return { record: { payload: [], type: '', tnf: 0 } };
  }
  convertBytesToString(payload: number[]): string {
    return new TextDecoder().decode(new Uint8Array(payload));
  }
}
import { Capacitor } from '@capacitor/core';

// Récupère le plugin natif s'il est disponible, sinon le stub
const getNfc = () => {
  try {
    const available = (Capacitor as any)?.isPluginAvailable?.('Nfc');
    const native = (window as any)?.Capacitor?.Plugins?.Nfc;
    if (available && native) return native;
  } catch {}
  return StubNfc;
};

// Helpers de détection (Capawesome vs Exxili)
const getCapPlugins = () => ((window as any)?.Capacitor?.Plugins) || {};
const detectNfcVariant = (): 'exxili' | 'capawesome' | 'none' => {
  const p = getCapPlugins();
  if (p?.NFC?.writeNDEF) return 'exxili';
  if (p?.Nfc) return 'capawesome';
  return 'none';
};
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
  const listenerRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const [foundReptileId, setFoundReptileId] = useState<string | null>(null);

  useEffect(() => {
    // Ne rien initialiser au montage pour éviter les crashes
    // L'écouteur NFC sera ajouté au clic sur "Activer"
    loadReptiles();

    return () => {
      // Cleanup: retirer le listener et arrêter la session
      if (listenerRef.current) {
        listenerRef.current.remove().catch(() => {});
      }
      if ((Capacitor as any).isPluginAvailable?.('Nfc')) {
        getNfc().stopScanSession().catch(() => {});
      }
    };
  }, []);

  // Navigation séparée pour éviter crash Android
  useEffect(() => {
    if (foundReptileId) {
      console.log('[NFC] Navigation vers:', foundReptileId);
      // Utiliser window.location au lieu de navigate() pour éviter crash
      window.location.href = `/reptile/${foundReptileId}`;
    }
  }, [foundReptileId]);

  const loadReptiles = async () => {
    try {
      const { data, error } = await supabase
        .from('reptiles')
        .select('id, name, species')
        .eq('status', 'active')
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
      isProcessingRef.current = false;

      if (!Capacitor.isNativePlatform()) {
        throw new Error("La lecture NFC n'est disponible que sur l'application mobile");
      }

      // Vérifier que le plugin NFC est disponible
      if (!(Capacitor as any).isPluginAvailable?.('Nfc')) {
        throw new Error("Plugin NFC non disponible sur cet appareil");
      }

      // Configurer l'écouteur NFC et sauvegarder la référence
      const listener = await getNfc().addListener('nfcTagScanned', (event: NfcTagScannedEvent) => {
        handleNFCTag(event);
      });
      listenerRef.current = listener;

      // Démarrer une session de scan NFC
      await getNfc().startScanSession();
      
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
      // Retirer le listener
      if (listenerRef.current) {
        await listenerRef.current.remove();
        listenerRef.current = null;
      }
      
      // Arrêter la session NFC
      if ((Capacitor as any).isPluginAvailable?.('Nfc') && (isScanning || isWriting)) {
        await getNfc().stopScanSession();
      }
      
      setIsScanning(false);
      setIsWriting(false);
      isProcessingRef.current = false;
    } catch (err) {
      console.error('[NFC] Erreur arrêt scan:', err);
    }
  };

  const startWriting = async () => {
    try {
      if (!selectedReptileId) {
        toast.error("Veuillez sélectionner un reptile");
        return;
      }

      if (!Capacitor.isNativePlatform()) {
        throw new Error("L'écriture NFC n'est disponible que sur l'application mobile");
      }

      // Vérifier que le plugin NFC est disponible
      if (!(Capacitor as any).isPluginAvailable?.('Nfc')) {
        throw new Error("Plugin NFC non disponible sur cet appareil");
      }

      setError(null);
      setIsWriting(true);

      const textToWrite = `reptile:${selectedReptileId}`;

      // Préparer plusieurs formats d'enregistrement selon le plugin
      const candidates: any[] = [
        // Web NFC-like
        { message: { records: [{ recordType: 'text', data: textToWrite }] } },
        // URL record (utile si le plugin ne gère pas 'text')
        { message: { records: [{ recordType: 'url', data: `${location.origin}/reptile/${selectedReptileId}` }] } },
        // Capawesome-like
        { message: { records: [{ type: 'well-known', rtd: 'text', payload: { text: textToWrite, lang: 'en' } }] } },
      ];

      // Démarrer la session d'écriture
      await getNfc().startScanSession();
      toast.info("📝 Approchez un tag NFC vierge");

      let success = false;
      let lastErr: any = null;
      for (const opt of candidates) {
        try {
          console.log('[NFC] Tentative écriture avec format:', JSON.stringify(opt));
          await getNfc().write(opt);
          success = true;
          break;
        } catch (e) {
          console.warn('[NFC] Échec écriture avec ce format:', e);
          lastErr = e;
          continue;
        }
      }

      if (!success) {
        throw lastErr || new Error('Impossible d\'écrire sur ce tag');
      }

      toast.success("✓ Tag NFC programmé avec succès !");
      setIsWriting(false);
      await getNfc().stopScanSession();

    } catch (err: any) {
      console.error('[NFC] Erreur écriture:', err);
      setError(err.message || "Erreur lors de l'écriture NFC");
      setIsWriting(false);
      toast.error("Impossible d'écrire sur le tag NFC");
    }
  };

  const handleNFCTag = async (event: any) => {
    // Empêcher les traitements multiples
    if (isProcessingRef.current) {
      console.log('[NFC] Traitement déjà en cours, ignoré');
      return;
    }
    isProcessingRef.current = true;
    
    try {
      console.log('[NFC] ===== DÉBUT TRAITEMENT TAG =====');
      console.log('[NFC] Event brut:', JSON.stringify(event, null, 2));
      
      // Extraire nfcTag de manière très défensive
      let nfcTag;
      try {
        nfcTag = event?.nfcTag || event?.tag || event;
      } catch (e) {
        console.error('[NFC] Erreur extraction nfcTag:', e);
        toast.error("Erreur lecture tag NFC");
        return;
      }
      
      console.log('[NFC] nfcTag existe?', !!nfcTag);
      console.log('[NFC] nfcTag type:', typeof nfcTag);
      
      if (!nfcTag) {
        console.error('[NFC] ❌ Aucun tag détecté');
        toast.error("Tag NFC non reconnu");
        return;
      }
      
      // Vérifier message NDEF
      console.log('[NFC] nfcTag.message existe?', !!nfcTag?.message);
      
      if (!nfcTag?.message) {
        console.error('[NFC] ❌ Tag sans message NDEF');
        toast.error("Tag NFC vierge ou incompatible (AirTag non supporté)");
        return;
      }

      // Vérifier records
      console.log('[NFC] nfcTag.message.records existe?', !!nfcTag?.message?.records);
      console.log('[NFC] Nombre de records:', nfcTag?.message?.records?.length || 0);
      
      if (!nfcTag.message.records || nfcTag.message.records.length === 0) {
        console.error('[NFC] ❌ Message NDEF sans records');
        toast.error("Tag NFC vide");
        return;
      }

      console.log(`[NFC] ✓ ${nfcTag.message.records.length} record(s) trouvé(s)`);

      // Parcourir les records NDEF
      const utils = new NfcUtils();
      for (let i = 0; i < nfcTag.message.records.length; i++) {
        try {
          const record = nfcTag.message.records[i];
          console.log(`[NFC] Record ${i} - payload:`, record?.payload?.length || 0, 'bytes');
          
          if (!record?.payload || record.payload.length === 0) {
            continue;
          }

          // Convertir le payload en texte
          const text = utils.convertBytesToString(record.payload);
          console.log(`[NFC] Record ${i} - texte:`, text);

          // Vérifier si c'est un ID de reptile (format: reptile:UUID)
          if (text.startsWith('reptile:')) {
            const reptileId = text.replace('reptile:', '').trim();
            console.log('[NFC] ✓ ID reptile trouvé:', reptileId);
            toast.success("🦎 Fiche reptile trouvée !");
            
            // Stocker l'ID trouvé pour navigation via useEffect
            setFoundReptileId(reptileId);
            return;
          } 
          
          // Vérifier si c'est une URL contenant /reptile/UUID
          if (text.includes('/reptile/')) {
            const match = text.match(/\/reptile\/([a-f0-9-]{36})/i);
            if (match?.[1]) {
              console.log('[NFC] ✓ URL reptile trouvée:', match[1]);
              toast.success("🦎 Fiche reptile trouvée !");
              
              // Stocker l'ID trouvé pour navigation via useEffect
              setFoundReptileId(match[1]);
              return;
            }
          }
          
          console.log(`[NFC] Record ${i} ne contient pas d'ID reptile`);
        } catch (recordErr) {
          console.error(`[NFC] Erreur record ${i}:`, recordErr);
        }
      }

      toast.error("Tag NFC ne contient pas de données reptile valides");
      
    } catch (err: any) {
      console.error('[NFC] ===== ERREUR CRITIQUE =====');
      console.error('[NFC] Erreur complète:', err);
      toast.error("Erreur lecture NFC");
    } finally {
      isProcessingRef.current = false;
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
