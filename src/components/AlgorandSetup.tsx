import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Copy, ExternalLink } from "lucide-react";

export function AlgorandSetup() {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<any>({
    network: 'TestNet',
    address: 'MMQ7IVU5UPXII7D54QW5T2R7FFBXY6K3QGGGKFR6TXPBEGZ7OJJVTMKTRQ',
    mnemonic: 'squeeze gospel tornado chest theory spider color liberty glad crucial sunny among include raise atom duty math very design fan reason seed drill able rebel',
    assetId: 748499705,
    balance: 0,
    explorerUrl: 'https://testnet.explorer.perawallet.app/address/MMQ7IVU5UPXII7D54QW5T2R7FFBXY6K3QGGGKFR6TXPBEGZ7OJJVTMKTRQ',
    assetExplorerUrl: 'https://testnet.explorer.perawallet.app/asset/748499705'
  });

  const generateCredentials = async () => {
    setLoading(true);
    try {
      // Check balance for the hardcoded account
      const { data, error } = await supabase.functions.invoke('algorand-get-balance', {
        body: { userAddress: credentials.address }
      });
      
      if (error) throw error;
      
      // Update credentials with latest balance info
      setCredentials({
        ...credentials,
        balance: data.algoBalance || 0,
        assetBalance: data.assetBalance || 0,
        isOptedIn: data.isOptedIn || false
      });
      
      toast.success("Balance updated!", {
        description: `VMC Balance: ${(data.assetBalance || 0) / 100} VMC`
      });
    } catch (error: any) {
      console.error("Error fetching balance:", error);
      toast.error("Failed to fetch balance: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Algorand Testnet Setup</CardTitle>
        <CardDescription>
          Generate testnet credentials for VidMart Coin blockchain integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={generateCredentials} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {credentials ? 'Checking...' : 'Generating...'}
            </>
          ) : (
            credentials ? 'Check for Asset / Refresh' : 'Generate Testnet Credentials'
          )}
        </Button>

        {credentials && (
          <div className="space-y-4 mt-6">
            <div className="p-4 bg-secondary rounded-lg space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Network</p>
                <p className="text-sm text-muted-foreground">{credentials.network}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-background p-2 rounded flex-1 break-all">
                    {credentials.address}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(credentials.address, "Address")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(credentials.explorerUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Mnemonic (Secret Key)</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-background p-2 rounded flex-1 break-all">
                    {credentials.mnemonic}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(credentials.mnemonic, "Mnemonic")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-destructive mt-1">
                  ⚠️ Keep this secret! Never share or commit to version control.
                </p>
              </div>

              {credentials.assetId && (
                <div>
                  <p className="text-sm font-medium mb-1">VidMart Coin Asset ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-background p-2 rounded flex-1">
                      {credentials.assetId}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(credentials.assetId.toString(), "Asset ID")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(credentials.assetExplorerUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-1">Balance</p>
                <p className="text-sm text-muted-foreground">
                  {(credentials.balance / 1000000).toFixed(6)} ALGO
                </p>
              </div>

              {credentials.fundingInstructions && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                  <p className="text-sm font-medium mb-1">⚠️ Funding Required</p>
                  <p className="text-xs whitespace-pre-line">{credentials.fundingInstructions}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium mb-2">Next Steps:</p>
              <ol className="text-xs space-y-1 list-decimal list-inside">
                <li>Save the mnemonic in a secure location</li>
                <li>Add ALGORAND_MNEMONIC to your secrets</li>
                {credentials.assetId && (
                  <li>Add ALGORAND_ASSET_ID to your secrets</li>
                )}
                {credentials.fundingInstructions && (
                  <li>Fund the account and generate again to create the ASA</li>
                )}
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
