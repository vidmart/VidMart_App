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
    
    console.log("Opt-in request for user:", userAddress);
    console.log("Asset ID:", assetId);

    // Connect to Algorand testnet
    const algodToken = '';
    const algodServer = 'https://testnet-api.algonode.cloud';
    const algodPort = 443;
    const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

    // Check if user is already opted in
    const accountInfo = await algodClient.accountInformation(userAddress).do();
    const assets = accountInfo.assets || [];
    const isOptedIn = assets.some((asset: any) => asset['asset-id'] === assetId);

    if (isOptedIn) {
      console.log("User already opted in to asset");
      return new Response(
        JSON.stringify({
          success: true,
          alreadyOptedIn: true,
          message: "User is already opted in to VidMart Coin"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get suggested params for transaction
    const suggestedParams = await algodClient.getTransactionParams().do();

    // Create opt-in transaction (asset transfer of 0 to self)
    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: userAddress,
      receiver: userAddress,
      assetIndex: assetId,
      amount: 0,
      suggestedParams,
    });

    // Convert transaction to base64 for user to sign
    const txnBytes = optInTxn.toByte();
    const txnBase64 = btoa(String.fromCharCode(...txnBytes));

    return new Response(
      JSON.stringify({
        success: true,
        transaction: txnBase64,
        message: "Transaction ready for signing. User needs to sign and submit this transaction."
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error("Error in algorand-opt-in:", error);
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
