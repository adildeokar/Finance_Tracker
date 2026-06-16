-- Run in Supabase SQL Editor (in order)

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  hashed_password TEXT NOT NULL,
  currency TEXT DEFAULT 'INR',
  avatar_color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('credit_card', 'savings', 'debit_card', 'wallet', 'cash')) NOT NULL,
  last_four TEXT,
  color TEXT DEFAULT '#6366f1',
  credit_limit NUMERIC(12,2),
  current_balance NUMERIC(12,2) DEFAULT 0,
  billing_date INT,
  due_date INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT DEFAULT '💸',
  type TEXT CHECK (type IN ('expense', 'income', 'both')) DEFAULT 'expense',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT CHECK (type IN ('expense', 'income', 'transfer')) DEFAULT 'expense',
  date DATE NOT NULL,
  notes TEXT,
  tags TEXT[],
  receipt_url TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  monthly_limit NUMERIC(12,2) NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  alert_threshold INT DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, month, year)
);

CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT CHECK (type IN ('expense', 'income')) DEFAULT 'expense',
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')) DEFAULT 'monthly',
  day_of_month INT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  last_applied DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL,
  current_amount NUMERIC(12,2) DEFAULT 0,
  target_date DATE,
  color TEXT DEFAULT '#22c55e',
  icon TEXT DEFAULT '🎯',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('budget_breach', 'budget_warning', 'goal_reached', 'bill_due', 'insight')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default login accounts (safe to run multiple times)
-- Passwords:
-- admin@fintrack.dev => Admin@123
-- user@fintrack.dev  => User@123
INSERT INTO users (name, email, role, hashed_password, currency, avatar_color)
VALUES
  (
    'System Admin',
    'admin@fintrack.dev',
    'admin',
    '$2b$12$Ydq3b4ybccyciMxBE8oB8uqRxlYrxs8Ri1fytNIxrjKJlbY45yjc2',
    'INR',
    '#4f46e5'
  ),
  (
    'Demo User',
    'user@fintrack.dev',
    'user',
    '$2b$12$lZOAPHEFDBYY9urjO7gZbeKsbSqCZNT8ypGPSrbHOP7Kfgc.l988.',
    'INR',
    '#16a34a'
  )
ON CONFLICT (email) DO NOTHING;
