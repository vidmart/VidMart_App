import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import algosdk from "npm:algosdk@3.5.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mnemonic: existingMnemonic } = await req.json().catch(() => ({}));
    
    let account;
    let mnemonic: string;
    let address: string;

    if (existingMnemonic) {
      // Restore existing account from mnemonic
      console.log("Restoring account from existing mnemonic...");
      account = algosdk.mnemonicToSecretKey(existingMnemonic);
      mnemonic = existingMnemonic;
      address = String(account.addr);
      console.log("Account restored:", address);
    } else {
      // Generate a new account
      console.log("Generating new Algorand testnet credentials...");
      account = algosdk.generateAccount();
      mnemonic = algosdk.secretKeyToMnemonic(account.sk);
      address = String(account.addr);
      console.log("New account generated:", address);
    }
    
    console.log("Account generated:", address);
    console.log("Mnemonic:", mnemonic);

    // Connect to Algorand testnet
    const algodToken = '';
    const algodServer = 'https://testnet-api.algonode.cloud';
    const algodPort = 443;
    const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

    // Get suggested params
    const suggestedParams = await algodClient.getTransactionParams().do();
    console.log("Connected to testnet");

    // Check account balance
    const accountInfo = await algodClient.accountInformation(address).do();
    console.log("Account balance:", accountInfo.amount);

    let assetId = null;
    let fundingInstructions = null;

    // Check if account already has created assets
    const createdAssets = accountInfo.createdAssets || [];
    const existingVidMartCoin = createdAssets.find((asset: any) => 
      asset.params['unit-name'] === 'VMC' || asset.params.name === 'VidMart Coin'
    );

    if (existingVidMartCoin) {
      // Asset already exists
      assetId = existingVidMartCoin.index;
      console.log("Found existing VidMart Coin asset:", assetId);
    } else if (accountInfo.amount >= 1000000) {
      // Account has at least 1 ALGO, create ASA
      console.log("Creating VidMart Coin ASA...");

      const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        sender: address,
        total: 1000000000, // 1 billion coins (with 2 decimals = 10 billion display units)
        decimals: 2,
        defaultFrozen: false,
        manager: address,
        reserve: address,
        freeze: address,
        clawback: address,
        unitName: "VMC",
        assetName: "VidMart Coin",
        assetURL: "https://vidmart.app",
        suggestedParams,
      });

      const signedTxn = assetCreateTxn.signTxn(account.sk);
      const txResponse = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = txResponse.txid;
      console.log("ASA creation txn sent:", txId);

      // Wait for confirmation
      const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
      assetId = confirmedTxn.assetIndex;
      console.log("ASA created with ID:", assetId);
    } else {
      // Account needs funding
      fundingInstructions = `Account needs funding. Please:
1. Visit https://bank.testnet.algorand.network/
2. Enter address: ${address}
3. Request testnet ALGO
4. Wait a few seconds, then call this function again`;
    }

    const assetIdNumber = assetId !== null ? Number(assetId) : null;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          address: address,
          mnemonic: mnemonic,
          assetId: assetIdNumber,
          network: "testnet",
          balance: Number(accountInfo.amount),
          fundingInstructions: fundingInstructions,
          explorerUrl: `https://testnet.algoexplorer.io/address/${address}`,
          assetExplorerUrl: assetIdNumber ? `https://testnet.algoexplorer.io/asset/${assetIdNumber}` : null
        },
        message: assetIdNumber 
          ? "Algorand testnet wallet and VidMart Coin ASA created successfully!" 
          : "Algorand testnet wallet created. Fund the account to create the ASA."
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error("Error in setup-algorand-testnet:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
