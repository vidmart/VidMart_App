import freshTomatoes from "@/assets/products/fresh-tomatoes.jpg";
import grapes from "@/assets/products/grapes.jpg";
import watermelon from "@/assets/products/watermelon.jpg";
import pasta from "@/assets/products/pasta.jpg";
import sugar from "@/assets/products/sugar.jpg";
import cannedBeans from "@/assets/products/canned-beans.jpg";
import salt from "@/assets/products/salt.jpg";
import honey from "@/assets/products/honey.jpg";
import cinnamonRolls from "@/assets/products/cinnamon-rolls.jpg";
import energyDrink from "@/assets/products/energy-drink.jpg";
import appleJuice from "@/assets/products/apple-juice.jpg";
import coconutWater from "@/assets/products/coconut-water.jpg";

export const productImageMap: Record<string, string> = {
  "Fresh Tomatoes": freshTomatoes,
  "Grapes": grapes,
  "Watermelon": watermelon,
  "Pasta": pasta,
  "Sugar": sugar,
  "Canned Beans": cannedBeans,
  "Salt": salt,
  "Honey": honey,
  "Cinnamon Rolls": cinnamonRolls,
  "Energy Drink": energyDrink,
  "Apple Juice": appleJuice,
  "Coconut Water": coconutWater,
};

export function getProductImage(productName: string, fallbackUrl: string): string {
  return productImageMap[productName] || fallbackUrl;
}
