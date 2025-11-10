import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Heart, Bell, Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { getProductImage } from "@/lib/productImages";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  originalPrice?: number;
  isSoldOut?: boolean;
  rating?: number;
  reviews?: number;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  image_url,
  originalPrice,
  isSoldOut = false,
  rating = 4.7,
  reviews = 1000,
}: ProductCardProps) {
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find((item) => item.id === id);
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showNotify, setShowNotify] = useState(false);

  const displayImage = getProductImage(name, image_url);
  const originalPriceCalc = originalPrice || price * 1.2;
  const discount = Math.round(
    ((originalPriceCalc - price) / originalPriceCalc) * 100
  );
  const savings = Math.round(originalPriceCalc - price);

  const handleAddToCart = () => {
    if (isSoldOut) {
      toast.error("This product is currently sold out");
      return;
    }
    setIsAdding(true);
    addToCart({ id, name, price, image_url });
    setTimeout(() => setIsAdding(false), 300);
  };

  const handleNotify = () => {
    setShowNotify(!showNotify);
    if (!showNotify) {
      toast.success("We'll notify you when this is back in stock!");
    }
  };

  return (
    <Card
      className={`overflow-hidden border-0 rounded-3xl group flex flex-col h-full transition-all duration-300 shadow-sm hover:shadow-2xl hover:scale-105 ${
        isSoldOut ? "opacity-60 hover:scale-100" : ""
      }`}
    >
      {/* Image Container with Premium Design */}
      <div className="relative bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 overflow-hidden aspect-square flex-shrink-0 flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400" />
        </div>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-md">
            <div className="text-center">
              <span className="text-white font-bold text-base">
                Out of Stock
              </span>
              <p className="text-white/80 text-xs mt-1">Come back soon</p>
            </div>
          </div>
        )}

        {/* Main Product Image */}
        <img
          src={displayImage}
          alt={name}
          className={`w-full h-full object-contain p-4 transition-all duration-500 ${
            !isSoldOut && "group-hover:scale-125"
          }`}
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1546069901e+09-ba9599a7e63c?w=400&q=80";
          }}
        />

        {/* Premium Discount Badge */}
        {!isSoldOut && discount > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white rounded-2xl px-2.5 py-1.5 shadow-lg hover:shadow-xl transform group-hover:scale-110 transition-all duration-300">
              <div className="font-black text-xs leading-none">₹{savings}</div>
              <div className="font-black text-xs leading-none mt-0.5">
                {discount}% OFF
              </div>
            </div>
          </div>
        )}

        {/* Sold Out Badge */}
        {isSoldOut && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-lg z-10">
            Out of Stock
          </div>
        )}

        {/* Premium Favorite Button */}
        {!isSoldOut && (
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-3 right-3 bg-white/95 backdrop-blur-md rounded-full p-2.5 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-125 z-10 hover:bg-red-50"
          >
            <Heart
              className={`h-6 w-6 transition-all duration-300 ${
                isFavorite
                  ? "fill-red-500 text-red-500 scale-125"
                  : "text-gray-300 hover:text-gray-400"
              }`}
            />
          </button>
        )}

        {/* Notify Button */}
        {isSoldOut && (
          <button
            onClick={handleNotify}
            className="absolute top-3 right-3 z-10"
          >
            <div
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-2xl text-xs font-bold transition-all shadow-lg ${
                showNotify
                  ? "bg-red-500 text-white"
                  : "bg-white/95 backdrop-blur-md text-red-500 border-2 border-red-500 hover:bg-red-50"
              }`}
            >
              <Bell className="h-3.5 w-3.5" />
              Notify
            </div>
          </button>
        )}
      </div>

      {/* Premium Content Section */}
      <div className="px-3.5 py-3 flex-grow flex flex-col bg-white">
        {/* Title - Premium Typography */}
        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug mb-0.5 tracking-tight">
          {name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-1 mb-2 font-medium">
          {description}
        </p>

        {/* Premium Rating */}
        {!isSoldOut && (
          <div className="flex items-center gap-1.5 text-xs mb-2.5 bg-gradient-to-r from-yellow-50 to-orange-50 px-2 py-1 rounded-lg w-fit">
            <div className="flex items-center gap-0.5">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-gray-900 font-bold">{rating}</span>
            </div>
            <span className="text-gray-500 font-medium">
              ({reviews > 999 ? (reviews / 1000).toFixed(1) + "k" : reviews})
            </span>
          </div>
        )}

        {/* Premium Price Section */}
        <div className="mt-auto mb-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg text-gray-900 tracking-tight">
              ₹{Math.round(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-gray-400 line-through font-semibold">
                ₹{Math.round(originalPrice)}
              </span>
            )}
          </div>
          {savings > 0 && (
            <p className="text-xs text-green-600 font-semibold mt-1">
              Save ₹{savings}
            </p>
          )}
        </div>
      </div>

      {/* Premium Action Button Section */}
      <div className="px-3.5 pb-3 pt-0 flex-shrink-0">
        {isSoldOut ? (
          <Button
            onClick={handleNotify}
            className="w-full text-xs bg-white text-red-600 border-2 border-red-600 hover:bg-red-50 font-bold h-9 rounded-2xl transition-all shadow-md hover:shadow-lg"
          >
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Notify When Back
          </Button>
        ) : !cartItem ? (
          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-full text-xs bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white border-0 font-bold h-9 rounded-2xl transition-all shadow-md hover:shadow-xl ${
              isAdding ? "scale-95 opacity-90" : "scale-100 opacity-100"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Add to Cart
          </Button>
        ) : (
          <div className="flex items-center justify-between gap-1.5 bg-gradient-to-r from-red-50 to-red-100 px-2 py-1 rounded-2xl border-2 border-red-200 shadow-sm">
            <Button
              size="sm"
              onClick={() => {
                if (cartItem.quantity <= 1) {
                  updateQuantity(id, 0);
                } else {
                  updateQuantity(id, cartItem.quantity - 1);
                }
              }}
              className="border-2 border-red-600 bg-white text-red-600 hover:bg-red-100 h-7 w-7 p-0 rounded-lg transition-all flex items-center justify-center flex-shrink-0 font-bold shadow-sm hover:shadow-md"
              variant="outline"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-xs font-black text-gray-900 min-w-[1.75rem] text-center">
              {cartItem.quantity}
            </span>
            <Button
              size="sm"
              onClick={() => updateQuantity(id, cartItem.quantity + 1)}
              className="border-2 border-red-600 bg-white text-red-600 hover:bg-red-100 h-7 w-7 p-0 rounded-lg transition-all flex items-center justify-center flex-shrink-0 font-bold shadow-sm hover:shadow-md"
              variant="outline"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
