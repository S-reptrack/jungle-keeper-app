import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { PremiumFeatureGate } from "@/components/PremiumFeatureGate";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { ShoppingBag, Plus, MapPin, Calendar, Eye, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  price_type: string;
  location: string | null;
  status: string;
  views: number;
  created_at: string;
  expires_at: string;
  user_id: string;
  reptile_id: string | null;
}

const Marketplace = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("fixed");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user]);

  const fetchListings = async () => {
    try {
      // Fetch all active listings
      const { data: allListings } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      setListings(allListings || []);

      // Fetch my listings
      const { data: mine } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      setMyListings(mine || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async () => {
    if (!title.trim()) {
      toast.error(t("marketplace.titleRequired"));
      return;
    }

    try {
      const { error } = await supabase.from("marketplace_listings").insert({
        title: title.trim(),
        description: description.trim() || null,
        price: price ? parseFloat(price) : null,
        price_type: priceType,
        location: location.trim() || null,
        user_id: user!.id
      });

      if (error) throw error;

      toast.success(t("marketplace.listingCreated"));
      setDialogOpen(false);
      resetForm();
      fetchListings();
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      const { error } = await supabase
        .from("marketplace_listings")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success(t("marketplace.listingDeleted"));
      fetchListings();
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const handleMarkSold = async (id: string) => {
    try {
      const { error } = await supabase
        .from("marketplace_listings")
        .update({ status: "sold" })
        .eq("id", id);

      if (error) throw error;
      toast.success(t("marketplace.markedAsSold"));
      fetchListings();
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setPriceType("fixed");
    setLocation("");
  };

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getPriceDisplay = (listing: Listing) => {
    switch (listing.price_type) {
      case "free": return t("marketplace.free");
      case "exchange": return t("marketplace.exchange");
      case "negotiable": return listing.price ? `${listing.price}€ (${t("marketplace.negotiable")})` : t("marketplace.negotiable");
      default: return listing.price ? `${listing.price}€` : t("marketplace.priceOnRequest");
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8 md:pt-24 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-primary" />
            {t("marketplace.title")}
          </h1>
        </div>

        <PremiumFeatureGate 
          featureName={t("marketplace.title")}
          featureDescription={t("marketplace.description")}
        >
          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList>
              <TabsTrigger value="browse">{t("marketplace.browse")}</TabsTrigger>
              <TabsTrigger value="my-listings">{t("marketplace.myListings")}</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("marketplace.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredListings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t("marketplace.noListings")}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredListings.map(listing => (
                    <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-1">{listing.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {listing.description || t("marketplace.noDescription")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-xl font-bold text-primary">
                          {getPriceDisplay(listing)}
                        </div>
                        {listing.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {listing.location}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(listing.created_at), "d MMM yyyy", { locale: fr })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {listing.views}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-listings" className="space-y-4">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("marketplace.createListing")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("marketplace.createListing")}</DialogTitle>
                    <DialogDescription>
                      {t("marketplace.createListingDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{t("marketplace.listingTitle")}</Label>
                      <Input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t("marketplace.titlePlaceholder")}
                      />
                    </div>
                    
                    <div>
                      <Label>{t("marketplace.descriptionLabel")}</Label>
                      <Textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t("marketplace.descriptionPlaceholder")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t("marketplace.priceType")}</Label>
                        <Select value={priceType} onValueChange={setPriceType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">{t("marketplace.fixed")}</SelectItem>
                            <SelectItem value="negotiable">{t("marketplace.negotiable")}</SelectItem>
                            <SelectItem value="exchange">{t("marketplace.exchange")}</SelectItem>
                            <SelectItem value="free">{t("marketplace.free")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(priceType === "fixed" || priceType === "negotiable") && (
                        <div>
                          <Label>{t("marketplace.price")}</Label>
                          <Input 
                            type="number" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>{t("marketplace.location")}</Label>
                      <Input 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={t("marketplace.locationPlaceholder")}
                      />
                    </div>

                    <Button onClick={handleCreateListing} className="w-full">
                      {t("marketplace.publish")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {myListings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t("marketplace.noMyListings")}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {myListings.map(listing => (
                    <Card key={listing.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg line-clamp-1">{listing.title}</CardTitle>
                            <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                              {listing.status === "active" ? t("marketplace.active") : t("marketplace.sold")}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-xl font-bold text-primary">
                          {getPriceDisplay(listing)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          {listing.views} {t("marketplace.views")}
                        </div>
                      </CardContent>
                      <CardFooter className="gap-2">
                        {listing.status === "active" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMarkSold(listing.id)}
                          >
                            {t("marketplace.markSold")}
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteListing(listing.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </PremiumFeatureGate>
      </main>
    </div>
  );
};

export default Marketplace;
