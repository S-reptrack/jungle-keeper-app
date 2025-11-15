# Installation du Plugin NFC Premium (@capawesome-team/capacitor-nfc)

## Prérequis
✅ Licence Capawesome achetée
✅ Clé de licence reçue par email

## Étapes d'installation

### 1. Exporter le projet vers GitHub
- Cliquez sur le bouton GitHub en haut à droite de Lovable
- Transférez le projet vers votre compte GitHub

### 2. Cloner le projet localement
```bash
git clone https://github.com/VOTRE-USERNAME/jungle-keeper-app.git
cd jungle-keeper-app
```

### 3. Configurer l'accès au registre Capawesome
Remplacez `YOUR_LICENSE_KEY` par votre clé de licence :

```bash
npm config set @capawesome-team:registry https://npm.registry.capawesome.dev
npm config set //npm.registry.capawesome.dev/:_authToken YOUR_LICENSE_KEY
```

### 4. Installer les dépendances
```bash
npm install
```

### 5. Installer le plugin NFC premium
```bash
npm install @capawesome-team/capacitor-nfc
```

### 6. Build du projet
```bash
npm run build
```

### 7. Synchroniser avec les plateformes natives
```bash
npx cap sync
```

### 8. Lancer sur Android
```bash
npx cap run android
```

### 9. Lancer sur iOS (Mac uniquement)
```bash
npx cap run ios
```

## Configuration supplémentaire

### Android (AndroidManifest.xml)
Le fichier est déjà configuré avec les permissions NFC :
```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
```

### iOS (Info.plist)
Ajoutez dans `ios/App/App/Info.plist` :
```xml
<key>NFCReaderUsageDescription</key>
<string>Cette application utilise NFC pour lire et programmer des tags associés à vos reptiles</string>
<key>com.apple.developer.nfc.readersession.formats</key>
<array>
    <string>NDEF</string>
</array>
```

## Fonctionnalités disponibles

✅ **Lecture NFC** - Scanner des tags pour accéder aux fiches reptiles
✅ **Écriture NFC** - Programmer des tags avec les IDs des reptiles
✅ **Support Android et iOS**
✅ **Messages NDEF** - Format standard pour la compatibilité

## Vérification de l'installation

Pour vérifier que le plugin est bien installé :
```bash
npm list @capawesome-team/capacitor-nfc
```

## Support

- Documentation Capawesome: https://capawesome.io/plugins/nfc/
- Support Capawesome: https://capawesome.io/support/
- Discord S-reptrack: [votre lien]

## Notes importantes

⚠️ **Le plugin premium est nécessaire pour l'écriture NFC**
⚠️ **Testez toujours sur un appareil physique (l'émulateur ne supporte pas NFC)**
⚠️ **Sur iOS, l'utilisateur doit autoriser l'accès NFC lors du premier scan**

## Mise à jour du code

Le code a été mis à jour pour utiliser l'API du plugin premium :
- ✅ `Nfc.startScanSession()` pour démarrer le scan
- ✅ `Nfc.write()` pour l'écriture
- ✅ `Nfc.addListener('nfcTagScanned')` pour les événements
- ✅ `NfcUtils` pour la conversion de données

Le composant NFCReader.tsx est prêt à utiliser le plugin premium dès son installation.
