import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Coins, TrendingUp, TrendingDown, Gift, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function RewardSummary() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Fetch user's coin balance
  const { data: coinData } = useQuery({
    queryKey: ["userCoins", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_coins" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as any as { balance: number; id: string; user_id: string } | null;
    },
    enabled: !!user,
  });

  // Fetch transaction history
  const { data: transactions } = useQuery({
    queryKey: ["coinTransactions", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coin_transactions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as any as Array<{
        id: string;
        user_id: string;
        amount: number;
        transaction_type: 'earned' | 'spent';
        description: string;
        order_id: string | null;
        created_at: string;
      }> | null;
    },
    enabled: !!user,
  });

  const coinValue = coinData?.balance ? (coinData.balance * 0.10).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
          VIDMart Rewards
        </h1>

        {/* Coins Balance Card */}
        <Card className="border-border bg-gradient-to-br from-accent/20 to-primary/20 mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
                  <Coins className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Your Balance</p>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {coinData?.balance || 0}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">VIDMart Coins</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Worth</p>
                <p className="text-2xl font-bold text-foreground">₹{coinValue}</p>
                <p className="text-xs text-muted-foreground mt-1">1 coin = ₹0.10</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-border bg-card mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">How to use your coins?</h3>
                <p className="text-sm text-muted-foreground">
                  You can use up to 10 coins per order during checkout. Each coin is worth ₹0.10, 
                  so you can save up to ₹1.00 per order!
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/algorand-setup")}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Algorand Setup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.transaction_type === 'earned' 
                          ? 'bg-green-500/20' 
                          : 'bg-red-500/20'
                      }`}>
                        {transaction.transaction_type === 'earned' ? (
                          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.created_at), "MMM dd, yyyy 'at' hh:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={transaction.transaction_type === 'earned' ? 'default' : 'destructive'}
                        className="font-semibold"
                      >
                        {transaction.transaction_type === 'earned' ? '+' : '-'}
                        {Math.abs(transaction.amount)} coins
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        ₹{(Math.abs(transaction.amount) * 0.10).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your coin activity will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
