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
    <>
      {/* Desktop & Tablet - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 hidden md:block">
        <Button
          onClick={handleCheckout}
          size="lg"
          className="relative bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-6 py-6 h-auto"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-white text-green-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {itemCount}
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium opacity-90">Total</span>
              <span className="text-lg font-bold">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </Button>
      </div>

      {/* Mobile - Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative bg-green-50 p-2 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {itemCount}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium">Cart Total</p>
              <p className="text-lg font-bold text-gray-900">
                ₹{total.toFixed(2)}
              </p>
            </div>
          </div>
          <Button
            onClick={handleCheckout}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 h-10 rounded-lg transition-colors flex-shrink-0"
          >
            <span className="hidden sm:inline">Checkout</span>
            <span className="sm:hidden">Pay</span>
          </Button>
        </div>
      </div>

      {/* Add bottom padding on mobile to prevent content from hiding under the floating cart */}
      <div className="md:hidden h-20" />
    </>
  );
}
