-- Table pour l'historique des photos des animaux
CREATE TABLE public.reptile_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reptile_id UUID NOT NULL REFERENCES public.reptiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  taken_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reptile_photos
ALTER TABLE public.reptile_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for reptile_photos
CREATE POLICY "Users can view their own reptile photos"
ON public.reptile_photos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reptile photos"
ON public.reptile_photos FOR INSERT
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM reptiles WHERE id = reptile_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update their own reptile photos"
ON public.reptile_photos FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reptile photos"
ON public.reptile_photos FOR DELETE
USING (auth.uid() = user_id);

-- Table pour la généalogie (liens parent-enfant entre reptiles)
CREATE TABLE public.reptile_genealogy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reptile_id UUID NOT NULL REFERENCES public.reptiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.reptiles(id) ON DELETE CASCADE,
  parent_type TEXT NOT NULL CHECK (parent_type IN ('mother', 'father')),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reptile_id, parent_type)
);

-- Enable RLS on reptile_genealogy
ALTER TABLE public.reptile_genealogy ENABLE ROW LEVEL SECURITY;

-- RLS policies for reptile_genealogy
CREATE POLICY "Users can view their own genealogy"
ON public.reptile_genealogy FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own genealogy"
ON public.reptile_genealogy FOR INSERT
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM reptiles WHERE id = reptile_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update their own genealogy"
ON public.reptile_genealogy FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own genealogy"
ON public.reptile_genealogy FOR DELETE
USING (auth.uid() = user_id);

-- Table pour le marketplace (annonces)
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reptile_id UUID REFERENCES public.reptiles(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  price_type TEXT NOT NULL DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'negotiable', 'exchange', 'free')),
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'deleted')),
  contact_email TEXT,
  contact_phone TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days')
);

-- Enable RLS on marketplace_listings
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- RLS policies for marketplace_listings (listings are visible to all authenticated users)
CREATE POLICY "Anyone can view active listings"
ON public.marketplace_listings FOR SELECT
USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own listings"
ON public.marketplace_listings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
ON public.marketplace_listings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
ON public.marketplace_listings FOR DELETE
USING (auth.uid() = user_id);

-- Table pour les images du marketplace
CREATE TABLE public.marketplace_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on marketplace_images
ALTER TABLE public.marketplace_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for marketplace_images
CREATE POLICY "Anyone can view images of active listings"
ON public.marketplace_images FOR SELECT
USING (EXISTS (
  SELECT 1 FROM marketplace_listings ml 
  WHERE ml.id = listing_id AND (ml.status = 'active' OR ml.user_id = auth.uid())
));

CREATE POLICY "Users can create their own images"
ON public.marketplace_images FOR INSERT
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM marketplace_listings WHERE id = listing_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete their own images"
ON public.marketplace_images FOR DELETE
USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_reptile_photos_updated_at
BEFORE UPDATE ON public.reptile_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_listings_updated_at
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_reptile_photos_reptile_id ON public.reptile_photos(reptile_id);
CREATE INDEX idx_reptile_genealogy_reptile_id ON public.reptile_genealogy(reptile_id);
CREATE INDEX idx_reptile_genealogy_parent_id ON public.reptile_genealogy(parent_id);
CREATE INDEX idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_user_id ON public.marketplace_listings(user_id);
CREATE INDEX idx_marketplace_images_listing_id ON public.marketplace_images(listing_id);