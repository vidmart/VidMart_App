const subcategories: Record<string, string[]> = {
  Vegetables: ["Beans", "Brinjal", "Curry Leaves", "Tomato", "Onion", "Potato", "Carrot", "Cabbage", "Capsicum", "Cauliflower", "Spinach", "Radish"],
  Fruits: ["Apple", "Banana", "Orange", "Mango", "Grapes", "Watermelon", "Papaya", "Pomegranate", "Pineapple", "Kiwi", "Strawberry", "Guava"],
  Grocery: ["Rice", "Wheat", "Sugar", "Salt", "Oil", "Pulses", "Spices", "Dry Fruits", "Flour", "Lentils", "Masalas", "Pasta"],
  Dairy: ["Milk", "Curd", "Butter", "Cheese", "Paneer", "Ghee", "Ice Cream", "Lassi", "Buttermilk", "Cream", "Yogurt", "Khoya"],
  Bakery: ["Bread", "Buns", "Cake", "Cookies", "Pastries", "Croissant", "Muffins", "Donuts", "Brownies", "Puffs", "Biscuits", "Rolls"],
  Beverages: ["Tea", "Coffee", "Juice", "Soft Drinks", "Energy Drinks", "Water", "Milk Shakes", "Smoothies", "Cold Coffee", "Green Tea", "Lemonade", "Mocktails"],
};

interface CategorySidebarProps {
  currentCategory?: string;
  onSubcategorySelect?: (subcategory: string | null) => void;
  selectedSubcategory?: string | null;
}

export function CategorySidebar({ 
  currentCategory, 
  onSubcategorySelect,
  selectedSubcategory 
}: CategorySidebarProps) {
  const subcategoryList = currentCategory ? subcategories[currentCategory] || [] : [];

  const handleSubcategoryClick = (subcategory: string) => {
    if (onSubcategorySelect) {
      // Toggle selection: if clicking the same subcategory, deselect it
      onSubcategorySelect(selectedSubcategory === subcategory ? null : subcategory);
    }
  };

  if (!currentCategory || subcategoryList.length === 0) {
    return null;
  }

  return (
    <aside className="fixed left-0 top-[201px] w-24 md:w-48 bg-card border-r h-[calc(100vh-201px)] overflow-y-auto p-2 md:p-4 z-20">
      <div className="mb-4">
        <h2 className="font-bold text-xs md:text-lg text-foreground">{currentCategory}</h2>
      </div>

      <nav className="space-y-1 animate-fade-in">
          {subcategoryList.map((subcategory) => (
            <button
              key={subcategory}
              onClick={() => handleSubcategoryClick(subcategory)}
              className={`w-full text-left p-1.5 md:p-2 text-xs md:text-sm rounded-md transition-colors ${
                selectedSubcategory === subcategory
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-foreground hover:bg-accent hover:text-primary"
              }`}
            >
              {subcategory}
            </button>
          ))}
      </nav>
    </aside>
  );
}
