-- Create user profiles table for eco points and user data
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  eco_points INTEGER DEFAULT 0,
  total_repairs_completed INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user profiles
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create eco points transactions table for history tracking
CREATE TABLE IF NOT EXISTS public.eco_points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT CHECK (transaction_type IN ('earned', 'used')) NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  device_type TEXT,
  repair_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for eco points transactions
ALTER TABLE public.eco_points_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for eco points transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.eco_points_transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
  ON public.eco_points_transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, eco_points, total_repairs_completed, level, total_points)
  VALUES (
    NEW.id,
    0,
    0,
    1,
    0
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update user profile when eco points are earned/used
CREATE OR REPLACE FUNCTION public.update_user_eco_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update user profile eco points balance
  UPDATE public.user_profiles 
  SET 
    eco_points = eco_points + NEW.amount,
    total_points = CASE 
      WHEN NEW.transaction_type = 'earned' THEN total_points + NEW.amount
      ELSE total_points
    END,
    total_repairs_completed = CASE 
      WHEN NEW.transaction_type = 'earned' THEN total_repairs_completed + 1
      ELSE total_repairs_completed
    END,
    level = CASE 
      WHEN NEW.transaction_type = 'earned' THEN 
        GREATEST(1, FLOOR((total_points + NEW.amount) / 1000) + 1)
      ELSE level
    END,
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Trigger to automatically update user profile when eco points transaction is added
CREATE TRIGGER trigger_update_user_eco_points
  AFTER INSERT ON public.eco_points_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_eco_points();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_eco_points ON public.user_profiles(eco_points);
CREATE INDEX IF NOT EXISTS idx_eco_points_transactions_user_id ON public.eco_points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_eco_points_transactions_type ON public.eco_points_transactions(transaction_type);
