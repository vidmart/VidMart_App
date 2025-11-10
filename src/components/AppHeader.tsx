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
  Menu,
  X,
  LogOut,
  ChevronDown,
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
import { useState } from "react";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { items, itemCount, updateQuantity } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

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

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
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

  // Hardcoded Algorand address
  const ALGORAND_ADDRESS =
    "MMQ7IVU5UPXII7D54QW5T2R7FFBXY6K3QGGGKFR6TXPBEGZ7OJJVTMKTRQ";

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
    refetchInterval: 30000,
  });

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Main Header */}
      <div className="px-3 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex justify-between items-center gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div className="w-8 md:w-9 h-8 md:h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              ⚡
            </div>
            <span className="font-bold text-lg md:text-xl text-gray-900 hidden sm:block">
              VIDMart
            </span>
          </button>

          {/* Location (Desktop Only) */}
          {user && defaultAddress && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <MapPin className="h-4 w-4 text-green-600" />
              <div className="text-left">
                <p className="text-xs text-gray-500">Deliver in</p>
                <p className="text-sm font-semibold text-gray-900">
                  15 mins • {defaultAddress.address_line1}
                </p>
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 md:gap-3 ml-auto">
            {/* Algo Balance */}
            {user && algorandBalance && (
              <button
                onClick={() => navigate("/algorand-details")}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full font-medium text-sm transition-colors"
              >
                <Coins className="h-4 w-4" />
                <span>
                  {((algorandBalance?.algoBalance || 0) / 1000000).toFixed(2)}{" "}
                  ALGO
                </span>
              </button>
            )}

            {/* Cart Popover */}
            <Popover open={cartOpen} onOpenChange={setCartOpen}>
              <PopoverTrigger asChild>
                <button className="relative p-2 md:p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-green-600 text-xs font-bold">
                      {itemCount}
                    </Badge>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-96 p-0 max-h-96 flex flex-col"
              >
                {/* Cart Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">
                    Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </h3>
                  <button onClick={() => setCartOpen(false)}>
                    <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </button>
                </div>

                {/* Cart Items */}
                {items.length > 0 ? (
                  <>
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                ₹{Math.round(item.price)} × {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-1 py-0.5 flex-shrink-0">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="p-0.5 hover:bg-gray-100 rounded"
                              >
                                <Minus className="h-3 w-3 text-gray-600" />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="p-0.5 hover:bg-gray-100 rounded"
                              >
                                <Plus className="h-3 w-3 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Checkout Button */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <button
                        onClick={() => {
                          handleCheckout();
                          setCartOpen(false);
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition-colors"
                      >
                        Checkout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Your cart is empty</p>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* User Menu or Sign In */}
            {user ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-2 md:p-2.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
                    <User className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
                    <ChevronDown className="h-3 w-3 text-gray-700 hidden md:block" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-0">
                  <div className="space-y-2 p-4">
                    <div className="pb-3 border-b border-gray-200">
                      <p className="text-xs text-gray-600">Logged in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>

                    <button
                      onClick={() => navigate("/orders")}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center gap-2"
                    >
                      <Store className="h-4 w-4" />
                      Orders
                    </button>

                    {algorandBalance && (
                      <button
                        onClick={() => navigate("/algorand-details")}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center gap-2 md:hidden"
                      >
                        <Coins className="h-4 w-4" />
                        Wallet
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-2 border-t border-gray-200 mt-2 pt-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm font-bold rounded-lg transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-700" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-gray-50 p-4 space-y-3">
          {/* Location */}
          {user && defaultAddress && (
            <button
              onClick={() => navigate("/")}
              className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors flex items-start gap-2"
            >
              <MapPin className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Deliver in</p>
                <p className="text-sm font-semibold text-gray-900">15 mins</p>
                <p className="text-xs text-gray-600 truncate">
                  {defaultAddress.address_line1}
                </p>
              </div>
            </button>
          )}

          {/* Quick Links */}
          <button
            onClick={() => {
              navigate("/profile");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
          >
            <p className="text-sm font-medium text-gray-900">My Profile</p>
          </button>

          <button
            onClick={() => {
              navigate("/orders");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
          >
            <p className="text-sm font-medium text-gray-900">My Orders</p>
          </button>

          {user && (
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-3 bg-white rounded-lg hover:bg-red-50 transition-colors text-red-600 font-medium text-sm"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
