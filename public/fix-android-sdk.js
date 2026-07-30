import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const androidRoot = path.join(__dirname, '..', 'android');
const variablesGradlePath = path.join(androidRoot, 'variables.gradle');
const appBuildGradlePath = path.join(androidRoot, 'app', 'build.gradle');

const TARGET_SDK = 35;   // Android 15 — obligatoire pour Play Protect / Play Store
const COMPILE_SDK = 35;  // Doit correspondre au targetSdk
const MIN_SDK = 24;      // Minimum pour Capacitor 8

function readFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function replaceVariable(content, name, value) {
  const regex = new RegExp(`(\\b${name}\\s*=\\s*)[0-9.]+`, 'g');
  if (regex.test(content)) {
    return content.replace(regex, `$1${value}`);
  }
  // Si la variable n'existe pas, on l'ajoute à la fin du bloc ext
  return content.replace(/(\s*\}\s*)$/, `    ${name} = ${value}\n$1`);
}

function replaceGradleValue(content, name, value) {
  // Pour les fichiers .gradle sans mot clé "def"
  const regex = new RegExp(`(\\b${name}\\s*=\\s*)[0-9.]+`, 'g');
  if (regex.test(content)) {
    return content.replace(regex, `$1${value}`);
  }
  return content;
}

console.log('🔧 Mise à jour des versions SDK Android...');

try {
  // 1. Patch variables.gradle (méthode moderne Capacitor 8)
  let variablesContent = readFile(variablesGradlePath);
  if (variablesContent) {
    console.log('📄 variables.gradle trouvé');
    variablesContent = replaceVariable(variablesContent, 'compileSdkVersion', COMPILE_SDK);
    variablesContent = replaceVariable(variablesContent, 'targetSdkVersion', TARGET_SDK);
    variablesContent = replaceVariable(variablesContent, 'minSdkVersion', MIN_SDK);
    fs.writeFileSync(variablesGradlePath, variablesContent);
    console.log(`✅ variables.gradle mis à jour : compileSdk=${COMPILE_SDK}, targetSdk=${TARGET_SDK}, minSdk=${MIN_SDK}`);
  } else {
    console.log('⚠️ variables.gradle introuvable (normal avec certaines versions de Capacitor)');
  }

  // 2. Patch app/build.gradle (solution de secours)
  let appBuildContent = readFile(appBuildGradlePath);
  if (appBuildContent) {
    console.log('📄 app/build.gradle trouvé');
    appBuildContent = replaceGradleValue(appBuildContent, 'compileSdk', COMPILE_SDK);
    appBuildContent = replaceGradleValue(appBuildContent, 'targetSdk', TARGET_SDK);
    appBuildContent = replaceGradleValue(appBuildContent, 'minSdk', MIN_SDK);
    fs.writeFileSync(appBuildGradlePath, appBuildContent);
    console.log(`✅ app/build.gradle mis à jour : compileSdk=${COMPILE_SDK}, targetSdk=${TARGET_SDK}, minSdk=${MIN_SDK}`);
  } else {
    console.error('❌ app/build.gradle introuvable. Avez-vous exécuté npx cap add android ?');
    process.exit(1);
  }

  console.log('🎉 Configuration Android SDK mise à jour avec succès !');
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}
