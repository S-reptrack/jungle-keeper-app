import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor, registerPlugin } from '@capacitor/core';
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

// Type pour le plugin NFC Premium
interface NdefRecord {
  tnf: number;
  type: number[];
  payload: number[];
  id?: number[];
}

interface NfcPlugin {
  addListener: (event: string, callback: (event: any) => void) => Promise<any>;
  removeAllListeners: () => Promise<void>;
  startScanSession: () => Promise<void>;
  stopScanSession: () => Promise<void>;
  write: (options: { message: { records: NdefRecord[] } }) => Promise<void>;
  isSupported: () => Promise<{ isSupported: boolean }>;
  erase: () => Promise<void>;
  format: () => Promise<void>;
}

// Charger le plugin NFC via registerPlugin (méthode Capacitor standard)
const Nfc = registerPlugin<NfcPlugin>('Nfc', {
  web: () => {
    console.log('[NFC] Plugin web stub loaded');
    return {
      addListener: async () => ({ remove: async () => {} }),
      removeAllListeners: async () => {},
      startScanSession: async () => { throw new Error('NFC non disponible sur le web'); },
      stopScanSession: async () => {},
      write: async () => { throw new Error('NFC non disponible sur le web'); },
      isSupported: async () => ({ isSupported: false }),
      erase: async () => { throw new Error('NFC non disponible sur le web'); },
      format: async () => { throw new Error('NFC non disponible sur le web'); },
    };
  },
});

// Enum TypeNameFormat comme dans le plugin
const TypeNameFormat = {
  Empty: 0,
  WellKnown: 1,
  MimeMedia: 2,
  AbsoluteUri: 3,
  External: 4,
  Unknown: 5,
  Unchanged: 6,
};

// Créer un record NDEF Text manuellement (compatible avec le plugin premium)
// IMPORTANT: Le champ 'id' doit être un tableau non-null pour le plugin Android
// Un tableau vide [] peut être sérialisé en null par Capacitor, causant "No value for id"
const createTextRecord = (text: string): NdefRecord => {
  const languageBytes = Array.from(new TextEncoder().encode('en'));
  const textBytes = Array.from(new TextEncoder().encode(text));
  
  // Status byte: bit 7 = 0 (UTF-8), bits 0-5 = language code length
  const statusByte = languageBytes.length;
  
  // Payload = [statusByte, ...languageBytes, ...textBytes]
  const payload = [statusByte, ...languageBytes, ...textBytes];
  
  // Le record avec id comme tableau avec un byte (0x00) au lieu de vide
  // pour s'assurer que le JSON contient bien un array
  const record: NdefRecord = {
    tnf: TypeNameFormat.WellKnown,
    type: [0x54], // 'T' pour Text Record
    payload: payload,
    id: [0x00] // ID avec un byte null - sera ignoré mais présent dans le JSON
  };
  
  console.log('[NFC] Record créé:', JSON.stringify(record));
  return record;
};

// Variable pour tracker les erreurs
let nfcError: string | null = null;

// Fonction pour vérifier si le plugin NFC est disponible
const checkNfcAvailable = async (): Promise<boolean> => {
  try {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }
    
    // Essayer d'appeler une méthode simple pour vérifier si le plugin répond
    console.log('[NFC] Vérification du plugin...');
    console.log('[NFC] Plugin Nfc:', Nfc);
    
    // Sur plateforme native, on suppose que le plugin est disponible
    // car il a été installé via npm
    return true;
  } catch (err: any) {
    console.error('[NFC] Plugin non disponible:', err);
    nfcError = err?.message || 'Plugin non disponible';
    return false;
  }
};

