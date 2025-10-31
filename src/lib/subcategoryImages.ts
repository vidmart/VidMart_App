import beans from "@/assets/subcategories/beans.jpg";
import brinjal from "@/assets/subcategories/brinjal.jpg";
import curryLeaves from "@/assets/subcategories/curry-leaves.jpg";
import tomato from "@/assets/subcategories/tomato.jpg";
import apple from "@/assets/subcategories/apple.jpg";
import banana from "@/assets/subcategories/banana.jpg";
import orange from "@/assets/subcategories/orange.jpg";
import mango from "@/assets/subcategories/mango.jpg";
import rice from "@/assets/subcategories/rice.jpg";
import wheat from "@/assets/subcategories/wheat.jpg";
import sugar from "@/assets/subcategories/sugar.jpg";
import salt from "@/assets/subcategories/salt.jpg";
import milk from "@/assets/subcategories/milk.jpg";
import curd from "@/assets/subcategories/curd.jpg";
import butter from "@/assets/subcategories/butter.jpg";
import cheese from "@/assets/subcategories/cheese.jpg";
import bread from "@/assets/subcategories/bread.jpg";
import buns from "@/assets/subcategories/buns.jpg";
import cake from "@/assets/subcategories/cake.jpg";
import cookies from "@/assets/subcategories/cookies.jpg";
import tea from "@/assets/subcategories/tea.jpg";
import coffee from "@/assets/subcategories/coffee.jpg";
import juice from "@/assets/subcategories/juice.jpg";
import softDrinks from "@/assets/subcategories/soft-drinks.jpg";

export const subcategoryImageMap: Record<string, string> = {
  "Beans": beans,
  "Brinjal": brinjal,
  "Curry Leaves": curryLeaves,
  "Tomato": tomato,
  "Apple": apple,
  "Banana": banana,
  "Orange": orange,
  "Mango": mango,
  "Rice": rice,
  "Wheat": wheat,
  "Sugar": sugar,
  "Salt": salt,
  "Milk": milk,
  "Curd": curd,
  "Butter": butter,
  "Cheese": cheese,
  "Bread": bread,
  "Buns": buns,
  "Cake": cake,
  "Cookies": cookies,
  "Tea": tea,
  "Coffee": coffee,
  "Juice": juice,
  "Soft Drinks": softDrinks,
};

export function getSubcategoryImage(subcategory: string): string {
  return subcategoryImageMap[subcategory] || "";
}
