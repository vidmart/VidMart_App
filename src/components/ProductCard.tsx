import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { getProductImage } from "@/lib/productImages";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export function ProductCard({ id, name, description, price, image_url }: ProductCardProps) {
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find((item) => item.id === id);
  const [isAdding, setIsAdding] = useState(false);
  
  const displayImage = getProductImage(name, image_url);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart({ id, name, price, image_url });
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <Card className="overflow-hidden border-border bg-card hover:shadow-[0_0_20px_hsl(160_84%_39%_/_0.3)] transition-all duration-300">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
          }}
        />
      </div>
      <CardContent className="p-3 md:p-4">
        <h3 className="font-semibold text-sm md:text-lg mb-1 text-foreground">{name}</h3>
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>
        <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          ₹{price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-3 md:p-4 pt-0">
        {!cartItem ? (
          <Button
            onClick={handleAddToCart}
            className={`w-full text-xs md:text-sm bg-gradient-to-r from-primary to-secondary hover:opacity-90 ${isAdding ? "animate-glow-pulse" : ""}`}
            size="sm"
          >
            Add to Cart
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateQuantity(id, cartItem.quantity - 1)}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <span className="text-sm md:text-lg font-semibold text-foreground min-w-[2rem] text-center">
              {cartItem.quantity}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateQuantity(id, cartItem.quantity + 1)}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
