/**
 * Masque partiellement un email pour la confidentialité
 * Exemple: "jean.dupont@gmail.com" -> "j*********t@gmail.com"
 */
export const maskEmail = (email: string | null | undefined): string => {
  if (!email || email === '') return '';
  
  const [localPart, domain] = email.split('@');
  
  if (!domain) return email;
  
  let maskedLocal: string;
  
  if (localPart.length <= 2) {
    maskedLocal = localPart;
  } else {
    const firstChar = localPart.charAt(0);
    const lastChar = localPart.charAt(localPart.length - 1);
    const middleLength = Math.max(localPart.length - 2, 1);
    maskedLocal = firstChar + '*'.repeat(middleLength) + lastChar;
  }
  
  return `${maskedLocal}@${domain}`;
};
