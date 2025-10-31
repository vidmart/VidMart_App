import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import algosdk from "npm:algosdk@3.5.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userAddress } = await req.json();
    
    if (!userAddress) {
      throw new Error("User address is required");
    }

    const assetId = Number(Deno.env.get('ALGORAND_ASSET_ID'));
    
    console.log("Checking balance for:", userAddress);
    console.log("Asset ID:", assetId);

    // Connect to Algorand testnet
    const algodToken = '';
    const algodServer = 'https://testnet-api.algonode.cloud';
    const algodPort = 443;
    const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

    // Get account information
    const accountInfo = await algodClient.accountInformation(userAddress).do();
    
    // Find VidMart Coin asset balance
    const assets = accountInfo.assets || [];
    const vidMartCoinAsset = assets.find((asset: any) => asset['asset-id'] === assetId);

    let balance = 0;
    let isOptedIn = false;

    if (vidMartCoinAsset) {
      isOptedIn = true;
      // Convert from base units (decimals=2) to display units
      balance = Number(vidMartCoinAsset.amount) / 100;
    }

    console.log("Balance:", balance, "VMC");
    console.log("Opted in:", isOptedIn);

    return new Response(
      JSON.stringify({
        success: true,
        address: userAddress,
        balance: balance, // VMC balance
        assetBalance: balance, // VMC balance (for backwards compatibility)
        isOptedIn: isOptedIn,
        algoBalance: Number(accountInfo.amount), // ALGO balance in microAlgos
        assetId: assetId,
        explorerUrl: `https://testnet.explorer.perawallet.app/address/${userAddress}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error("Error in algorand-get-balance:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
