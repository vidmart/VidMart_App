import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  User,
  MapPin,
  ShoppingCart,
  Plus,
  Minus,
  Store,
  Coins,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { items, itemCount, updateQuantity } = useCart();

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

  const { data: defaultAddress } = useQuery({
    queryKey: ["defaultAddress", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("addresses" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .maybeSingle();
      return data as any;
    },
    enabled: !!user,
  });

  // Hardcoded Algorand address for now
  const ALGORAND_ADDRESS =
    "MMQ7IVU5UPXII7D54QW5T2R7FFBXY6K3QGGGKFR6TXPBEGZ7OJJVTMKTRQ";

  // Fetch Algorand balance
  const { data: algorandBalance } = useQuery({
    queryKey: ["algorandBalance", ALGORAND_ADDRESS],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "algorand-get-balance",
        {
          body: { userAddress: ALGORAND_ADDRESS },
        }
      );
      if (error) throw error;
      return data as {
        balance: number;
        algoBalance: number;
        isOptedIn: boolean;
        explorerUrl: string;
        assetId: number;
      };
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-accent to-accent/90 backdrop-blur-lg border-b border-accent/20 shadow-md">
      <div className="w-full px-4 py-5">
        <div className="flex justify-between items-center">
          {/* Left side - Logo and Address */}
          <div className="flex-1 flex items-center gap-3">
            {/* VIDMart Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Store className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-accent-foreground hidden sm:block">
                VIDMart
              </span>
            </button>

            {/* Address */}
            {user && defaultAddress ? (
              <div className="flex flex-col ml-2">
                <span className="text-xs text-accent-foreground/80 font-semibold">
                  Deliver in 15 mins
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4 text-accent-foreground" />
                  <span className="text-sm text-accent-foreground font-medium truncate max-w-[200px]">
                    {defaultAddress.address_line1}, {defaultAddress.pin_code}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Right side - Coins, Cart and Auth buttons */}
          <div className="flex gap-2 items-center">
            {/* Coins Display (only when logged in) */}
            {user && algorandBalance && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/algorand-details")}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-md hover:shadow-lg transition-all"
              >
                <Coins className="h-5 w-5 text-white" />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold leading-none text-white">
                    {((algorandBalance?.algoBalance || 0) / 1000000).toFixed(4)}
                  </span>
                  <span className="text-[10px] text-blue-100 leading-none font-medium">
                    ALGO
                  </span>
                </div>
              </Button>
            )}

            {/* Cart Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-accent-foreground hover:bg-accent-foreground/10"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex flex-col max-h-[400px]">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Cart Items ({itemCount})</h3>
                  </div>
                  {items.length > 0 ? (
                    <>
                      <ScrollArea className="flex-1 max-h-[280px]">
                        <div className="p-4 space-y-3">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-3 items-center"
                            >
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-1">
                                  {item.name}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium w-8 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="p-4 border-t">
                        <Button onClick={handleCheckout} className="w-full">
                          Checkout
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      Your cart is empty
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
                className="text-accent-foreground hover:bg-accent-foreground/10"
              >
                <User className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                variant="ghost"
                className="text-accent-foreground hover:bg-accent-foreground/10"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
