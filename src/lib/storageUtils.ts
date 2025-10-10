import { supabase } from "@/integrations/supabase/client";

/**
 * Génère une URL signée temporaire pour accéder à une image privée
 * @param imagePath - Le chemin du fichier dans le bucket (ex: "user_id/reptile_id-timestamp.jpg")
 * @param expiresIn - Durée de validité de l'URL en secondes (par défaut: 1 heure)
 * @returns L'URL signée ou null en cas d'erreur
 */
export async function getSignedImageUrl(
  imagePath: string | null, 
  expiresIn: number = 3600
): Promise<string | null> {
  if (!imagePath) return null;

  try {
    const { data, error } = await supabase.storage
      .from('reptile-images')
      .createSignedUrl(imagePath, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Unexpected error creating signed URL:', error);
    return null;
  }
}

/**
 * Hook React pour gérer une URL signée avec rafraîchissement automatique
 */
import { useState, useEffect } from 'react';

export function useSignedImageUrl(imagePath: string | null, expiresIn: number = 3600) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSignedUrl() {
      if (!imagePath) {
        setSignedUrl(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const url = await getSignedImageUrl(imagePath, expiresIn);
      
      if (isMounted) {
        setSignedUrl(url);
        setLoading(false);
      }
    }

    loadSignedUrl();

    // Rafraîchir l'URL avant expiration (90% de la durée)
    const refreshInterval = setInterval(
      loadSignedUrl, 
      expiresIn * 900 // 90% de expiresIn en millisecondes
    );

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [imagePath, expiresIn]);

  return { signedUrl, loading };
}