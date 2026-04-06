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

interface StartScanSessionOptions {
  alertMessage?: string;
  pollingOptions?: string[];
  compatibilityMode?: boolean;
}

interface NfcPlugin {
  addListener: (event: string, callback: (event: any) => void) => Promise<any>;
  removeAllListeners: () => Promise<void>;
  startScanSession: (options?: StartScanSessionOptions) => Promise<void>;
  stopScanSession: () => Promise<void>;
  write: (options: { message: { records: NdefRecord[] } }) => Promise<void>;
  isSupported: () => Promise<{ isSupported: boolean }>;
  erase: () => Promise<void>;
  format: () => Promise<void>;
}

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

const TypeNameFormat = {
  Empty: 0,
  WellKnown: 1,
  MimeMedia: 2,
  AbsoluteUri: 3,
  External: 4,
  Unknown: 5,
  Unchanged: 6,
};

const toNumberArray = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is number => typeof item === 'number');
  }
  if (value instanceof Uint8Array) {
    return Array.from(value);
  }
  if (value && typeof value === 'object') {
    return Object.values(value).filter((item): item is number => typeof item === 'number');
  }
  return [];
};

const createTextRecord = (text: string): NdefRecord => {
  const languageBytes = Array.from(new TextEncoder().encode('en'));
  const textBytes = Array.from(new TextEncoder().encode(text));
  const statusByte = languageBytes.length;
  const payload = [statusByte, ...languageBytes, ...textBytes];
  const record: NdefRecord = {
    tnf: TypeNameFormat.WellKnown,
    type: [0x54],
    payload: payload,
    id: [0x00]
  };
  console.log('[NFC] Record cree:', JSON.stringify(record));
  return record;
};

let nfcError: string | null = null;

const NFC_PLUGIN_NOT_INSTALLED_ERROR = "Le plugin NFC Premium n'est pas installe dans cette version de l'application.\n\nPour utiliser le NFC, vous devez :\n1. Installer l'APK avec le plugin NFC Premium\n2. Utiliser le script \"reinstall-android-nfc.bat\"\n\nInstallez la version avec le plugin NFC pour profiter de cette fonctionnalite.";

const checkNfcAvailable = async (): Promise<{ available: boolean; error?: string }> => {
  try {
    if (!Capacitor.isNativePlatform()) {
      return { available: false, error: "NFC disponible uniquement sur mobile" };
    }
    
    console.log('[NFC] Verification du plugin premium...');
    console.log('[NFC] Platform:', Capacitor.getPlatform());
    
    try {
      const result = await Nfc.isSupported();
      console.log('[NFC] isSupported result:', JSON.stringify(result));
      const supported = result?.isSupported === true || (result as any)?.nfc === true;
      if (supported) {
        console.log('[NFC] Plugin detecte via isSupported');
        return { available: true };
      }
    } catch (err1: any) {
      const msg1 = err1?.message || String(err1);
      console.warn('[NFC] isSupported failed:', msg1);
      if (msg1.includes('not implemented') || msg1.includes('not available') || msg1.includes('does not have')) {
        nfcError = NFC_PLUGIN_NOT_INSTALLED_ERROR;
        return { available: false, error: NFC_PLUGIN_NOT_INSTALLED_ERROR };
      }
    }
    
    try {
      const result2 = await (Nfc as any).isAvailable();
      console.log('[NFC] isAvailable result:', JSON.stringify(result2));
      const available = result2?.nfc === true;
      if (available) {
        console.log('[NFC] Plugin detecte via isAvailable');
        return { available: true };
      }
    } catch (err2: any) {
      console.warn('[NFC] isAvailable failed:', err2?.message || String(err2));
    }
    
    try {
      const perms = await (Nfc as any).checkPermissions();
      console.log('[NFC] checkPermissions result:', JSON.stringify(perms));
      if (perms?.nfc === 'granted') {
        console.log('[NFC] Plugin detecte via checkPermissions');
        return { available: true };
      }
    } catch (err3: any) {
      console.warn('[NFC] checkPermissions failed:', err3?.message || String(err3));
    }
    
    console.error('[NFC] Aucune methode de detection n\'a confirme le plugin');
    nfcError = NFC_PLUGIN_NOT_INSTALLED_ERROR;
    return { available: false, error: NFC_PLUGIN_NOT_INSTALLED_ERROR };
  } catch (err: any) {
    console.error('[NFC] Plugin non disponible:', err);
    nfcError = err?.message || 'Plugin non disponible';
    return { available: false, error: nfcError };
  }
};

