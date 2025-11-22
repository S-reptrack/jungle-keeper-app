# 🚀 Migration vers NFC Premium - Guide Complet

## ✅ Prérequis
- Licence Capawesome achetée ✓
- Clé de licence reçue par email

---

## 📝 ÉTAPES À SUIVRE

### Étape 1 : Exporter le projet
1. Dans Lovable, cliquez sur le bouton **GitHub** en haut à droite
2. Exportez le projet vers votre compte GitHub

### Étape 2 : Ouvrir PowerShell dans le dossier du projet
1. Ouvrez l'explorateur Windows
2. Allez dans `C:\Users\berti\jungle-keeper-app`
3. Dans la barre d'adresse, tapez `powershell` et appuyez sur Entrée

### Étape 3 : Git Pull (Récupérer les dernières modifications)
```powershell
git pull
```

### Étape 4 : Configurer la clé de licence Capawesome
**⚠️ REMPLACEZ `VOTRE_CLE_ICI` par votre vraie clé de licence !**

```powershell
npm config set @capawesome-team:registry https://npm.registry.capawesome.io
npm config set //npm.registry.capawesome.io/:_authToken VOTRE_CLE_ICI
npm config set //npm.registry.capawesome.io/:always-auth true
```

### Étape 5 : Installer les dépendances
```powershell
npm install
```

### Étape 6 : Désinstaller l'ancien plugin NFC gratuit
```powershell
npm uninstall @exxili/capacitor-nfc
```

### Étape 7 : Installer le plugin NFC premium
```powershell
npm install @capawesome-team/capacitor-nfc
```

### Étape 8 : Build du projet
```powershell
npm run build
```

### Étape 9 : Synchroniser avec Android
```powershell
npx cap sync android
```

### Étape 10 : Lancer l'application
```powershell
npx cap run android
```

---

## 📱 Configuration Android (AndroidManifest.xml)

Le fichier est déjà configuré avec les permissions NFC :
```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
```

---

## ✅ Vérification de l'installation

Pour vérifier que le plugin premium est bien installé :
```powershell
npm list @capawesome-team/capacitor-nfc
```

---

## 🎯 Avantages du plugin premium

✅ **Beaucoup plus stable** - Pas de crash lors de la lecture NFC
✅ **Écriture NFC** - Possibilité de programmer des tags
✅ **Meilleure API** - Plus de contrôle et de fonctionnalités
✅ **Support Android et iOS** - Fonctionne sur les deux plateformes

---

## 📞 Support

- Documentation Capawesome: https://capawesome.io/plugins/nfc/
- Support Capawesome: https://capawesome.io/support/

---

## ⚠️ Notes importantes

- Le code a déjà été mis à jour dans Lovable pour utiliser l'API premium
- Après la migration, les tags NFC fonctionneront sans crash
- Testez toujours sur un appareil physique (NFC ne fonctionne pas sur émulateur)
