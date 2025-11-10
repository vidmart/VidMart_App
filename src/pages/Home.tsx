import { AppHeader } from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, ChevronLeft, MapPin } from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { getSubcategoryImage } from "@/lib/subcategoryImages";

const subcategories: Record<string, string[]> = {
  Vegetables: ["Beans", "Brinjal", "Curry Leaves", "Tomato"],
  Fruits: ["Apple", "Banana", "Orange", "Mango"],
  Grocery: ["Rice", "Wheat", "Sugar", "Salt"],
  Dairy: ["Milk", "Curd", "Butter", "Cheese"],
  Bakery: ["Bread", "Buns", "Cake", "Cookies"],
  Beverages: ["Tea", "Coffee", "Juice", "Soft Drinks"],
};

const categories = Object.keys(subcategories);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categorySectionScroll, setCategorySectionScroll] = useState<{
    [key: string]: number;
  }>({});
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products" as any)
        .select("*")
        .order("name");
      return (data as any) || [];
    },
  });

  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const scrollSection = (sectionId: string, direction: "left" | "right") => {
    const ref = scrollRefs.current[sectionId];
    if (ref) {
      const scrollAmount = 250;
      const currentPos = categorySectionScroll[sectionId] || 0;
      const newPos =
        direction === "left"
          ? Math.max(0, currentPos - scrollAmount)
          : currentPos + scrollAmount;
      ref.scrollLeft = newPos;
      setCategorySectionScroll({
        ...categorySectionScroll,
        [sectionId]: newPos,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      {/* Sticky Search Section */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-3 md:px-8 py-3">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Location */}
            <button className="hidden md:flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold text-sm whitespace-nowrap py-2 px-3 hover:bg-gray-100 rounded">
              <MapPin className="h-4 w-4" />
              <span>Select Location</span>
            </button>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 transition-all text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-3 md:px-8 py-6 md:py-8">
        {/* Search Results */}
        {searchQuery.trim() ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Search Results
              </h2>
              <p className="text-sm text-gray-600">
                Found {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description || ""}
                    price={product.price}
                    image_url={product.image_url || ""}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-600">No products found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-600 rounded-2xl overflow-hidden text-white p-6 md:p-8 relative">
              <div className="grid md:grid-cols-2 gap-6 items-center relative z-10">
                <div>
                  <span className="text-sm font-bold bg-white/20 px-4 py-2 rounded-full inline-block mb-4">
                    ⚡ 10 Minutes Delivery
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    Fresh Groceries at Your Doorstep
                  </h1>
                  <p className="text-green-50 mb-6">
                    Get fresh produce, dairy, and essentials delivered in just
                    10 minutes
                  </p>
                  <Link
                    to="/category/Vegetables"
                    className="inline-block bg-white text-green-600 font-bold px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Shop Now →
                  </Link>
                </div>
                <div className="hidden md:block text-right">
                  <div className="text-6xl">🥬</div>
                </div>
              </div>
            </div>

            {/* Categories Section */}
            {categories.map((category) => (
              <div key={category} className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    {category}
                  </h2>
                  <Link
                    to={`/category/${category}`}
                    className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1"
                  >
                    See all
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Horizontal Scroll Section */}
                <div className="relative">
                  {/* Left Arrow */}
                  {categorySectionScroll[category] > 0 && (
                    <button
                      onClick={() => scrollSection(category, "left")}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-gray-50 via-gray-50 to-transparent w-12 h-full flex items-center justify-start pl-2 hover:bg-gray-100"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                  )}

                  {/* Scroll Container */}
                  <div
                    ref={(el) => {
                      scrollRefs.current[category] = el;
                    }}
                    className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
                  >
                    {subcategories[category].map((subcategory) => (
                      <Link
                        key={subcategory}
                        to={`/category/${category}?subcategory=${encodeURIComponent(
                          subcategory
                        )}`}
                        className="group flex-shrink-0"
                      >
                        <div className="w-28 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-200 hover:border-green-300 transition-all">
                          {/* Image */}
                          <div className="aspect-square bg-gray-100 overflow-hidden">
                            <img
                              src={getSubcategoryImage(subcategory)}
                              alt={subcategory}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>

                          {/* Name */}
                          <div className="p-2 text-center">
                            <p className="text-xs font-semibold text-gray-900 line-clamp-2">
                              {subcategory}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Right Arrow */}
                  <button
                    onClick={() => scrollSection(category, "right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-gray-50 via-gray-50 to-transparent w-12 h-full flex items-center justify-end pr-2 hover:bg-gray-100"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>
            ))}

            {/* Products Grid Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  ⭐ Best Sellers
                </h2>
                <Link
                  to="/"
                  className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1"
                >
                  See all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {products.slice(0, 18).map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description || ""}
                    price={product.price}
                    image_url={product.image_url || ""}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom spacing for floating cart */}
      <div className="h-24 md:h-0" />
    </div>
  );
}