// === Helpers specifiques par plateforme ===
const isIOS = () => Capacitor.getPlatform() === 'ios';
const isAndroid = () => Capacitor.getPlatform() === 'android';

const isTagNotNdefError = (message?: string) => /tag\s+not\s+ndef\s+formatted/i.test(message || '');
const isTagConnectionLostError = (message?: string) => /tag\s+connection\s+lost/i.test(message || '');
const isPluginUnavailableError = (message?: string) => {
  const msg = (message || '').toLowerCase();
  return (
    msg.includes("plugin nfc premium") ||
    msg.includes('not implemented') ||
    msg.includes('plugin non disponible')
  );
};

const getNfcFriendlyError = (message: string, _mode: 'read' | 'write') => {
  if (isTagConnectionLostError(message)) {
    return isIOS()
      ? 'Connexion au tag perdue. Gardez le tag immobile contre le haut de l\'iPhone pendant 2 secondes.'
      : 'Connexion au tag perdue. Maintenez le tag contre le dos du telephone sans bouger.';
  }
  if (isTagNotNdefError(message)) {
    return isIOS()
      ? 'Ce tag n\'est pas formate NDEF. Formatez-le d\'abord avec un Android (app NFC Tools).'
      : 'Ce tag n\'est pas formate NDEF. Formatage automatique en cours...';
  }
  return message;
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
  
  const [isCheckingPlugin, setIsCheckingPlugin] = useState(true);
  const [isPluginAvailable, setIsPluginAvailable] = useState(false);

  useEffect(() => {
    loadReptiles();
    
    const checkPlugin = async () => {
      if (!Capacitor.isNativePlatform()) {
        setIsCheckingPlugin(false);
        setIsPluginAvailable(false);
        return;
      }
      
      console.log('[NFC] Verification automatique du plugin premium...');
      const result = await checkNfcAvailable();
      console.log('[NFC] Resultat verification:', result);
      
      setIsPluginAvailable(result.available);
      if (!result.available && result.error) {
        setError(result.error);
      }
      setIsCheckingPlugin(false);
    };
    
    checkPlugin();
    
    return () => {
      const cleanupNfc = async () => {
        try {
          await Nfc.stopScanSession();
          await Nfc.removeAllListeners();
        } catch {
          // no-op
        }
      };
      void cleanupNfc();
      nfcCallbackRef.current = null;
    };
  }, []);

  const loadReptiles = async () => {
    try {
      const { data, error } = await supabase
        .from('reptiles')
        .select('id, name, species')
        .in('status', ['active', 'for_sale'])
        .order('name');

      if (error) throw error;
      setReptiles(data || []);
    } catch (err) {
      console.error('[NFC] Erreur chargement reptiles:', err);
    }
  };

  const startScanning = async () => {
    try {
      if (isScanning) return;

      setError(null);
      setIsScanning(true);

      if (!Capacitor.isNativePlatform()) {
        throw new Error("La lecture NFC n'est disponible que sur l'application mobile");
      }

      const checkResult = await checkNfcAvailable();
      if (!checkResult.available) {
        throw new Error(checkResult.error || "Plugin NFC Premium non disponible");
      }

      console.log('[NFC] Configuration de l\'ecouteur NFC Premium...');

      await Nfc.removeAllListeners();

      const tagListener = await Nfc.addListener('nfcTagScanned', (event: any) => {
        handleNFCTagPremium(event);
      });

      const sessionErrorListener = await Nfc.addListener('scanSessionError', async (sessionErr: any) => {
        const rawMessage = sessionErr?.message || 'Session NFC interrompue';
        const friendlyMessage = getNfcFriendlyError(rawMessage, 'read');
        console.error('[NFC] Erreur session NFC:', rawMessage);

        // Sur Android: ne JAMAIS fermer la session pour les erreurs de tag
        // Android gere nativement la persistence de session
        if (isAndroid()) {
          const isTagError = isTagConnectionLostError(rawMessage) || isTagNotNdefError(rawMessage)
            || rawMessage.toLowerCase().includes('tag') || rawMessage.toLowerCase().includes('ndef');
          if (isTagError) {
            console.log('[NFC] [Android] Erreur de tag non fatale, session maintenue:', rawMessage);
            toast.warning(friendlyMessage);
            return;
          }
        }

        // Sur iOS: relancer la session apres connexion perdue ou erreur de tag
        if (isIOS()) {
          const isRecoverable = isTagConnectionLostError(rawMessage) || isTagNotNdefError(rawMessage);
          if (isRecoverable) {
            toast.warning(friendlyMessage);
            try {
              await Nfc.startScanSession({
                alertMessage: 'Réessayez - approchez le tag lentement',
                compatibilityMode: true,
              });
            } catch { /* session peut deja etre active */ }
            return;
          }
        }

        // Erreur fatale (plugin manquant, etc.)
        setError(friendlyMessage);
        setIsScanning(false);
        toast.error(friendlyMessage);

        try {
          await Nfc.stopScanSession();
          await Nfc.removeAllListeners();
        } catch {
          // no-op
        }
      });

      nfcCallbackRef.current = { tagListener, sessionErrorListener };

      // iOS: compatibilityMode pour stabilite NDEF
      // Android: session standard sans options restrictives
      const sessionOptions: StartScanSessionOptions = {
        alertMessage: 'Approchez un tag NFC S-reptrack',
      };
      if (isIOS()) {
        sessionOptions.compatibilityMode = true;
      }
      await Nfc.startScanSession(sessionOptions);
      
      toast.success("Lecteur NFC Premium active - Approchez un tag");
    } catch (err: any) {
      console.error('[NFC] Erreur demarrage scan:', err);
      const errorMsg = err?.message || "Erreur lors du demarrage du scan NFC";
      
      if (errorMsg.includes('not implemented') || errorMsg.includes('not available')) {
        setError(NFC_PLUGIN_NOT_INSTALLED_ERROR);
      } else {
        setError(errorMsg);
      }

      try {
        await Nfc.removeAllListeners();
      } catch {
        // no-op
      }
      
      nfcCallbackRef.current = null;
      setIsScanning(false);
      toast.error("Plugin NFC non disponible");
    }
  };

  const stopScanning = async () => {
    try {
      if (nfcCallbackRef.current?.tagListener?.remove) {
        await nfcCallbackRef.current.tagListener.remove();
      }
      if (nfcCallbackRef.current?.sessionErrorListener?.remove) {
        await nfcCallbackRef.current.sessionErrorListener.remove();
      }

      await Nfc.stopScanSession();
      await Nfc.removeAllListeners();
      setIsScanning(false);
      setIsWriting(false);
      nfcCallbackRef.current = null;
      console.log('[NFC] Scan arrete');
    } catch (err) {
      console.error('[NFC] Erreur arret scan:', err);
      setIsScanning(false);
      setIsWriting(false);
      nfcCallbackRef.current = null;
    }
  };

  const startWriting = async () => {
    try {
      if (!selectedReptileId) {
        toast.error("Veuillez selectionner un reptile");
        return;
      }

      if (!Capacitor.isNativePlatform()) {
        throw new Error("L'ecriture NFC n'est disponible que sur l'application mobile");
      }

      const checkResult = await checkNfcAvailable();
      if (!checkResult.available) {
        throw new Error(checkResult.error || "Plugin NFC Premium non disponible");
      }

      setError(null);
      setIsWriting(true);

      const textToWrite = `reptile:${selectedReptileId}`;
      const record = createTextRecord(textToWrite);

      toast.info("Approchez un tag NFC et gardez-le immobile");
      console.log('[NFC] Preparation ecriture avec record:', record);

      await Nfc.removeAllListeners();

      const writeTagListener = await Nfc.addListener('nfcTagScanned', async (event: any) => {
        const writePayload = {
          message: {
            records: [record],
          },
        };

        try {
          console.log('[NFC] Tag detecte pour ecriture:', JSON.stringify(event));
          console.log('[NFC] Plateforme:', Capacitor.getPlatform());
          
          // Tentative d'ecriture directe
          try {
            await Nfc.write(writePayload);
          } catch (directWriteErr: any) {
            const rawDirect = directWriteErr?.message || '';
            console.warn('[NFC] Ecriture directe echouee:', rawDirect);
            
            // Android uniquement: tenter format() puis reessayer
            // iOS ne supporte pas format() de maniere fiable
            if (isTagNotNdefError(rawDirect) && isAndroid()) {
              console.log('[NFC] [Android] Tag non NDEF, tentative de formatage automatique...');
              try {
                await Nfc.format();
                console.log('[NFC] [Android] Formatage OK, nouvelle tentative d\'ecriture...');
                await Nfc.write(writePayload);
              } catch (formatErr: any) {
                console.error('[NFC] [Android] Echec formatage:', formatErr);
                throw directWriteErr;
              }
            } else if (isTagNotNdefError(rawDirect) && isIOS()) {
              throw new Error("Ce tag n'est pas formate NDEF. Formatez-le avec un Android (app NFC Tools) puis reessayez sur iPhone.");
            } else {
              throw directWriteErr;
            }
          }

          console.log('[NFC] Ecriture reussie !');
          await Nfc.stopScanSession();
          await Nfc.removeAllListeners();
          toast.success("Tag NFC programme avec succes !");
          setIsWriting(false);
        } catch (writeErr: any) {
          console.error('[NFC] Erreur ecriture tag:', writeErr);
          const rawError = writeErr?.message || writeErr?.code || JSON.stringify(writeErr) || 'Erreur inconnue';

          const friendlyError = getNfcFriendlyError(rawError, 'write');
          setError(friendlyError);
          toast.error("Erreur lors de l'ecriture: " + friendlyError);

          if (isTagConnectionLostError(rawError) && isIOS()) {
            toast.info("Representez le tag sans le bouger pendant 2 secondes.");
            return;
          }

          setIsWriting(false);
          try {
            await Nfc.stopScanSession();
            await Nfc.removeAllListeners();
          } catch (e) {
            console.error('[NFC] Erreur cleanup:', e);
          }
        }
      });

      const writeSessionErrorListener = await Nfc.addListener('scanSessionError', async (sessionErr: any) => {
        const rawMsg = sessionErr?.message || 'Session NFC interrompue';
        const friendlyError = getNfcFriendlyError(rawMsg, 'write');

        // Android: garder la session pour les erreurs de tag (connexion perdue, non-NDEF)
        if (isAndroid()) {
          const isTagError = isTagConnectionLostError(rawMsg) || isTagNotNdefError(rawMsg)
            || rawMsg.toLowerCase().includes('tag');
          if (isTagError) {
            console.log('[NFC] [Android] Erreur de tag non fatale en ecriture, session maintenue');
            toast.warning(friendlyError + '\nReessayez avec le meme tag.');
            return;
          }
        }

        // iOS: relancer apres connexion perdue
        if (isIOS() && (isTagConnectionLostError(rawMsg) || isTagNotNdefError(rawMsg))) {
          toast.warning(friendlyError);
          try {
            await Nfc.startScanSession({
              alertMessage: 'Réessayez - approchez le tag sans bouger',
            });
          } catch { /* ignore */ }
          return;
        }

        setError(friendlyError);
        setIsWriting(false);
        toast.error(friendlyError);
        try {
          await Nfc.stopScanSession();
          await Nfc.removeAllListeners();
        } catch {
          // no-op
        }
      });

      nfcCallbackRef.current = { writeTagListener, writeSessionErrorListener };

      // iOS et Android: session standard pour ecriture
      await Nfc.startScanSession({
        alertMessage: 'Approchez un tag NFC et ne le bougez pas pendant 2 secondes',
      });
    } catch (err: any) {
      console.error('[NFC] Erreur ecriture:', err);
      const friendlyError = getNfcFriendlyError(err?.message || "Erreur lors de l'ecriture NFC", 'write');
      setError(friendlyError);
      setIsWriting(false);
      toast.error("Impossible d'ecrire sur le tag NFC");
    }
  };

  const handleNFCTagPremium = async (event: any) => {
    try {
      console.log('[NFC] ===== TAG PREMIUM DETECTE =====');
      console.log('[NFC] Event complet:', event);
      
      const nfcTag = event?.nfcTag ?? event;
      const ndefMessage = nfcTag?.message;
      
      if (!ndefMessage?.records || ndefMessage.records.length === 0) {
        const techTypes = Array.isArray(nfcTag?.techTypes) ? nfcTag.techTypes.join(', ') : 'inconnu';
        const tagIdHex = toNumberArray(nfcTag?.id)
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('');

        console.warn('[NFC] Tag detecte sans message NDEF', {
          techTypes,
          tagIdHex,
          tag: nfcTag,
        });

        // Ne PAS arreter la session - laisser l'utilisateur reessayer avec un autre tag
        const hint = isIOS()
          ? 'Ce tag est vide ou non formate. Essayez un autre tag (NTAG215 recommande).'
          : 'Ce tag est vide ou non formate. Essayez un autre tag ou formatez-le avec NFC Tools.';
        toast.warning(hint);
        console.log('[NFC] Session maintenue active pour reessayer');
        // Sur iOS, la session se ferme automatiquement apres un scan - relancer
        if (isIOS()) {
          try {
            await Nfc.startScanSession({
              alertMessage: 'Approchez un autre tag NFC',
              compatibilityMode: true,
            });
          } catch {
            // Session deja active ou terminee
          }
        }
        return;
      }

      let foundReptileId: string | null = null;

      for (let i = 0; i < ndefMessage.records.length; i++) {
        const record = ndefMessage.records[i];
        try {
          console.log('[NFC] Record #' + i + ' TNF:', record?.tnf);
          console.log('[NFC] Record #' + i + ' type:', JSON.stringify(record?.type));
          console.log('[NFC] Record #' + i + ' payload brut:', JSON.stringify(record?.payload));
          
          const payloadArray = toNumberArray(record?.payload);
          
          if (payloadArray.length === 0) {
            console.log('[NFC] Record #' + i + ' sans payload valide, ignore');
            continue;
          }

          const payloadBytes = new Uint8Array(payloadArray);
          console.log('[NFC] Payload bytes length:', payloadBytes.length);
          console.log('[NFC] Payload hex:', Array.from(payloadBytes).map(b => b.toString(16).padStart(2, '0')).join(' '));

          let textContent = '';
          
          const typeArray = toNumberArray(record?.type);
          const isTextRecord = typeArray.length === 1 && typeArray[0] === 0x54;
          
          console.log('[NFC] Is Text record:', isTextRecord, 'typeArray:', JSON.stringify(typeArray));
          
          if (isTextRecord && payloadBytes.length > 1) {
            const statusByte = payloadBytes[0];
            const languageCodeLength = statusByte & 0x3F;
            const textStartIndex = 1 + languageCodeLength;
            
            console.log('[NFC] Status byte:', statusByte, 'lang length:', languageCodeLength, 'text start:', textStartIndex);
            
            if (textStartIndex < payloadBytes.length) {
              const textBytes = payloadBytes.slice(textStartIndex);
              textContent = new TextDecoder('utf-8').decode(textBytes);
              console.log('[NFC] Text record decode:', textContent);
            }
          } else {
            textContent = new TextDecoder('utf-8').decode(payloadBytes);
            console.log('[NFC] Payload decode (fallback):', textContent);
          }

          if (!textContent) {
            console.log('[NFC] Aucun contenu texte extrait');
            continue;
          }

          const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;

          const reptileMatch = textContent.match(/reptile:([a-f0-9-]{36})/i);
          if (reptileMatch?.[1]) {
            foundReptileId = reptileMatch[1].toLowerCase();
            console.log('[NFC] ID reptile trouve (format reptile:):', foundReptileId);
            break;
          }
          
          const urlMatch = textContent.match(/\/reptile\/([a-f0-9-]{36})/i);
          if (urlMatch?.[1]) {
            foundReptileId = urlMatch[1].toLowerCase();
            console.log('[NFC] URL reptile trouvee:', foundReptileId);
            break;
          }

          const uuidMatch = textContent.match(uuidRegex);
          if (uuidMatch?.[1]) {
            foundReptileId = uuidMatch[1].toLowerCase();
            console.log('[NFC] UUID trouve (fallback):', foundReptileId);
            break;
          }
        } catch (recordErr) {
          console.error('[NFC] Erreur traitement record #' + i + ':', recordErr);
        }
      }

      if (foundReptileId) {
        console.log('[NFC] Arret de la session NFC...');
        await Nfc.stopScanSession();
        await Nfc.removeAllListeners();
        
        setIsScanning(false);
        nfcCallbackRef.current = null;
        
        toast.success("Fiche reptile trouvee !");
        
        console.log('[NFC] Navigation vers:', foundReptileId);
        navigate(`/reptile/${foundReptileId}`);
        
        return;
      }

      // Pas de reptile ID trouve mais le tag avait du contenu NDEF
      // Ne PAS arreter la session - laisser reessayer
      toast.warning("Ce tag NFC ne contient pas de donnees reptile. Essayez un autre tag.");
      console.log('[NFC] Aucun reptile ID, session maintenue active');
      // Sur iOS, relancer la session apres chaque scan
      if (isIOS()) {
        try {
          await Nfc.startScanSession({
            alertMessage: 'Approchez un autre tag NFC',
            compatibilityMode: true,
          });
        } catch {
          // Session deja active
        }
      }
      
    } catch (err: any) {
      console.error('[NFC] Erreur traitement tag:', err);
      toast.error("Erreur lecture NFC");
      // Ne pas arreter la session sur erreur de traitement - garder le scan actif
      console.log('[NFC] Session maintenue malgre l\'erreur');
    }
  };

  // Affichage web (non-natif)
  if (!Capacitor.isNativePlatform()) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Application mobile requise</h2>
          <p className="text-muted-foreground">
            La fonctionnalite NFC n'est disponible que sur l'application mobile Android ou iOS.
          </p>
        </Card>
      </div>
    );
  }

  if (isCheckingPlugin) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Waves className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Verification NFC...</h2>
          <p className="text-muted-foreground">
            Detection du plugin NFC Premium en cours
          </p>
        </Card>
      </div>
    );
  }

  if (!isPluginAvailable) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h2 className="text-2xl font-bold mb-2">Plugin NFC Premium requis</h2>
          <p className="text-muted-foreground mb-4">
            Cette version de l'application ne dispose pas du plugin NFC Premium.
          </p>
          <div className="bg-muted p-4 rounded-lg text-left text-sm mb-4">
            <p className="font-semibold mb-2">Pour activer le NFC :</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Ouvrez le projet localement (git pull)</li>
              <li>Executez le script <code className="bg-background px-1 py-0.5 rounded">1-RECONSTRUCTION-COMPLETE-NFC.bat</code></li>
              <li>Installez l'APK genere sur votre telephone</li>
            </ol>
          </div>
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
        <Card className="p-4 mb-6 border-destructive bg-destructive/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-destructive mb-2">
                {isPluginUnavailableError(error) ? 'Plugin NFC non disponible' : 'Erreur NFC'}
              </p>
              <div className="text-sm text-destructive/90 space-y-1">
                {error.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-destructive/20">
                <p className="text-sm text-muted-foreground">
                  <strong>Astuce :</strong> {isIOS() 
                    ? 'Maintenez le tag colle au dos de l\'iPhone jusqu\'a la confirmation.'
                    : 'Maintenez le tag contre le dos du telephone sans bouger.'}
                </p>
              </div>
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
            Ecriture
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
                  {isScanning ? 'Approchez un tag NFC' : 'Pret a scanner'}
                </h3>
                <p className="text-muted-foreground">
                  {isScanning 
                    ? 'Maintenez votre appareil pres du tag NFC'
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
                  Desactiver
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-accent/10 border-accent/20">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-accent-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm space-y-2">
                <p className="font-semibold">Comment scanner un tag NFC ?</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Cliquez sur "Activer le lecteur NFC"</li>
                  <li>Approchez votre telephone d'un tag NFC programme</li>
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
                Selectionnez un reptile
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

          <Card className="p-6 bg-accent/10 border-accent/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-accent-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm space-y-2">
                <p className="font-semibold">Programmation d'un tag NFC</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Selectionnez le reptile a associer au tag</li>
                  <li>Cliquez sur "Programmer un tag NFC"</li>
                  <li>Approchez un tag NFC vierge de votre telephone</li>
                  <li>Attendez la confirmation de succes</li>
                </ol>
                <p className="text-xs mt-2 opacity-75">
                  Note: Utilisez des tags NFC vierges ou reinscriptibles (NTAG213/215/216)
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
