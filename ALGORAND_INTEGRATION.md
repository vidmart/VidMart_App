# VidMart Algorand Blockchain Integration Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Configuration](#setup--configuration)
4. [Files Created/Modified](#files-createdmodified)
5. [Edge Functions API Reference](#edge-functions-api-reference)
6. [User Guide](#user-guide)
7. [Developer Guide](#developer-guide)
8. [Testing Guide](#testing-guide)
9. [Troubleshooting](#troubleshooting)

---

## Overview

VidMart integrates with the Algorand blockchain to enable cryptocurrency rewards through the **VidMart Coin (VMC)** - a custom Algorand Standard Asset (ASA). This integration allows users to:

- Receive blockchain-based reward coins for purchases
- Track their VidMart Coin balance on the Algorand blockchain
- Opt-in to receive VMC tokens
- View transaction history on Algorand explorer

### Technology Stack

- **Blockchain**: Algorand Testnet
- **Token Standard**: Algorand Standard Asset (ASA)
- **SDK**: algosdk v3.5.2
- **Backend**: Supabase Edge Functions (Deno)
- **Frontend**: React + TypeScript

---

## Architecture

### Components Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     VidMart Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐          ┌──────────────────────────┐    │
│  │   Frontend   │          │    Edge Functions         │    │
│  │              │          │                           │    │
│  │ - Setup UI   │◄────────►│ - setup-algorand-testnet │    │
│  │ - Opt-in UI  │          │ - algorand-opt-in        │    │
│  │ - Balance UI │          │ - algorand-reward-coins  │    │
│  │              │          │ - algorand-get-balance   │    │
│  └──────────────┘          └────────────┬─────────────┘    │
│                                          │                   │
└──────────────────────────────────────────┼──────────────────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │   Algorand Testnet     │
                              │                        │
                              │ - Wallet Management    │
                              │ - ASA Token (VMC)      │
                              │ - Transaction History  │
                              └────────────────────────┘
```

### Token Details

- **Asset Name**: VidMart Coin
- **Unit Name**: VMC
- **Total Supply**: 10,000,000,000 VMC (1 billion with 2 decimals)
- **Decimals**: 2
- **Asset ID**: 748499705 (Testnet)
- **Master Wallet**: MMQ7IVU5UPXII7D54QW5T2R7FFBXY6K3QGGGKFR6TXPBEGZ7OJJVTMKTRQ

---

## Setup & Configuration

### Prerequisites

1. Algorand testnet account with ALGO balance
2. VidMart Coin (VMC) ASA created on testnet
3. Supabase project with Edge Functions enabled

### Environment Secrets

The following secrets must be configured in Supabase:

| Secret Name         | Description                               | Example                     |
| ------------------- | ----------------------------------------- | --------------------------- |
| `ALGORAND_MNEMONIC` | 25-word recovery phrase for master wallet | "squeeze gospel tornado..." |
| `ALGORAND_ASSET_ID` | VMC asset ID on Algorand                  | "748499705"                 |

**Setting Secrets:**

```bash
# These are automatically set through the UI
# Located in: Supabase Dashboard → Edge Functions → Secrets
```

---

## Files Created/Modified

### 1. Edge Functions

#### `/supabase/functions/setup-algorand-testnet/index.ts`

**Purpose**: Generate or restore Algorand wallet and create VMC asset

**Key Features**:

- Generate new Algorand wallet OR restore from existing mnemonic
- Check if VMC asset already exists
- Create VMC asset if wallet has sufficient ALGO balance
- Return funding instructions if wallet needs ALGO

**Request Body**:

```typescript
{
  mnemonic?: string  // Optional: existing 25-word mnemonic
}
```

**Response**:

```typescript
{
  success: boolean;
  data: {
    address: string; // Algorand wallet address
    mnemonic: string; // 25-word recovery phrase
    assetId: number | null; // VMC asset ID (null if not created)
    network: string; // "testnet"
    balance: number; // ALGO balance in microAlgos
    fundingInstructions: string | null;
    explorerUrl: string; // Link to view wallet on explorer
    assetExplorerUrl: string | null;
  }
  message: string;
}
```

**Technical Details**:

- Connects to: `https://testnet-api.algonode.cloud`
- Minimum ALGO required: 1 ALGO (1,000,000 microAlgos)
- ASA creation cost: ~0.001 ALGO
- Checks for existing VMC asset by unit name ("VMC") or full name ("VidMart Coin")

---

#### `/supabase/functions/algorand-opt-in/index.ts`

**Purpose**: Generate opt-in transaction for users to receive VMC

**Key Features**:

- Check if user already opted in
- Generate unsigned opt-in transaction
- Return base64-encoded transaction for client-side signing

**Request Body**:

```typescript
{
  userAddress: string; // User's Algorand wallet address
}
```

**Response**:

```typescript
{
  success: boolean
  transaction?: string        // Base64 encoded transaction (if not opted in)
  alreadyOptedIn?: boolean   // True if already opted in
  message: string
}
```

**Algorand Opt-in Process**:

1. User must have an Algorand wallet
2. User must sign an asset transfer transaction of 0 VMC to themselves
3. This enables their account to receive the VMC asset
4. Opt-in costs minimal ALGO for transaction fee (~0.001 ALGO)

---

#### `/supabase/functions/algorand-reward-coins/index.ts`

**Purpose**: Transfer VMC tokens from master wallet to user wallet

**Key Features**:

- Validate recipient is opted in to VMC
- Transfer specified amount of VMC
- Include optional transaction note
- Wait for blockchain confirmation

**Request Body**:

```typescript
{
  recipientAddress: string  // User's Algorand wallet address
  amount: number           // Amount in VMC (not base units)
  note?: string           // Optional transaction memo
}
```

**Response**:

```typescript
{
  success: boolean
  transactionId?: string      // Algorand transaction ID
  confirmedRound?: number    // Block number where confirmed
  amount?: number            // Amount sent
  recipient?: string         // Recipient address
  explorerUrl?: string       // Link to view transaction
  error?: string             // Error message if failed
}
```

**Technical Details**:

- VMC has 2 decimals: 1 VMC = 100 base units
- Amount conversion: `baseUnits = amount * 100`
- Master wallet signs transaction using stored mnemonic
- Waits up to 4 rounds (~4 seconds) for confirmation
- Verifies recipient opted in before sending

**Transaction Fee**: ~0.001 ALGO (paid by master wallet)

---

#### `/supabase/functions/algorand-get-balance/index.ts`

**Purpose**: Check user's VMC balance and opt-in status

**Key Features**:

- Query user's Algorand account
- Check VMC asset balance
- Return opt-in status
- Include ALGO balance for reference

**Request Body**:

```typescript
{
  userAddress: string; // User's Algorand wallet address
}
```

**Response**:

```typescript
{
  success: boolean
  address?: string           // User's wallet address
  balance?: number          // VMC balance (display units)
  isOptedIn?: boolean      // Opt-in status
  algoBalance?: number     // ALGO balance (for tx fees)
  assetId?: number         // VMC asset ID
  explorerUrl?: string     // Link to view account
  error?: string           // Error message if failed
}
```

**Technical Details**:

- Balance conversion: `displayBalance = baseUnits / 100`
- Checks `accountInfo.assets` array for VMC asset
- Returns 0 balance if not opted in

---

### 2. Frontend Components

#### `/src/pages/AlgorandSetup.tsx`

**Purpose**: Page wrapper for Algorand setup interface

**Features**:

- Renders AlgorandSetup component
- Includes back navigation
- Provides consistent layout with AppHeader

**Route**: `/algorand-setup`

---

#### `/src/components/AlgorandSetup.tsx`

**Purpose**: Main UI for Algorand wallet setup and management

**Features**:

- Generate new wallet or restore existing
- Display wallet credentials securely
- Request testnet ALGO funding
- Create VMC asset
- Persist credentials to localStorage

**State Management**:

```typescript
const [loading, setLoading] = useState(false);
const [credentials, setCredentials] = useState<AlgorandCredentials | null>(
  null
);
```

**localStorage Key**: `algorand_credentials`

**Stored Data Structure**:

```typescript
{
  address: string;
  mnemonic: string;
  assetId: number | null;
  network: string;
  balance: number;
  fundingInstructions: string | null;
  explorerUrl: string;
  assetExplorerUrl: string | null;
}
```

**UI Elements**:

1. **Generate Button**: Creates/refreshes wallet and asset
2. **Wallet Address**: Copyable field with explorer link
3. **Mnemonic**: Copyable field with security warning
4. **Asset ID**: Displayed when VMC is created
5. **Balance**: Shows current ALGO balance
6. **Funding Instructions**: Shown when wallet needs ALGO
7. **Next Steps**: Checklist for configuration

**Security Features**:

- Mnemonic displayed with warning
- Copy-to-clipboard functionality
- Local storage only (not sent to server except for restore)
- Visual indicators for sensitive data

---

## Edge Functions API Reference

### Base URL

```
https://xvxwynjudfrapsxhurpc.supabase.co/functions/v1
```

### Authentication

All requests require Supabase API key in headers:

```typescript
headers: {
  'apikey': 'YOUR_SUPABASE_ANON_KEY',
  'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY',
  'Content-Type': 'application/json'
}
```

### Calling from Frontend

**Using Supabase Client** (Recommended):

```typescript
import { supabase } from "@/integrations/supabase/client";

// Setup wallet
const { data, error } = await supabase.functions.invoke(
  "setup-algorand-testnet",
  {
    body: { mnemonic: existingMnemonic }, // Optional
  }
);

// Check balance
const { data, error } = await supabase.functions.invoke(
  "algorand-get-balance",
  {
    body: { userAddress: "USER_WALLET_ADDRESS" },
  }
);

// Reward coins
const { data, error } = await supabase.functions.invoke(
  "algorand-reward-coins",
  {
    body: {
      recipientAddress: "USER_WALLET_ADDRESS",
      amount: 100,
      note: "Purchase reward",
    },
  }
);

// Opt-in
const { data, error } = await supabase.functions.invoke("algorand-opt-in", {
  body: { userAddress: "USER_WALLET_ADDRESS" },
});
```

---

## User Guide

### For End Users: How to Use VidMart Coin

#### Step 1: Create/Connect Algorand Wallet

Users will need an Algorand wallet to receive VMC. Options:

- **Pera Wallet** (Mobile & Web): https://perawallet.app
- **Defly Wallet** (Mobile & Web): https://defly.app
- **Algorand Wallet** (Official): https://algorandwallet.com

#### Step 2: Opt-in to VidMart Coin

Before receiving VMC, users must opt-in:

1. Navigate to reward section in VidMart app
2. Click "Opt-in to VidMart Coin"
3. Sign the opt-in transaction in wallet
4. Wait for confirmation

#### Step 3: Make Purchases & Earn VMC

- Complete purchases on VidMart
- Earn VMC rewards automatically
- Rewards are sent to connected wallet

#### Step 4: View Balance & Transactions

- Check balance in VidMart app
- View transaction history on Algorand explorer
- Track earnings over time

### For Admins: Setting Up the System

#### Initial Setup (One-time)

1. **Generate Master Wallet**

   - Navigate to `/algorand-setup`
   - Click "Generate Testnet Credentials"
   - Save the mnemonic securely (write it down!)
   - Copy the wallet address

2. **Fund the Wallet**

   - Visit https://bank.testnet.algorand.network/
   - Paste the wallet address
   - Request testnet ALGO (10 ALGO recommended)
   - Wait 5-10 seconds for confirmation

3. **Create VMC Asset**

   - Return to `/algorand-setup`
   - Click "Check for Asset / Refresh"
   - VMC asset will be created automatically
   - Note the Asset ID displayed

4. **Configure Secrets**
   - The UI prompts to add secrets
   - Add `ALGORAND_MNEMONIC`: Paste your 25-word phrase
   - Add `ALGORAND_ASSET_ID`: Enter the asset ID
   - Save the secrets

#### Ongoing Management

**Monitoring Balance**:

- Check master wallet balance regularly
- Ensure sufficient VMC for rewards
- Ensure sufficient ALGO for transaction fees

**Rewarding Users**:

```typescript
// After user completes purchase
const { data, error } = await supabase.functions.invoke(
  "algorand-reward-coins",
  {
    body: {
      recipientAddress: user.algorandAddress,
      amount: calculateReward(purchaseAmount),
      note: `Reward for order #${orderId}`,
    },
  }
);

if (error) {
  console.error("Failed to send reward:", error);
} else {
  console.log("Reward sent:", data.transactionId);
}
```

---

## Developer Guide

### Local Development

1. **Install Dependencies**

   ```bash
   npm install algosdk@3.5.2
   ```

2. **Test Edge Functions Locally**

   ```bash
   supabase functions serve
   ```

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy setup-algorand-testnet
   supabase functions deploy algorand-opt-in
   supabase functions deploy algorand-reward-coins
   supabase functions deploy algorand-get-balance
   ```

### Integrating Rewards into Purchase Flow

**Example: Checkout Component**

```typescript
import { supabase } from "@/integrations/supabase/client";

const handlePurchase = async (order: Order) => {
  try {
    // Process payment
    await processPayment(order);

    // Calculate VMC reward (e.g., 1% of purchase)
    const rewardAmount = order.total * 0.01;

    // Check if user has Algorand wallet connected
    if (user.algorandAddress) {
      // Send VMC reward
      const { data, error } = await supabase.functions.invoke(
        "algorand-reward-coins",
        {
          body: {
            recipientAddress: user.algorandAddress,
            amount: rewardAmount,
            note: `Reward for order #${order.id}`,
          },
        }
      );

      if (data?.success) {
        toast.success(`You earned ${rewardAmount} VMC!`, {
          description: "View on blockchain",
          action: {
            label: "View",
            onClick: () => window.open(data.explorerUrl, "_blank"),
          },
        });
      } else {
        console.error("Reward failed:", error);
        // Fallback: Save pending reward to database
        await savePendingReward(user.id, rewardAmount);
      }
    }
  } catch (error) {
    console.error("Purchase error:", error);
  }
};
```

### Error Handling Best Practices

```typescript
const sendRewardWithRetry = async (
  recipientAddress: string,
  amount: number,
  maxRetries = 3
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "algorand-reward-coins",
        {
          body: { recipientAddress, amount },
        }
      );

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error(`Retry ${i + 1}/${maxRetries}:`, error);

      if (error.message.includes("opt-in")) {
        // User needs to opt-in first
        throw new Error("User must opt-in to VidMart Coin first");
      }

      if (error.message.includes("insufficient funds")) {
        // Master wallet needs more VMC
        throw new Error("Insufficient VMC in reward pool");
      }

      if (i === maxRetries - 1) throw error;

      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, i))
      );
    }
  }
};
```

---

## Testing Guide

### Manual Testing Checklist

#### 1. Wallet Setup

- [ ] Generate new wallet successfully
- [ ] Wallet address is valid Algorand address
- [ ] Mnemonic is 25 words
- [ ] Funding instructions appear when balance is 0
- [ ] Asset creation works after funding
- [ ] Asset ID is displayed correctly
- [ ] Credentials persist in localStorage
- [ ] Refresh loads existing credentials

#### 2. Opt-in Flow

- [ ] Opt-in transaction generates correctly
- [ ] Already opted-in status detected
- [ ] Transaction can be signed externally
- [ ] Opt-in confirmation visible on explorer

#### 3. Reward Distribution

- [ ] Rewards sent to opted-in addresses
- [ ] Error shown for non-opted-in addresses
- [ ] Transaction confirms on blockchain
- [ ] Balance updates correctly
- [ ] Transaction visible on explorer
- [ ] Note field appears in transaction

#### 4. Balance Checking

- [ ] Balance fetched correctly
- [ ] Opt-in status accurate
- [ ] Zero balance shown for non-opted-in users
- [ ] ALGO balance displayed
- [ ] Explorer link works

### Testing with Algorand Testnet

**Using Pera Wallet (Recommended)**:

1. Install Pera Wallet mobile app
2. Create testnet account
3. Fund account: https://bank.testnet.algorand.network/
4. Use WalletConnect to connect to VidMart
5. Test opt-in and receiving VMC

**Using AlgoSDK Directly**:

```typescript
// Generate test wallet
const testAccount = algosdk.generateAccount();
console.log("Address:", testAccount.addr);
console.log("Mnemonic:", algosdk.secretKeyToMnemonic(testAccount.sk));

