import { useParams, useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { AppHeader } from "@/components/AppHeader";
import { CategorySidebar } from "@/components/CategorySidebar";
import { CategoryCard } from "@/components/CategoryCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

const categories = [
  "Vegetables",
  "Fruits",
  "Grocery",
  "Dairy",
  "Bakery",
  "Beverages",
];

const categoryMessages: Record<string, string> = {
  Vegetables: "Fresh Vegetables from farm direct at your doorstep",
  Fruits: "Fresh & Juicy Fruits picked just for you",
  Grocery: "Your daily essentials delivered with care",
  Dairy: "Farm-fresh Dairy products to brighten your day",
  Bakery: "Freshly baked goodies straight from the oven",
  Beverages: "Refreshing drinks to quench your thirst",
};

export default function CategoryItems() {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Set subcategory from URL on mount
  useEffect(() => {
    const subcategoryFromUrl = searchParams.get("subcategory");
    if (subcategoryFromUrl) {
      setSelectedSubcategory(subcategoryFromUrl);
    }
  }, [searchParams]);

  // Reset subcategory and search when category changes
  useEffect(() => {
    setSelectedSubcategory(null);
    setSearchQuery("");
  }, [category]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products" as any)
        .select("*")
        .eq("category", category);

      if (error) throw error;
      return data as any;
    },
  });

  // Filter products based on subcategory and search
  const filteredProducts = products?.filter((product) => {
    const matchesSubcategory =
      !selectedSubcategory ||
      product.name.toLowerCase().includes(selectedSubcategory.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubcategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      {/* Search Bar - Sticky below header */}
      <div className="sticky top-[72px] -mt-px z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-9 py-2 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Categories - Sticky */}
      <div className="sticky top-[120px] z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <CategoryCard key={cat} name={cat} image="" variant="tab" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex relative">
        <CategorySidebar
          currentCategory={category || ""}
          onSubcategorySelect={setSelectedSubcategory}
          selectedSubcategory={selectedSubcategory}
        />

        {/* Main Content - Scrollable with left margin for fixed sidebar */}
        <main className="flex-1 p-3 md:p-6 ml-0 md:ml-56">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {category}
                </h1>
                {category && categoryMessages[category] && (
                  <p className="text-xs md:text-sm text-gray-600 mt-2">
                    {categoryMessages[category]}
                  </p>
                )}
              </div>
              <div className="hidden md:flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                <span className="text-xs font-semibold text-green-700">
                  {filteredProducts?.length || 0}
                </span>
                <span className="text-xs text-green-600">Products</span>
              </div>
            </div>

            {/* Active Filters Display */}
            {selectedSubcategory && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600">Filtered by:</span>
                <div className="inline-flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                  <span className="text-sm font-medium text-green-700">
                    {selectedSubcategory}
                  </span>
                  <button
                    onClick={() => setSelectedSubcategory(null)}
                    className="ml-1 text-green-600 hover:text-green-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600" />
              <p className="text-gray-500 text-sm">Loading products...</p>
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div>
              {/* Product Count - Mobile */}
              <div className="md:hidden mb-4 text-xs text-gray-600">
                Showing {filteredProducts.length} products
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description || ""}
                    price={Number(product.price)}
                    image_url={product.image_url || ""}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">
                No products found
              </p>
              <p className="text-gray-500 text-sm">
                {searchQuery
                  ? "Try a different search term"
                  : "No products available in this category"}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
