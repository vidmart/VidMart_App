import { AppHeader } from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const navigate = useNavigate();

  // Fetch all products for search
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products" as any).select("*").order("name");
      return (data as any) || [];
    },
  });

  // Filter products based on search query
  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Trust Badges with Animation - Sticky below header */}
      <div className="sticky top-[72px] -mt-2 z-40 bg-gradient-to-r from-secondary to-primary py-4 overflow-hidden shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-8 flex-wrap text-secondary-foreground animate-fade-in">
            <div className="flex items-center gap-2 hover:scale-110 transition-transform duration-300 cursor-pointer">
              <span className="text-lg animate-bounce">🚚</span>
              <span className="text-sm font-semibold">Free Delivery</span>
            </div>
            <div className="flex items-center gap-2 hover:scale-110 transition-transform duration-300 cursor-pointer">
              <span className="text-lg animate-pulse">✓</span>
              <span className="text-sm font-semibold">Quality Guarantee</span>
            </div>
            <div className="flex items-center gap-2 hover:scale-110 transition-transform duration-300 cursor-pointer">
              <span className="text-lg animate-bounce">💳</span>
              <span className="text-sm font-semibold">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar - Sticky below trust badges */}
      <div className="sticky top-[136px] -mt-px z-30 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            Shop by Category
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Browse our wide selection of products
          </p>
        </div>

        {/* Search Results or Categories with Subcategories */}
        {searchQuery.trim() ? (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-foreground">Search Results ({filteredProducts.length})</h2>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
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
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12 animate-fade-in">
            {categories.map((category) => (
              <div key={category} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">{category}</h2>
                  <Link 
                    to={`/category/${category}`}
                    className="flex items-center gap-1 text-primary hover:text-secondary font-semibold text-sm md:text-base transition-colors"
                  >
                    See all
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Subcategories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {subcategories[category].map((subcategory) => (
                    <Link
                      key={subcategory}
                      to={`/category/${category}?subcategory=${encodeURIComponent(subcategory)}`}
                      className="group"
                    >
                      <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:border-primary">
                        {/* Subcategory Image */}
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={getSubcategoryImage(subcategory)}
                            alt={subcategory}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        {/* Subcategory Name */}
                        <div className="p-3 bg-card">
                          <p className="text-xs md:text-sm font-medium text-foreground text-center group-hover:text-primary transition-colors">
                            {subcategory}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
