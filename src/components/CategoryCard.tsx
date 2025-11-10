import { Card } from "@/components/ui/card";

import { Link, useParams } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  image: string;
  variant?: "card" | "tab";
}

const categoryConfig: Record<string, { image: string }> = {
  Vegetables: {
    image:
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80",
  },
  Fruits: {
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80",
  },
  Grocery: {
    image:
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80",
  },
  Dairy: {
    image:
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&q=80",
  },
  Bakery: {
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
  },
  Beverages: {
    image:
      "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=800&q=80",
  },
};

export function CategoryCard({ name, variant = "card" }: CategoryCardProps) {
  const { category } = useParams<{ category: string }>();
  const isActive = category === name;
  const config = categoryConfig[name] || {
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
  };

  if (variant === "tab") {
    return (
      <Link to={`/category/${name}`}>
        <div className="flex flex-col items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors active:scale-95">
          <div className="w-14 h-14 rounded-full overflow-hidden shadow-sm border border-gray-200 bg-gray-100">
            <img
              src={config.image}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <span
            className={`text-xs font-medium text-center line-clamp-2 ${
              isActive ? "text-gray-900" : "text-gray-700"
            }`}
          >
            {name}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/category/${name}`}>
      <Card className="relative overflow-hidden rounded-xl hover:shadow-lg transition-all active:scale-95 aspect-square group cursor-pointer">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={config.image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

        {/* Category Name - Bottom Left */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-semibold text-sm line-clamp-2">
            {name}
          </h3>
        </div>

        {/* Shop Badge - Top Right (appears on hover) */}
        <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-semibold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Shop
        </div>
      </Card>
    </Link>
  );
}
