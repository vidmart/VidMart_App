import { Card } from "@/components/ui/card";
import { Link, useParams } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  image: string;
  variant?: "card" | "tab";
}

const categoryConfig: Record<string, { image: string }> = {
  Vegetables: { image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80" },
  Fruits: { image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80" },
  Grocery: { image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80" },
  Dairy: { image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&q=80" },
  Bakery: { image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80" },
  Beverages: { image: "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=800&q=80" },
};

export function CategoryCard({ name, variant = "card" }: CategoryCardProps) {
  const { category } = useParams<{ category: string }>();
  const isActive = category === name;
  const config = categoryConfig[name] || { image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400" };
  
  if (variant === "tab") {
    return (
      <Link to={`/category/${name}`} className="block">
        <div className={`px-4 py-2 flex-shrink-0 rounded-md transition-colors ${
          isActive 
            ? "bg-primary text-primary-foreground font-semibold" 
            : "bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
        }`}>
          <span className="text-sm whitespace-nowrap">
            {name}
          </span>
        </div>
      </Link>
    );
  }
  
  return (
    <Link to={`/category/${name}`} className="block">
      <Card className="relative overflow-hidden h-40 w-full border shadow-md hover:shadow-lg transition-shadow">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${config.image})`,
          }}
        />
        <div className="relative h-full flex items-center justify-center p-4">
          <h3 className="text-2xl font-bold text-white text-center drop-shadow-lg">
            {name}
          </h3>
        </div>
      </Card>
    </Link>
  );
}