export const NFCReader = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'read' | 'write'>('read');
  const [isScanning, setIsScanning] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reptiles, setReptiles] = useState<Reptile[]>([]);
  const [selectedReptileId, setSelectedReptileId] = useState<string>('');
  const nfcCallbackRef = useRef<any>(null);

  useEffect(() => {
    loadReptiles();
    
    return () => {
      if (nfcCallbackRef.current) {
        console.log('[NFC] Cleanup au démontage');
      }
    };
  }, []);

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

      if (!Capacitor.isNativePlatform()) {
        throw new Error("La lecture NFC n'est disponible que sur l'application mobile");
      }

      const isAvailable = await checkNfcAvailable();
      if (!isAvailable) {
        throw new Error("Plugin NFC Premium non disponible. Vérifiez que le plugin est installé.");
      }

      console.log('[NFC] Configuration de l\'écouteur NFC Premium...');

      await Nfc.addListener('nfcTagScanned', (event: any) => {
        handleNFCTagPremium(event);
      });

      await Nfc.startScanSession();
      
      toast.success("✓ Lecteur NFC Premium activé - Approchez un tag");
    } catch (err: any) {
      console.error('[NFC] Erreur démarrage scan:', err);
      setError(err.message || "Erreur lors du démarrage du scan NFC");
      setIsScanning(false);
      toast.error("Impossible d'activer le NFC");
    }
  };

  const stopScanning = async () => {
    try {
      await Nfc.stopScanSession();
      await Nfc.removeAllListeners();
      setIsScanning(false);
      setIsWriting(false);
      nfcCallbackRef.current = null;
      console.log('[NFC] Scan arrêté');
    } catch (err) {
      console.error('[NFC] Erreur arrêt scan:', err);
      setIsScanning(false);
      setIsWriting(false);
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

      const isAvailable = await checkNfcAvailable();
      if (!isAvailable) {
        throw new Error("Plugin NFC Premium non disponible");
      }

      setError(null);
      setIsWriting(true);

      const textToWrite = `reptile:${selectedReptileId}`;

      toast.info("📝 Approchez un tag NFC vierge");

      // Créer le record NDEF Text
      const record = createTextRecord(textToWrite);

      console.log('[NFC] Préparation écriture avec record:', record);

      await Nfc.addListener('nfcTagScanned', async (event: any) => {
        try {
          console.log('[NFC] Tag détecté pour écriture:', JSON.stringify(event));
          console.log('[NFC] Record à écrire:', JSON.stringify(record));
          
          // Écrire directement sans formater (format peut causer des erreurs)
          console.log('[NFC] Tentative écriture...');
          await Nfc.write({
            message: {
              records: [record]
            }
          });

          console.log('[NFC] Écriture réussie !');
          await Nfc.stopScanSession();
          await Nfc.removeAllListeners();
          toast.success("✓ Tag NFC programmé avec succès !");
          setIsWriting(false);
        } catch (writeErr: any) {
          console.error('[NFC] Erreur écriture tag:', writeErr);
          console.error('[NFC] Message:', writeErr?.message);
          console.error('[NFC] Code:', writeErr?.code);
          console.error('[NFC] Data:', JSON.stringify(writeErr?.data));
          
          // Afficher l'erreur complète
          const errorMsg = writeErr?.message || writeErr?.code || JSON.stringify(writeErr) || 'Erreur inconnue';
          toast.error("Erreur lors de l'écriture: " + errorMsg);
          setIsWriting(false);
          try {
            await Nfc.stopScanSession();
            await Nfc.removeAllListeners();
          } catch (e) {
            console.error('[NFC] Erreur cleanup:', e);
          }
        }
      });

      await Nfc.startScanSession();

    } catch (err: any) {
      console.error('[NFC] Erreur écriture:', err);
      setError(err.message || "Erreur lors de l'écriture NFC");
      setIsWriting(false);
      toast.error("Impossible d'écrire sur le tag NFC");
    }
  };

  const handleNFCTagPremium = async (event: any) => {
    try {
      console.log('[NFC] ===== TAG PREMIUM DÉTECTÉ =====');
      console.log('[NFC] Event complet:', event);
      
      const ndefMessage = event.nfcTag?.message;
      
      if (!ndefMessage || !ndefMessage.records || ndefMessage.records.length === 0) {
        console.error('[NFC] Aucun message NDEF trouvé');
        toast.error("Tag NFC vide");
        await Nfc.stopScanSession();
        return;
      }

      let foundReptileId: string | null = null;

      for (const record of ndefMessage.records) {
        console.log('[NFC] Record:', record);
        
        if (!record.payload || record.payload.length === 0) continue;

        const decoder = new TextDecoder();
        const payloadString = decoder.decode(new Uint8Array(record.payload));
        console.log('[NFC] Payload décodé:', payloadString);

        if (payloadString.includes('reptile:')) {
          const match = payloadString.match(/reptile:([a-f0-9-]{36})/i);
          if (match?.[1]) {
            foundReptileId = match[1];
            console.log('[NFC] ✓ ID reptile trouvé:', foundReptileId);
            break;
          }
        }
        
        if (payloadString.includes('/reptile/')) {
          const match = payloadString.match(/\/reptile\/([a-f0-9-]{36})/i);
          if (match?.[1]) {
            foundReptileId = match[1];
            console.log('[NFC] ✓ URL reptile trouvée:', foundReptileId);
            break;
          }
        }
      }

      if (foundReptileId) {
        console.log('[NFC] Arrêt de la session NFC...');
        await Nfc.stopScanSession();
        await Nfc.removeAllListeners();
        
        setIsScanning(false);
        nfcCallbackRef.current = null;
        
        toast.success("🦎 Fiche reptile trouvée !");
        
        console.log('[NFC] Navigation vers:', foundReptileId);
        navigate(`/reptile/${foundReptileId}`);
        
        return;
      }

      await Nfc.stopScanSession();
      toast.error("Tag NFC ne contient pas de données reptile valides");
      
    } catch (err: any) {
      console.error('[NFC] Erreur traitement tag:', err);
      toast.error("Erreur lecture NFC");
      try {
        await Nfc.stopScanSession();
      } catch (stopErr) {
        console.error('[NFC] Erreur arrêt session:', stopErr);
      }
    }
  };

  if (!Capacitor.isNativePlatform()) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Application mobile requise</h2>
          <p className="text-muted-foreground">
            La fonctionnalité NFC n'est disponible que sur l'application mobile Android ou iOS.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Waves className="w-8 h-8" />
          Lecteur NFC
        </h1>
        <p className="text-muted-foreground">
          Scannez ou programmez des tags NFC pour vos reptiles
        </p>
      </div>

      {error && (
        <Card className="p-4 mb-6 bg-destructive/10 border-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Erreur</p>
              <p className="text-sm text-destructive/90">{error}</p>
            </div>
          </div>
        </Card>
      )}

      <Tabs value={mode} onValueChange={(v) => setMode(v as 'read' | 'write')} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="read" className="gap-2">
            <ScanLine className="w-4 h-4" />
            Lecture
          </TabsTrigger>
          <TabsTrigger value="write" className="gap-2">
            <Edit className="w-4 h-4" />
            Écriture
          </TabsTrigger>
        </TabsList>

        <TabsContent value="read" className="space-y-6">
          <Card className="p-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className={`relative ${isScanning ? 'animate-pulse' : ''}`}>
                  <Smartphone className="w-32 h-32 text-primary" />
                  {isScanning && (
                    <Waves className="w-20 h-20 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {isScanning ? 'Approchez un tag NFC' : 'Prêt à scanner'}
                </h3>
                <p className="text-muted-foreground">
                  {isScanning 
                    ? 'Maintenez votre appareil près du tag NFC'
                    : 'Activez le lecteur NFC et approchez un tag'}
                </p>
              </div>

              {!isScanning ? (
                <Button onClick={startScanning} size="lg" className="w-full">
                  <Waves className="w-5 h-5 mr-2" />
                  Activer le lecteur NFC
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="outline" size="lg" className="w-full">
                  Désactiver
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-blue-500/10 border-blue-500/20">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
                <p className="font-semibold">Comment scanner un tag NFC ?</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Cliquez sur "Activer le lecteur NFC"</li>
                  <li>Approchez votre téléphone d'un tag NFC programmé</li>
                  <li>Attendez la vibration/notification</li>
                  <li>La fiche du reptile s'ouvrira automatiquement</li>
                </ol>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="write" className="space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Sélectionnez un reptile
              </label>
              <Select value={selectedReptileId} onValueChange={setSelectedReptileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un reptile..." />
                </SelectTrigger>
                <SelectContent>
                  {reptiles.map((reptile) => (
                    <SelectItem key={reptile.id} value={reptile.id}>
                      {reptile.name} - {reptile.species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className={`relative ${isWriting ? 'animate-pulse' : ''}`}>
                  <Smartphone className="w-24 h-24 text-primary" />
                  {isWriting && (
                    <Edit className="w-12 h-12 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>

              <Button 
                onClick={startWriting} 
                disabled={!selectedReptileId || isWriting}
                size="lg" 
                className="w-full"
              >
                <Edit className="w-5 h-5 mr-2" />
                {isWriting ? 'Approchez le tag...' : 'Programmer un tag NFC'}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-amber-500/10 border-amber-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-900 dark:text-amber-100 space-y-2">
                <p className="font-semibold">Programmation d'un tag NFC</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Sélectionnez le reptile à associer au tag</li>
                  <li>Cliquez sur "Programmer un tag NFC"</li>
                  <li>Approchez un tag NFC vierge de votre téléphone</li>
                  <li>Attendez la confirmation de succès</li>
                </ol>
                <p className="text-xs mt-2 opacity-75">
                  Note: Utilisez des tags NFC vierges ou réinscriptibles (NTAG213/215/216)
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
