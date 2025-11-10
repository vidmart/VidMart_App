import { useState } from "react";
import { Menu, X, ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const subcategories: Record<string, string[]> = {
  Vegetables: [
    "Beans",
    "Brinjal",
    "Curry Leaves",
    "Tomato",
    "Onion",
    "Potato",
    "Carrot",
    "Cabbage",
    "Capsicum",
    "Cauliflower",
    "Spinach",
    "Radish",
  ],
  Fruits: [
    "Apple",
    "Banana",
    "Orange",
    "Mango",
    "Grapes",
    "Watermelon",
    "Papaya",
    "Pomegranate",
    "Pineapple",
    "Kiwi",
    "Strawberry",
    "Guava",
  ],
  Grocery: [
    "Rice",
    "Wheat",
    "Sugar",
    "Salt",
    "Oil",
    "Pulses",
    "Spices",
    "Dry Fruits",
    "Flour",
    "Lentils",
    "Masalas",
    "Pasta",
  ],
  Dairy: [
    "Milk",
    "Curd",
    "Butter",
    "Cheese",
    "Paneer",
    "Ghee",
    "Ice Cream",
    "Lassi",
    "Buttermilk",
    "Cream",
    "Yogurt",
    "Khoya",
  ],
  Bakery: [
    "Bread",
    "Buns",
    "Cake",
    "Cookies",
    "Pastries",
    "Croissant",
    "Muffins",
    "Donuts",
    "Brownies",
    "Puffs",
    "Biscuits",
    "Rolls",
  ],
  Beverages: [
    "Tea",
    "Coffee",
    "Juice",
    "Soft Drinks",
    "Energy Drinks",
    "Water",
    "Milk Shakes",
    "Smoothies",
    "Cold Coffee",
    "Green Tea",
    "Lemonade",
    "Mocktails",
  ],
};

interface CategorySidebarProps {
  currentCategory?: string;
  onSubcategorySelect?: (subcategory: string | null) => void;
  selectedSubcategory?: string | null;
}

export function CategorySidebar({
  currentCategory,
  onSubcategorySelect,
  selectedSubcategory,
}: CategorySidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(
    currentCategory || ""
  );

  const subcategoryList = currentCategory
    ? subcategories[currentCategory] || []
    : [];

  const handleSubcategoryClick = (subcategory: string) => {
    if (onSubcategorySelect) {
      onSubcategorySelect(
        selectedSubcategory === subcategory ? null : subcategory
      );
    }
    // Close mobile menu after selection
    setIsMobileOpen(false);
  };

  if (!currentCategory || subcategoryList.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile Filter Button - Bottom Right */}
      <div className="md:hidden fixed bottom-6 right-6 z-30">
        <Button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-full shadow-xl p-4 hover:shadow-2xl transition-all duration-300 hover:scale-110"
        >
          <Filter className="h-6 w-6" />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:fixed md:left-0 md:top-[271px] md:w-56 md:bg-white md:border-r md:border-gray-100 md:h-[calc(100vh-271px)] md:flex-col md:z-20 md:shadow-sm">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="font-bold text-sm text-gray-900 uppercase tracking-tight flex items-center gap-2">
            {currentCategory}
            <div className="h-0.5 flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
          </h2>
        </div>

        {/* Subcategories List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {subcategoryList.map((subcategory) => (
            <button
              key={subcategory}
              onClick={() => handleSubcategoryClick(subcategory)}
              className={`w-full text-left px-3 py-2.5 text-sm rounded-lg font-medium transition-all duration-200 border ${
                selectedSubcategory === subcategory
                  ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 border-transparent hover:text-gray-900"
              }`}
            >
              {subcategory}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Sheet */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Bottom Sheet Content */}
          <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white rounded-t-3xl shadow-xl animate-in slide-in-from-bottom-5 duration-300">
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-0">
              <div className="h-1 w-12 bg-gray-300 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-900">
                  {currentCategory}
                </h2>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>
              <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded mt-2"></div>
            </div>

            {/* Subcategories Grid - Mobile */}
            <div className="px-4 py-4 max-h-[60vh] overflow-y-auto pb-20">
              <div className="grid grid-cols-2 gap-2">
                {subcategoryList.map((subcategory) => (
                  <button
                    key={subcategory}
                    onClick={() => handleSubcategoryClick(subcategory)}
                    className={`px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 border-2 ${
                      selectedSubcategory === subcategory
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600 shadow-md"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {subcategory}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
