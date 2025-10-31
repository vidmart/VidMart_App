import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coins, TrendingUp, TrendingDown, ArrowLeft, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function AlgorandDetails() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hardcoded Algorand address for now
  const ALGORAND_ADDRESS = "MMQ7IVU5UPXII7D54QW5T2R7FFBXY6K3QGGGKFR6TXPBEGZ7OJJVTMKTRQ";

  // Fetch Algorand balance
  const { data: algorandBalance, isLoading } = useQuery({
    queryKey: ["algorandBalance", ALGORAND_ADDRESS],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("algorand-get-balance", {
        body: { userAddress: ALGORAND_ADDRESS },
      });
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

  // Fetch transaction history
  const { data: transactions } = useQuery({
    queryKey: ["coinTransactions", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("coin_transactions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
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

  if (!user) {
    return (
      <>
        <AppHeader />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>Please sign in to view your Algorand details</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/auth")} className="w-full">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Algorand Coin Details</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-6 w-6 text-yellow-600" />
                  Account Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <p className="text-muted-foreground">Loading balance...</p>
                ) : algorandBalance ? (
                  <>
                    {/* ALGO Balance */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-muted-foreground mb-1">ALGO Balance</p>
                      <p className="text-3xl font-bold">{(algorandBalance.algoBalance / 1000000).toFixed(4)} ALGO</p>
                    </div>

                    {/* VMC Balance */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-muted-foreground mb-1">VidMart Coin Balance</p>
                      <p className="text-3xl font-bold">{algorandBalance.balance.toFixed(2)} VMC</p>
                      <div className="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs text-muted-foreground mb-1">Asset ID</p>
                        <p className="text-sm font-medium">{algorandBalance.assetId}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <Badge variant={algorandBalance.isOptedIn ? "default" : "secondary"}>
                          {algorandBalance.isOptedIn ? "Opted In" : "Not Opted In"}
                        </Badge>
                      </div>
                    </div>

                    {/* Wallet Address */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 rounded bg-muted text-xs break-all">
                          {ALGORAND_ADDRESS}
                        </code>
                      </div>
                    </div>

                    {/* Explorer Link */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(algorandBalance.explorerUrl, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Algorand Explorer
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">Failed to load balance</p>
                )}
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your VMC earnings and spending</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {transactions && transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-start justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
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
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {format(new Date(transaction.created_at), "MMM dd, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={transaction.transaction_type === 'earned' ? 'default' : 'destructive'}
                          >
                            {transaction.transaction_type === 'earned' ? '+' : '-'}
                            {Math.abs(transaction.amount)} VMC
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No transactions yet</p>
                      <p className="text-sm text-muted-foreground">
                        Your transaction history will appear here once you start earning or spending VMC
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Setup Link */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Algorand Testnet Setup</h3>
                  <p className="text-sm text-muted-foreground">
                    View your testnet credentials and check asset status
                  </p>
                </div>
                <Button onClick={() => navigate("/algorand-setup")}>
                  Go to Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
