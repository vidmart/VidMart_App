import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function FloatingCart() {
  const { itemCount, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please sign in to checkout");
      navigate("/auth");
      return;
    }
    if (itemCount === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleCheckout}
        size="lg"
        className="relative bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 shadow-lg animate-glow-pulse rounded-full px-6 py-6 h-auto"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {itemCount}
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs opacity-90">Total</span>
            <span className="text-lg font-bold">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </Button>
    </div>
  );
}
