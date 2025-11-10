import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  Copy,
  ExternalLink,
  Wallet,
  Lock,
  Coins,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export function AlgorandSetup() {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<any>({
    network: "TestNet",
    address: "MMQ7IVU5UPXII7D54QW5T2R7FFBXY6K3QGGGKFR6TXPBEGZ7OJJVTMKTRQ",
    mnemonic:
      "squeeze gospel tornado chest theory spider color liberty glad crucial sunny among include raise atom duty math very design fan reason seed drill able rebel",
    assetId: 748499705,
    balance: 0,
    explorerUrl:
      "https://testnet.explorer.perawallet.app/address/MMQ7IVU5UPXII7D54QW5T2R7FFBXY6K3QGGGKFR6TXPBEGZ7OJJVTMKTRQ",
    assetExplorerUrl: "https://testnet.explorer.perawallet.app/asset/748499705",
  });

  const generateCredentials = async () => {
    setLoading(true);
    try {
      // Check balance for the hardcoded account
      const { data, error } = await supabase.functions.invoke(
        "algorand-get-balance",
        {
          body: { userAddress: credentials.address },
        }
      );

      if (error) throw error;

      // Update credentials with latest balance info
      setCredentials({
        ...credentials,
        balance: data.algoBalance || 0,
        assetBalance: data.assetBalance || 0,
        isOptedIn: data.isOptedIn || false,
      });

      toast.success("Balance updated!", {
        description: `VMC Balance: ${(data.assetBalance || 0) / 100} VMC`,
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
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Header Section - Blinkit/Zepto style */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Algorand Testnet</h1>
            <p className="text-purple-100 text-base">
              VidMart Coin blockchain integration
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
            <p className="text-xs font-medium opacity-90">Network</p>
            <p className="text-lg font-bold">{credentials.network}</p>
          </div>
        </div>

        <Button
          onClick={generateCredentials}
          disabled={loading}
          className="w-full mt-6 bg-white text-purple-600 hover:bg-purple-50 font-semibold py-6 rounded-2xl text-base shadow-md transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {credentials ? "Refreshing..." : "Loading..."}
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-5 w-5" />
              {credentials ? "Refresh Balance" : "Generate Credentials"}
            </>
          )}
        </Button>
      </div>

      {credentials && (
        <>
          {/* Balance Card - Prominent display */}
          <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    ALGO Balance
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    {(credentials.balance / 1000000).toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">ALGO</p>
                </div>
                <div className="bg-green-500 rounded-full p-4">
                  <Coins className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </Card>

          {/* Wallet Address Card */}
          <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 rounded-full p-3">
                  <Wallet className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Wallet Address
                  </h3>
                  <p className="text-xs text-gray-500">Your public address</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <code className="text-xs text-gray-700 break-all font-mono leading-relaxed">
                  {credentials.address}
                </code>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() =>
                    copyToClipboard(credentials.address, "Address")
                  }
                  className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-xl py-5 font-medium"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={() => window.open(credentials.explorerUrl, "_blank")}
                  variant="outline"
                  className="flex-1 rounded-xl py-5 border-2 font-medium hover:bg-purple-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mnemonic Card - Secure style */}
          <Card className="border-0 shadow-md rounded-3xl overflow-hidden border-2 border-red-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <Lock className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Mnemonic Phrase
                  </h3>
                  <p className="text-xs text-red-600 font-medium">
                    Secret Key - Keep Secure!
                  </p>
                </div>
              </div>

              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <code className="text-xs text-gray-700 break-all font-mono leading-relaxed">
                  {credentials.mnemonic}
                </code>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-xs text-red-700 leading-relaxed">
                    Never share this phrase! Anyone with access can control your
                    wallet. Store it securely offline.
                  </p>
                </div>
              </div>

              <Button
                onClick={() =>
                  copyToClipboard(credentials.mnemonic, "Mnemonic")
                }
                className="w-full mt-4 bg-red-600 hover:bg-red-700 rounded-xl py-5 font-medium"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Mnemonic
              </Button>
            </CardContent>
          </Card>

          {/* Asset ID Card */}
          {credentials.assetId && (
            <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Coins className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      VidMart Coin Asset
                    </h3>
                    <p className="text-xs text-gray-500">
                      Asset ID on Algorand
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <code className="text-2xl font-bold text-blue-900">
                    {credentials.assetId}
                  </code>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() =>
                      copyToClipboard(
                        credentials.assetId.toString(),
                        "Asset ID"
                      )
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl py-5 font-medium"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={() =>
                      window.open(credentials.assetExplorerUrl, "_blank")
                    }
                    variant="outline"
                    className="flex-1 rounded-xl py-5 border-2 font-medium hover:bg-blue-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Funding Warning */}
          {credentials.fundingInstructions && (
            <Card className="border-0 shadow-md rounded-3xl overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">
                      Funding Required
                    </h3>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                      {credentials.fundingInstructions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps Card */}
          <Card className="border-0 shadow-md rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 text-xl mb-4">
                🚀 Next Steps
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    1
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Save the mnemonic in a secure location (password manager or
                    offline storage)
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    2
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Add ALGORAND_MNEMONIC to your secrets in the environment
                    configuration
                  </p>
                </div>
                {credentials.assetId && (
                  <div className="flex gap-3 items-start">
                    <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      3
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Add ALGORAND_ASSET_ID ({credentials.assetId}) to your
                      secrets
                    </p>
                  </div>
                )}
                {credentials.fundingInstructions && (
                  <div className="flex gap-3 items-start">
                    <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      4
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Fund the account and click refresh to create the ASA
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
