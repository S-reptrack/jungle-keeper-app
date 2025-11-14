import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');

console.log('🔧 Modification automatique d\'AndroidManifest.xml...');

try {
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ AndroidManifest.xml introuvable. Exécutez d\'abord: npx cap sync android');
    process.exit(1);
  }

  let manifestContent = fs.readFileSync(manifestPath, 'utf8');

  // Vérifier si les permissions sont déjà présentes
  if (manifestContent.includes('android.permission.CAMERA')) {
    console.log('✅ Les permissions caméra sont déjà configurées');
  } else {
    // Ajouter les permissions après <manifest>
    const manifestRegex = /(<manifest[^>]*>)/;
    const permissions = `
  <!-- Permissions caméra ajoutées automatiquement -->
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-feature android:name="android.hardware.camera" android:required="false" />
  <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />`;

    manifestContent = manifestContent.replace(manifestRegex, `$1${permissions}`);
    console.log('✅ Permissions caméra ajoutées');
  }

  // Vérifier si les permissions NFC sont déjà présentes
  if (manifestContent.includes('android.permission.NFC')) {
    console.log('✅ Les permissions NFC sont déjà configurées');
  } else {
    const manifestHeaderRegex = /(<manifest[^>]*>)/;
    const nfcPermissions = `
  <!-- Permissions NFC ajoutées automatiquement -->
  <uses-permission android:name="android.permission.NFC" />
  <uses-feature android:name="android.hardware.nfc" android:required="false" />`;

    manifestContent = manifestContent.replace(manifestHeaderRegex, `$1${nfcPermissions}`);
    console.log('✅ Permissions NFC ajoutées');
  }

  // Vérifier si ML Kit est déjà configuré
  if (manifestContent.includes('com.google.mlkit.vision.DEPENDENCIES')) {
    console.log('✅ ML Kit est déjà configuré');
  } else {
    // Ajouter ML Kit dans <application>
    const applicationRegex = /(<application[^>]*>)/;
    const mlkitMeta = `
    <!-- ML Kit ajouté automatiquement -->
    <meta-data
        android:name="com.google.mlkit.vision.DEPENDENCIES"
        android:value="barcode" />`;

    manifestContent = manifestContent.replace(applicationRegex, `$1${mlkitMeta}`);
    console.log('✅ ML Kit configuré');
  }

  // Sauvegarder le fichier modifié
  fs.writeFileSync(manifestPath, manifestContent);
  console.log('🎉 AndroidManifest.xml modifié avec succès !');
  console.log('📱 Relancez maintenant: npx cap run android');

} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}