import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NFC } from 'capacitor-nfc';
import { Capacitor } from '@capacitor/core';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Waves, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const NFCReader = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    checkNFCSupport();
    return () => {
      stopScanning();
    };
  }, []);

  const checkNFCSupport = async () => {
    if (!Capacitor.isNativePlatform()) {
      setError("La lecture NFC n'est disponible que sur l'application mobile");
      return;
    }

    try {
      const available = await NFC.isSupported();
      setIsSupported(available.isSupported);
      
      if (!available.isSupported) {
        setError("Votre appareil ne supporte pas la technologie NFC");
      } else {
        const enabled = await NFC.isEnabled();
        if (!enabled.isEnabled) {
          setError("Veuillez activer le NFC dans les paramètres de votre téléphone");
        }
      }
    } catch (err) {
      console.error('[NFC] Erreur vérification support:', err);
      setError("Impossible de vérifier le support NFC");
    }
  };

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Vérifier les permissions
      const permission = await NFC.checkPermissions();
      if (permission.nfc !== 'granted') {
        const request = await NFC.requestPermissions();
        if (request.nfc !== 'granted') {
          throw new Error("Permission NFC refusée");
        }
      }

      // Démarrer l'écoute NFC
      await NFC.addListener('nfcTagScanned', (event: any) => {
        handleNFCTag(event.nfcTag);
      });

      toast.success("Approchez un tag NFC de votre téléphone");
    } catch (err: any) {
      console.error('[NFC] Erreur démarrage scan:', err);
      setError(err.message || "Erreur lors du démarrage du scan NFC");
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      await Nfc.removeAllListeners();
      setIsScanning(false);
    } catch (err) {
      console.error('[NFC] Erreur arrêt scan:', err);
    }
  };

  const handleNFCTag = async (tag: any) => {
    try {
      // Extraire l'ID du reptile depuis le tag NFC
      const message = tag.message?.[0];
      if (!message) {
        throw new Error("Tag NFC vide");
      }

      // Le payload contient l'ID du reptile au format "reptile:UUID"
      const payload = message.payload;
      const text = new TextDecoder().decode(new Uint8Array(payload));
      
      console.log('[NFC] Tag détecté:', text);

      if (text.startsWith('reptile:')) {
        const reptileId = text.replace('reptile:', '');
        toast.success("Fiche trouvée !");
        await stopScanning();
        navigate(`/reptile/${reptileId}`);
      } else {
        throw new Error("Tag NFC non reconnu");
      }
    } catch (err: any) {
      console.error('[NFC] Erreur traitement tag:', err);
      toast.error(err.message || "Impossible de lire ce tag NFC");
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
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Card className="p-8">
        <div className="text-center mb-6">
          <Smartphone className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Lecteur NFC</h1>
          <p className="text-muted-foreground">
            Approchez un tag NFC de votre téléphone pour ouvrir la fiche du reptile
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {!isScanning ? (
            <Button
              onClick={startScanning}
              disabled={!isSupported || !!error}
              className="w-full"
              size="lg"
            >
              <Waves className="w-5 h-5 mr-2" />
              Activer le lecteur NFC
            </Button>
          ) : (
            <>
              <div className="bg-primary/10 border border-primary rounded-lg p-6 text-center">
                <Waves className="w-12 h-12 mx-auto mb-3 text-primary animate-pulse" />
                <p className="font-medium text-primary">En écoute...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Approchez un tag NFC de l'arrière de votre téléphone
                </p>
              </div>
              <Button
                onClick={stopScanning}
                variant="outline"
                className="w-full"
              >
                Arrêter
              </Button>
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold mb-3">💡 Conseils</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Assurez-vous que le NFC est activé sur votre téléphone</li>
            <li>• Approchez le tag du dos de votre téléphone</li>
            <li>• Maintenez le téléphone immobile pendant 1-2 secondes</li>
            <li>• Les tags NFC fonctionnent même sans connexion internet</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
