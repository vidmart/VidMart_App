-- Create user_coins table to store coin balances
CREATE TABLE public.user_coins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create coin_transactions table for transaction history
CREATE TABLE public.coin_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'spent')),
  description text NOT NULL,
  order_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_coins
CREATE POLICY "Users can view their own coins"
  ON public.user_coins
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own coins"
  ON public.user_coins
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert coins"
  ON public.user_coins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for coin_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.coin_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.coin_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to initialize coins for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_coins()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create coin balance with 100 coins
  INSERT INTO public.user_coins (user_id, balance)
  VALUES (NEW.id, 100);
  
  -- Create transaction record for signup bonus
  INSERT INTO public.coin_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 100, 'earned', 'Welcome bonus - Sign up reward');
  
  RETURN NEW;
END;
$$;

-- Trigger to give 100 coins on user signup
CREATE TRIGGER on_auth_user_created_coins
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_coins();

-- Create function to update user_coins updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at on user_coins
CREATE TRIGGER update_user_coins_updated_at
  BEFORE UPDATE ON public.user_coins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_coins_user_id ON public.user_coins(user_id);
CREATE INDEX idx_coin_transactions_user_id ON public.coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_created_at ON public.coin_transactions(created_at DESC);