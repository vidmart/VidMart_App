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
    const { recipientAddress, amount, note } = await req.json();
    
    if (!recipientAddress || !amount) {
      throw new Error("Recipient address and amount are required");
    }

    const mnemonic = Deno.env.get('ALGORAND_MNEMONIC');
    const assetId = Number(Deno.env.get('ALGORAND_ASSET_ID'));
    
    if (!mnemonic) {
      throw new Error("ALGORAND_MNEMONIC not configured");
    }

    console.log("Sending", amount, "VMC to", recipientAddress);
    console.log("Asset ID:", assetId);

    // Restore account from mnemonic
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    
    // Connect to Algorand testnet
    const algodToken = '';
    const algodServer = 'https://testnet-api.algonode.cloud';
    const algodPort = 443;
    const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

    // Check if recipient is opted in to the asset
    const accountInfo = await algodClient.accountInformation(recipientAddress).do();
    const assets = accountInfo.assets || [];
    const isOptedIn = assets.some((asset: any) => asset['asset-id'] === assetId);

    if (!isOptedIn) {
      throw new Error("Recipient must opt-in to VidMart Coin asset first");
    }

    // Get suggested params
    const suggestedParams = await algodClient.getTransactionParams().do();

    // Create asset transfer transaction
    // Amount needs to be in base units (with decimals=2, multiply by 100)
    const amountInBaseUnits = Math.floor(amount * 100);
    
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: account.addr,
      receiver: recipientAddress,
      assetIndex: assetId,
      amount: amountInBaseUnits,
      note: note ? new TextEncoder().encode(note) : undefined,
      suggestedParams,
    });

    // Sign transaction
    const signedTxn = txn.signTxn(account.sk);
    
    // Send transaction
    const txResponse = await algodClient.sendRawTransaction(signedTxn).do();
    const txId = txResponse.txid;
    console.log("Transaction sent:", txId);

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
    console.log("Transaction confirmed in round:", confirmedTxn.confirmedRound);

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: txId,
        confirmedRound: confirmedTxn.confirmedRound,
        amount: amount,
        recipient: recipientAddress,
        explorerUrl: `https://testnet.algoexplorer.io/tx/${txId}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error("Error in algorand-reward-coins:", error);
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
