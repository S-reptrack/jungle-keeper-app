# 🔐 Guide de Migration vers le Plugin NFC Premium

## ⚠️ IMPORTANT - Pourquoi cette erreur ?

L'erreur `ENOTFOUND npm.registry.capawesome.dev` est **NORMALE**.

**Le plugin premium `@capawesome-team/capacitor-nfc` ne peut PAS être installé dans Lovable** pour ces raisons:
- ❌ Nécessite une authentification avec clé de licence
- ❌ Registre npm privé non accessible depuis Lovable
- ❌ Doit être installé en local après export GitHub

## 📦 Versions disponibles

### Version GRATUITE (actuelle dans Lovable)
- ✅ Plugin: `@exxili/capacitor-nfc`
- ✅ Lecture NFC uniquement
- ❌ **PAS d'écriture NFC**
- ✅ Fonctionne dans Lovable
- ✅ Gratuit

### Version PREMIUM (installation locale uniquement)
- ✅ Plugin: `@capawesome-team/capacitor-nfc`
- ✅ Lecture **ET** écriture NFC
- ✅ API plus complète
- ❌ **Payant** (licence Capawesome requise)
- ❌ **Installation locale uniquement**

---

## 🚀 Migration vers la Version Premium

### Prérequis
✅ Licence Capawesome achetée: https://capawesome.io
✅ Clé de licence reçue par email

### Étape 1: Export vers GitHub
```
1. Dans Lovable, cliquez sur le bouton GitHub en haut à droite
2. Exportez le projet vers votre compte GitHub
3. Git pull le projet sur votre ordinateur local
```

### Étape 2: Configuration du registre npm
Sur votre ordinateur, dans le dossier du projet:

```bash
# Configurer le registre Capawesome
npm config set @capawesome-team:registry https://npm.registry.capawesome.dev

# Ajouter votre clé de licence (remplacez YOUR_LICENSE_KEY)
npm config set //npm.registry.capawesome.dev/:_authToken YOUR_LICENSE_KEY
```

### Étape 3: Installation des dépendances
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Installer le plugin premium
npm install @capawesome-team/capacitor-nfc

# Désinstaller l'ancien plugin gratuit
npm uninstall @exxili/capacitor-nfc
```

### Étape 4: Mettre à jour le code NFCReader
Le fichier `src/components/NFCReader.tsx` contient déjà le code commenté pour la version premium.

Remplacez les imports:
```typescript
// AVANT (version gratuite)
import { NFC, NDEFMessagesTransformable } from '@exxili/capacitor-nfc';

// APRÈS (version premium)
import { Nfc, NfcTag, NfcUtils } from '@capawesome-team/capacitor-nfc';
```

### Étape 5: Build et synchronisation
```bash
npm run build
npx cap sync android
npx cap sync ios
```

### Étape 6: Configuration native

#### Android
Le fichier `AndroidManifest.xml` est déjà configuré:
```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
```

#### iOS
Ajoutez dans `ios/App/App/Info.plist`:
```xml
<key>NFCReaderUsageDescription</key>
<string>Cette application utilise NFC pour scanner et programmer les tags de vos reptiles</string>
<key>com.apple.developer.nfc.readersession.formats</key>
<array>
    <string>NDEF</string>
</array>
```

### Étape 7: Test
```bash
# Android
npx cap run android

# iOS (Mac uniquement avec Xcode)
npx cap run ios
```

---

## 🔍 Différences d'API

### Lecture NFC

**Version gratuite:**
```typescript
NFC.onRead((data: NDEFMessagesTransformable) => {
  const stringData = data.string();
  // Traitement...
});
await NFC.startScan();
```

**Version premium:**
```typescript
Nfc.addListener('nfcTagScanned', (event: { nfcTag: NfcTag }) => {
  const text = NfcUtils.convertBytesToString(event.nfcTag.message.records[0].payload);
  // Traitement...
});
await Nfc.startScanSession();
```

### Écriture NFC

**Version gratuite:**
```typescript
❌ Non supportée
```

**Version premium:**
```typescript
✅ await Nfc.write({
  message: {
    records: [{
      typeNameFormat: 1,
      type: NfcUtils.convertStringToBytes('T'),
      payload: NfcUtils.convertStringToBytes('reptile:UUID')
    }]
  }
});
```

---

## 📚 Ressources

- Documentation Capawesome NFC: https://capawesome.io/plugins/nfc/
- Support Capawesome: https://capawesome.io/support/
- Devenir sponsor: https://capawesome.io/sponsors/

---

## 💡 Résumé

| Fonctionnalité | Version Gratuite | Version Premium |
|----------------|------------------|-----------------|
| Lecture NFC | ✅ | ✅ |
| Écriture NFC | ❌ | ✅ |
| Lovable | ✅ | ❌ |
| Installation locale | ✅ | ✅ (avec licence) |
| Coût | Gratuit | ~$29-99/mois |

**Recommandation:**
- 🆓 Développement/Test → Version gratuite dans Lovable
- 🚀 Production avec écriture NFC → Migrez vers la version premium en local

---

## ❓ FAQ

**Q: Pourquoi ne pas installer le plugin premium dans Lovable?**
R: Le registre npm de Capawesome nécessite une authentification qui n'est pas possible dans l'environnement Lovable.

**Q: Puis-je utiliser les deux plugins?**
R: Non, il faut choisir l'un ou l'autre. Le plugin premium remplace complètement le gratuit.

**Q: L'écriture NFC fonctionne-t-elle avec la version gratuite?**
R: Non, seule la lecture est supportée. L'écriture nécessite obligatoirement le plugin premium.

**Q: Combien coûte la licence Capawesome?**
R: Les tarifs varient selon votre usage. Consultez https://capawesome.io/sponsors/ pour les détails.
