import type Ionicons from "@expo/vector-icons/Ionicons";

export type ReceiptItemIcon = keyof typeof Ionicons.glyphMap;

const ICON_RULES: ReadonlyArray<{
  pattern: RegExp;
  icon: ReceiptItemIcon;
}> = [
  {
    pattern:
      /\b(burger|steak|chicken|salmon|meatballs?|calamari|fish|lamb|beef|pork)\b/i,
    icon: "restaurant-outline",
  },
  {
    pattern: /\b(wine|beer|cocktail|drink|cider|champagne)\b/i,
    icon: "wine-outline",
  },
  {
    pattern: /\b(coffee|espresso|latte|cappuccino|americano)\b/i,
    icon: "cafe-outline",
  },
  {
    pattern: /\b(dessert|fondant|tiramisu|cake|ice cream|brownie)\b/i,
    icon: "ice-cream-outline",
  },
  {
    pattern: /\b(salad|mushroom|vegetable|veggie|risotto|spinach)\b/i,
    icon: "leaf-outline",
  },
];

export function getReceiptItemIcon(itemName: string): ReceiptItemIcon {
  return (
    ICON_RULES.find((rule) => rule.pattern.test(itemName))?.icon ??
    "receipt-outline"
  );
}