// Fund at: https://bank.testnet.algorand.network/
// Then test opt-in and rewards
```

### Automated Testing

**Edge Function Tests**:

```typescript
// Test balance check
describe("algorand-get-balance", () => {
  it("should return balance for valid address", async () => {
    const response = await supabase.functions.invoke("algorand-get-balance", {
      body: { userAddress: "VALID_ADDRESS" },
    });

    expect(response.data.success).toBe(true);
    expect(response.data.balance).toBeGreaterThanOrEqual(0);
  });

  it("should handle invalid address", async () => {
    const response = await supabase.functions.invoke("algorand-get-balance", {
      body: { userAddress: "INVALID" },
    });

    expect(response.data.success).toBe(false);
    expect(response.data.error).toBeDefined();
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. "Do not know how to serialize a BigInt"

**Cause**: Algorand SDK returns BigInt values that JSON.stringify can't handle

**Solution**: Convert BigInt to Number before JSON serialization

```typescript
// ❌ Wrong
assetId: confirmedTxn.assetIndex;

// ✅ Correct
assetId: Number(confirmedTxn.assetIndex);
```

#### 2. "Recipient must opt-in to VidMart Coin asset first"

**Cause**: User hasn't completed opt-in process

**Solution**:

1. Check opt-in status: `algorand-get-balance`
2. Generate opt-in tx: `algorand-opt-in`
3. Have user sign transaction
4. Retry reward after opt-in confirmed

#### 3. "TypeError: Property 'from' does not exist"

**Cause**: Incorrect parameter names in algosdk v3.5.2

**Solution**: Use correct parameter names

```typescript
// ❌ Wrong (old SDK)
makeAssetTransferTxnWithSuggestedParamsFromObject({
  from: address,
  to: recipient,
  ...
})

// ✅ Correct (v3.5.2)
makeAssetTransferTxnWithSuggestedParamsFromObject({
  sender: address,
  receiver: recipient,
  ...
})
```

#### 4. "Account needs funding"

**Cause**: Wallet has insufficient ALGO for transaction fees

**Solution**:

1. Visit https://bank.testnet.algorand.network/
2. Paste wallet address
3. Request testnet ALGO
4. Wait for confirmation (5-10 seconds)

#### 5. Edge function timeout

**Cause**: Algorand network slow or waitForConfirmation taking too long

**Solution**: Increase timeout or use background tasks

```typescript
// Increase confirmation rounds timeout
await algosdk.waitForConfirmation(algodClient, txId, 8); // from 4 to 8 rounds
```

### Debug Checklist

When rewards aren't working:

1. **Check Master Wallet**

   - [ ] Has sufficient ALGO for fees
   - [ ] Has sufficient VMC to distribute
   - [ ] Asset exists and is correct ID

2. **Check User Wallet**

   - [ ] Address is valid
   - [ ] Has minimum ALGO balance (~0.1 ALGO)
   - [ ] Has opted in to VMC asset

3. **Check Edge Function Logs**

   ```bash
   # View logs in Supabase dashboard
   # Or check browser console for errors
   ```

4. **Check Algorand Explorer**
   - Master wallet: https://testnet.algoexplorer.io/address/MMQ7IVU5UPXII7D54QW5T2R7FFBXY6K3QGGGKFR6TXPBEGZ7OJJVTMKTRQ
   - Transaction history shows successful transfers

### Getting Help

**Algorand Resources**:

- Developer Docs: https://developer.algorand.org/
- Discord: https://discord.gg/algorand
- Forum: https://forum.algorand.org/

**VidMart Support**:

- Check edge function logs in Supabase dashboard
- Review transaction history on Algorand explorer
- Contact development team with transaction IDs

---

## Production Considerations

### Moving to Mainnet

When ready for production, update:

1. **Network Configuration**

   ```typescript
   // Change in all edge functions
   const algodServer = "https://mainnet-api.algonode.cloud"; // from testnet
   const algodPort = 443;
   ```

2. **Create Mainnet Asset**

   - Use same process as testnet
   - Fund wallet with real ALGO
   - Update `ALGORAND_ASSET_ID` secret

3. **Security Considerations**

   - Use hardware wallet for master account
   - Enable multi-sig for large amounts
   - Implement rate limiting
   - Add transaction amount limits
   - Monitor for suspicious activity

4. **Compliance**
   - Ensure token distribution complies with regulations
   - Implement KYC if required
   - Add terms of service for rewards program

### Scaling Considerations

- **Transaction Volume**: Algorand handles 6,000+ TPS
- **Cost**: ~0.001 ALGO per transaction
- **Confirmation Time**: ~3.9 seconds average
- **Asset Distribution**: Consider batch transactions for large rewards

---

## Appendix

### Algorand Testnet Resources

- **Faucet**: https://bank.testnet.algorand.network/
- **Explorer**: https://testnet.algoexplorer.io/
- **API Node**: https://testnet-api.algonode.cloud

### VidMart Coin Details

- **Asset ID**: 748499705
- **Master Wallet**: MMQ7IVU5UPXII7D54QW5T2R7FFBXY6K3QGGGKFR6TXPBEGZ7OJJVTMKTRQ
- **Total Supply**: 10,000,000,000 VMC
- **Circulating Supply**: Managed by master wallet distribution
- **Explorer**: https://testnet.algoexplorer.io/asset/748499705

### Version History

- **v1.0.0** - Initial Algorand integration
  - Wallet setup and asset creation
  - Opt-in functionality
  - Reward distribution
  - Balance checking

---

## License & Legal

This integration is built for VidMart's internal reward system. VidMart Coin (VMC) is a testnet asset for demonstration purposes. Not intended for real monetary value on testnet.

For production use, ensure compliance with all applicable cryptocurrency and financial regulations in your jurisdiction.
