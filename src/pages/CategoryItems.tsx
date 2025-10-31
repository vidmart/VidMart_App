import { useParams, useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { AppHeader } from "@/components/AppHeader";
import { CategorySidebar } from "@/components/CategorySidebar";
import { CategoryCard } from "@/components/CategoryCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Set subcategory from URL on mount
  useEffect(() => {
    const subcategoryFromUrl = searchParams.get('subcategory');
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
    const matchesSubcategory = !selectedSubcategory || product.name.toLowerCase().includes(selectedSubcategory.toLowerCase());
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubcategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Search Bar - Sticky below header */}
      <div className="sticky top-[72px] -mt-px z-40 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Horizontal Categories - Sticky */}
      <div className="sticky top-[136px] z-30 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
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
        <main className="flex-1 p-3 md:p-8 ml-24 md:ml-48">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
              {category}
            </h1>
            {category && categoryMessages[category] && (
              <p className="text-sm md:text-base text-muted-foreground animate-fade-in italic">
                {categoryMessages[category]}
              </p>
            )}
          </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found in this category.</p>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
