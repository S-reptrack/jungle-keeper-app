import { useTranslation } from "react-i18next";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { FoodType } from "@/data/speciesDiets";

const allFoodTypes: { value: FoodType; labelKey: string }[] = [
  { value: "rat", labelKey: "feeding.rats.title" },
  { value: "mouse", labelKey: "feeding.mice.title" },
  { value: "rabbit", labelKey: "feeding.rabbits.title" },
  { value: "insect", labelKey: "feeding.insects.title" },
  { value: "vegetable", labelKey: "feeding.vegetables.title" },
  { value: "fruit", labelKey: "feeding.fruits.title" },
  { value: "pellet", labelKey: "feeding.pellets.title" },
  { value: "fish", labelKey: "feeding.fish.title" },
  { value: "crustacean", labelKey: "feeding.crustaceans.title" },
  { value: "wholePrey", labelKey: "feeding.wholePrey.title" },
];

const getTranslationKey = (type: string): string => {
  const keyMap: Record<string, string> = {
    rat: "rats",
    mouse: "mice",
    rabbit: "rabbits",
    insect: "insects",
    vegetable: "vegetables",
    fruit: "fruits",
    pellet: "pellets",
    fish: "fish",
    crustacean: "crustaceans",
    wholePrey: "wholePrey",
  };
  return keyMap[type] || type;
};

const getStagesForType = (type: string): string[] => {
  const stages: Record<string, string[]> = {
    rat: ["pinky", "fuzzy", "hopper", "weaner", "small", "medium", "large", "jumbo", "extraLarge"],
    mouse: ["pinky", "fuzzy", "hopper", "weaner", "small", "medium", "large", "jumbo"],
    rabbit: ["baby", "small", "medium", "large", "extraLarge"],
    insect: ["cricket", "dubia", "locust", "mealworm", "superworm", "waxworm", "hornworm", "silkworm", "blackSoldierFly"],
    vegetable: ["leafyGreens", "squash", "carrot", "bellPepper", "cucumber", "zucchini", "greenBeans", "mixedVegetables"],
    fruit: ["banana", "strawberry", "mango", "papaya", "raspberry", "blueberry", "apple", "mixedFruits"],
    pellet: ["turtlePellet", "lizardPellet", "omnivore", "herbivore", "carnivore"],
    fish: ["guppy", "goldfish", "tilapia", "trout", "smelt", "shrimp", "silverside", "wholefish"],
    crustacean: ["crayfish", "shrimp", "crab", "snail"],
    wholePrey: ["chick", "quail", "egg", "frog", "fish"],
  };
  return stages[type] || [];
};

interface FoodTypePickerProps {
  allowedFoods: FoodType[];
  selectedType: string;
  selectedStage: string;
  onSelect: (type: string, stage: string) => void;
}

const FoodTypePicker = ({
  allowedFoods,
  selectedType,
  selectedStage,
  onSelect,
}: FoodTypePickerProps) => {
  const { t } = useTranslation();
  const [expandedType, setExpandedType] = useState<string | null>(selectedType || null);

  const filteredFoodTypes = allFoodTypes.filter((f) =>
    allowedFoods.includes(f.value)
  );

  const handleTypeClick = (type: string) => {
    setExpandedType(expandedType === type ? null : type);
  };

  const handleStageClick = (type: string, stage: string) => {
    onSelect(type, stage);
  };

  return (
    <div className="rounded-md border border-border overflow-hidden">
      {filteredFoodTypes.map((foodType) => {
        const isExpanded = expandedType === foodType.value;
        const isSelectedType = selectedType === foodType.value;
        const stages = getStagesForType(foodType.value);
        const translationKey = getTranslationKey(foodType.value);

        return (
          <div key={foodType.value}>
            <button
              type="button"
              onClick={() => handleTypeClick(foodType.value)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium transition-colors",
                "hover:bg-accent/50",
                isSelectedType && "bg-primary/10 text-primary",
                !isExpanded && "border-b border-border last:border-b-0"
              )}
            >
              <span>{t(foodType.labelKey)}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            {isExpanded && stages.length > 0 && (
              <div className="bg-muted/30 border-b border-border last:border-b-0">
                {stages.map((stage) => {
                  const isSelected =
                    selectedType === foodType.value && selectedStage === stage;
                  return (
                    <button
                      key={stage}
                      type="button"
                      onClick={() =>
                        handleStageClick(foodType.value, stage)
                      }
                      className={cn(
                        "w-full flex items-center gap-2 px-6 py-2 text-sm transition-colors",
                        "hover:bg-accent/50",
                        isSelected &&
                          "bg-primary/15 text-primary font-medium"
                      )}
                    >
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span className={cn(!isSelected && "ml-5.5")}>
                        {t(`feeding.${translationKey}.${stage}`)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export { allFoodTypes, getTranslationKey, getStagesForType };
export default FoodTypePicker;
