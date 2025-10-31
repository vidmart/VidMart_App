export interface UserCoins {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'earned' | 'spent';
  description: string;
  order_id: string | null;
  created_at: string;
}
