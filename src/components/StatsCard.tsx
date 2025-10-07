import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
}

const StatsCard = ({ title, value, icon: Icon, trend }: StatsCardProps) => {
  return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-soft transition-all duration-300 overflow-hidden h-full">
        <CardContent className="p-4 sm:p-6 h-full">
          <div className="flex items-center justify-between gap-4 min-h-[64px] sm:min-h-[72px]">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground mb-1 truncate">{title}</p>
              <p className="text-3xl font-bold text-foreground truncate">{value}</p>
              {trend && (
                <p className="text-xs text-accent mt-1 truncate">{trend}</p>
              )}
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center bg-gradient-jungle rounded-xl shrink-0">
              <Icon className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
  );
};

export default StatsCard;
