import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MessageSquare, Star, Loader2, Send } from "lucide-react";

const categories = (t: any) => [
  { value: "bug", label: t("testerFeedback.categories.bug") },
  { value: "ui", label: t("testerFeedback.categories.ui") },
  { value: "feature", label: t("testerFeedback.categories.feature") },
  { value: "performance", label: t("testerFeedback.categories.performance") },
  { value: "general", label: t("testerFeedback.categories.general") },
];

const TesterFeedbackForm = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState("general");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error(t("testerFeedback.loginRequired"));
      return;
    }

    if (rating === 0) {
      toast.error(t("testerFeedback.ratingRequired"));
      return;
    }

    if (!feedback.trim()) {
      toast.error(t("testerFeedback.feedbackRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("tester_feedback").insert({
        user_id: user.id,
        rating,
        category,
        feedback: feedback.trim(),
        page_url: window.location.pathname,
      });

      if (error) throw error;

      toast.success(t("testerFeedback.success"));
      setRating(0);
      setCategory("general");
      setFeedback("");
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast.error(t("testerFeedback.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{t("testerFeedback.title")}</CardTitle>
        </div>
        <CardDescription>
          {t("testerFeedback.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rating */}
        <div>
          <label className="text-sm font-medium mb-2 block">{t("testerFeedback.overallRating")}</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium mb-2 block">{t("testerFeedback.category")}</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories(t).map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Feedback text */}
        <div>
          <label className="text-sm font-medium mb-2 block">{t("testerFeedback.feedbackLabel")}</label>
          <Textarea
            placeholder={t("testerFeedback.feedbackPlaceholder")}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || rating === 0 || !feedback.trim()}
          className="w-full"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {t("testerFeedback.submit")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TesterFeedbackForm;
