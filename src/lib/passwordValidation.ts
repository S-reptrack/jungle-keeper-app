import CryptoJS from 'crypto-js';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * Liste des mots de passe les plus courants à rejeter
 */
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'password1', 'admin', 'welcome', 'azerty'
];

/**
 * Valide un mot de passe selon des critères de sécurité stricts
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  // Longueur minimale
  if (password.length < 12) {
    errors.push('Le mot de passe doit contenir au moins 12 caractères');
  }

  // Au moins une majuscule
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }

  // Au moins une minuscule
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }

  // Au moins un chiffre
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  // Au moins un caractère spécial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)');
  }

  // Vérifier contre les mots de passe courants
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Ce mot de passe est trop courant et facilement devinable');
  }

  // Vérifier les patterns répétitifs
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Le mot de passe ne doit pas contenir de caractères répétés consécutivement');
  }

  // Vérifier les séquences simples
  const sequences = ['012', '123', '234', '345', '456', '567', '678', '789', 'abc', 'bcd', 'cde', 'xyz'];
  if (sequences.some(seq => password.toLowerCase().includes(seq))) {
    errors.push('Le mot de passe ne doit pas contenir de séquences simples');
  }

  // Calculer la force
  if (errors.length === 0) {
    if (password.length >= 16 && /[A-Z]/.test(password) && /[a-z]/.test(password) && 
        /[0-9]/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      strength = 'strong';
    } else if (password.length >= 12) {
      strength = 'medium';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * Vérifie si un mot de passe a été compromis via l'API Have I Been Pwned
 * Utilise k-anonymity: seuls les 5 premiers caractères du hash SHA-1 sont envoyés
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  try {
    // Générer le hash SHA-1 du mot de passe
    const hash = CryptoJS.SHA1(password).toString().toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // Appeler l'API HIBP avec seulement les 5 premiers caractères
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: {
        'Add-Padding': 'true' // Sécurité supplémentaire
      }
    });

    if (!response.ok) {
      console.warn('Impossible de vérifier le mot de passe compromis, validation ignorée');
      return false; // En cas d'erreur API, on ne bloque pas l'utilisateur
    }

    const text = await response.text();
    const hashes = text.split('\n');

    // Vérifier si notre hash est dans la liste
    for (const line of hashes) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        return true; // Mot de passe compromis trouvé
      }
    }

    return false; // Mot de passe non compromis
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe compromis:', error);
    return false; // En cas d'erreur, on ne bloque pas
  }
}

/**
 * Validation complète avec vérification de compromission
 */
export async function validatePasswordComplete(password: string): Promise<PasswordValidationResult> {
  const result = validatePassword(password);
  
  if (result.isValid) {
    const isBreached = await checkPasswordBreach(password);
    if (isBreached) {
      result.isValid = false;
      result.errors.push('Ce mot de passe a été compromis dans une fuite de données. Veuillez en choisir un autre.');
    }
  }

  return result;
}
