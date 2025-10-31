import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, Coins } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";

export default function Checkout() {
  const { items, total: cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [showSuccess, setShowSuccess] = useState(false);
  const { width, height } = useWindowSize();
  const [coinsToUse, setCoinsToUse] = useState(0);

  // Card payment details
  const [cardNumber, setCardNumber] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [cvv, setCvv] = useState("");

  // Fetch user's coin balance
  const { data: coinData } = useQuery({
    queryKey: ["userCoins", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_coins" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data as any as { balance: number; id: string; user_id: string } | null;
    },
    enabled: !!user,
  });

  // Calculate price breakdown
  const gstRate = 0.18; // 18%
  const handlingFeeRate = 0.01; // 1%
  const coinDiscount = coinsToUse * 0.10; // 1 coin = 0.10 INR
  const gstAmount = cartTotal * gstRate;
  const handlingFee = cartTotal * handlingFeeRate;
  const total = Math.max(0, cartTotal + gstAmount + handlingFee - coinDiscount);

  // Check if updating existing order
  const activeOrderId = localStorage.getItem('active_order_id');

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles" as any)
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      return data as any as { address?: string } | null;
    },
    enabled: !!user,
  });

  // Fetch default address
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

  const createOrder = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      // If using coins, deduct them and create transaction
      if (coinsToUse > 0) {
        // Update coin balance
        const newBalance = (coinData?.balance || 0) - coinsToUse;
        const { error: coinError } = await supabase
          .from("user_coins" as any)
          .update({ balance: newBalance })
          .eq("user_id", user.id);
        
        if (coinError) throw coinError;

        // Create transaction record
        const { error: txError } = await supabase
          .from("coin_transactions" as any)
          .insert({
            user_id: user.id,
            amount: -coinsToUse,
            transaction_type: 'spent',
            description: `Used ${coinsToUse} coins for order payment`,
          });
        
        if (txError) throw txError;
      }
      
      // Check if we're updating an existing order
      if (activeOrderId) {
        // First fetch the existing order
        const { data: existingOrder, error: fetchError } = await supabase
          .from("orders" as any)
          .select("*")
          .eq("id", activeOrderId)
          .maybeSingle();
        
        if (fetchError) throw fetchError;
        
        // Merge existing items with new cart items
        const existingItems = ((existingOrder as any)?.items || []) as any[];
        const mergedItems = [...existingItems];
        
        // Add or update quantities for new items
        items.forEach((newItem) => {
          const existingIndex = mergedItems.findIndex(item => item.id === newItem.id);
          if (existingIndex >= 0) {
            // Item exists, update quantity
            mergedItems[existingIndex].quantity += newItem.quantity;
          } else {
            // New item, add it
            mergedItems.push(newItem);
          }
        });
        
        // Recalculate totals based on merged items
        const mergedSubtotal = mergedItems.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0);
        const gstUpdated = mergedSubtotal * gstRate;
        const handlingUpdated = mergedSubtotal * handlingFeeRate;
        const updatedTotal = mergedSubtotal + gstUpdated + handlingUpdated;
        
        const { error } = await supabase
          .from("orders" as any)
          .update({
            items: mergedItems as any,
            total: updatedTotal,
            payment_method: paymentMethod,
            shipping_address: defaultAddress 
              ? `${defaultAddress.address_line1}, ${defaultAddress.address_line2 || ''} ${defaultAddress.landmark ? 'Near ' + defaultAddress.landmark : ''}, PIN: ${defaultAddress.pin_code}`.trim()
              : (profile?.address || "No address provided"),
          } as any)
          .eq("id", activeOrderId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("orders" as any)
          .insert({
            user_id: user.id,
            items: items as any,
            total: total,
            payment_method: paymentMethod,
            shipping_address: defaultAddress 
              ? `${defaultAddress.address_line1}, ${defaultAddress.address_line2 || ''} ${defaultAddress.landmark ? 'Near ' + defaultAddress.landmark : ''}, PIN: ${defaultAddress.pin_code}`.trim()
              : (profile?.address || "No address provided"),
          } as any);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Invalidate orders and coins queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["userCoins", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["coinTransactions", user?.id] });
      
      // Don't clean up order pause state - let timer resume
      // It will naturally expire after 1 minute total
      setShowSuccess(true);
      setTimeout(() => {
        clearCart();
        navigate("/profile?tab=orders");
      }, 2000);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to place order");
    },
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (items.length === 0 && !showSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="border-border bg-card">
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Cart is Empty</h2>
              <p className="text-muted-foreground mb-6">
                Add some items to your cart to continue shopping
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90"
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    createOrder.mutate();
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
        <Card className="border-border bg-card text-center p-8 shadow-[0_0_50px_hsl(330_100%_71%_/_0.5)] animate-glow-pulse">
          <div className="text-6xl mb-4">🎆</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            {activeOrderId ? "Order Updated!" : "Order Placed!"}
          </h2>
          <p className="text-muted-foreground">
            {activeOrderId 
              ? "Your order has been updated. Redirecting to order history..." 
              : "Thank you for your purchase! Redirecting..."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
          {activeOrderId ? "Update Order" : "Checkout"}
        </h1>
        {activeOrderId && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary rounded-md">
            <p className="text-sm text-foreground">
              You're updating an existing order. The order will be updated with new items and total.
            </p>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b border-border">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ₹{item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              
              {/* Price Breakdown */}
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cart Total</span>
                  <span className="text-foreground font-medium">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span className="text-foreground font-medium">₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Handling Fee (1%)</span>
                  <span className="text-foreground font-medium">₹{handlingFee.toFixed(2)}</span>
                </div>
                {coinsToUse > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      Coin Discount ({coinsToUse} coins)
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-medium">-₹{coinDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t-2 border-primary">
                <span className="text-xl font-bold text-foreground">Total Amount</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Shipping */}
          <div className="space-y-6">
            {/* Use Coins Card */}
            {coinData && coinData.balance > 0 && (
              <Card className="border-border bg-gradient-to-br from-primary/10 to-secondary/10">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Use VIDMart Coins
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground font-medium">Available Balance</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {coinData.balance} coins
                      </p>
                      <p className="text-xs text-muted-foreground">Worth ₹{(coinData.balance * 0.10).toFixed(2)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/rewards")}
                      className="text-primary border-primary hover:bg-primary/10"
                    >
                      View History
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coinsToUse" className="text-foreground">
                      Use coins (max 10 per order)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="coinsToUse"
                        type="number"
                        min="0"
                        max={Math.min(10, coinData.balance)}
                        value={coinsToUse}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setCoinsToUse(Math.min(Math.max(0, value), Math.min(10, coinData.balance)));
                        }}
                        className="bg-input border-border text-foreground"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setCoinsToUse(Math.min(10, coinData.balance))}
                        className="whitespace-nowrap"
                      >
                        Use Max
                      </Button>
                    </div>
                    {coinsToUse > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        You'll save ₹{(coinsToUse * 0.10).toFixed(2)} on this order!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                {defaultAddress ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{defaultAddress.address_line1}</p>
                    {defaultAddress.address_line2 && (
                      <p className="text-sm text-muted-foreground">{defaultAddress.address_line2}</p>
                    )}
                    {defaultAddress.landmark && (
                      <p className="text-sm text-muted-foreground">Near {defaultAddress.landmark}</p>
                    )}
                    <p className="text-sm text-muted-foreground">PIN: {defaultAddress.pin_code}</p>
                  </div>
                ) : (
                  <p className="text-foreground">No address set. Please add an address.</p>
                )}
                <Button
                  variant="link"
                  onClick={() => navigate("/profile?tab=addresses")}
                  className="text-primary hover:text-secondary p-0 mt-2"
                >
                  {defaultAddress ? "Change Address" : "Add Address"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="text-foreground cursor-pointer">
                      💳 Credit / Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="text-foreground cursor-pointer">
                      📱 UPI
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="text-foreground cursor-pointer">
                      💵 Cash on Delivery
                    </Label>
                  </div>
                </RadioGroup>

                {/* Card Payment Fields */}
                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-4 border-t border-border animate-fade-in">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-foreground">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameOnCard" className="text-foreground">Name on Card</Label>
                      <Input
                        id="nameOnCard"
                        placeholder="John Doe"
                        value={nameOnCard}
                        onChange={(e) => setNameOnCard(e.target.value)}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="text-foreground">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={3}
                        type="password"
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                  </div>
                )}

                {/* UPI Payment Options */}
                {paymentMethod === "upi" && (
                  <div className="pt-4 border-t border-border animate-fade-in">
                    <p className="text-sm text-muted-foreground mb-4">Select your preferred UPI app:</p>
                    <div className="flex gap-6 justify-center items-center">
                      <div className="flex flex-col items-center gap-2 p-3 hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
                        <div className="w-16 h-16 bg-[#5f259f] rounded-full flex items-center justify-center text-white font-bold text-xl">
                          Pe
                        </div>
                        <span className="text-xs font-medium text-foreground">PhonePe</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-3 hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
                        <div className="w-16 h-16 bg-[#00baf2] rounded-full flex items-center justify-center text-white font-bold text-xl">
                          Pt
                        </div>
                        <span className="text-xs font-medium text-foreground">Paytm</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-3 hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#4285f4] via-[#34a853] to-[#fbbc05] rounded-full flex items-center justify-center text-white font-bold text-xl">
                          G
                        </div>
                        <span className="text-xs font-medium text-foreground">Google Pay</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handlePlaceOrder}
              disabled={createOrder.isPending || !defaultAddress}
              className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-lg py-6"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {createOrder.isPending 
                ? "Processing..." 
                : activeOrderId 
                  ? "Update Order" 
                  : "Place Order"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
