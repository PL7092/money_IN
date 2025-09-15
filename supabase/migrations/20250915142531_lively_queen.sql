-- FinanceFlow Database Initialization
-- This script creates the initial database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for multi-user support)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'investment')),
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    initial_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    initial_balance_date DATE NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    institution VARCHAR(255),
    color VARCHAR(7) DEFAULT '#3B82F6',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    investment_type VARCHAR(50) CHECK (investment_type IN ('stocks', 'bonds', 'etf', 'crypto', 'real_estate', 'commodities', 'other')),
    investment_details JSONB,
    upload_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'both')),
    subcategories TEXT[],
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(10) DEFAULT '📂',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Entities table
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('person', 'company', 'government', 'other')),
    category VARCHAR(255),
    aliases TEXT[],
    default_category VARCHAR(255),
    default_subcategory VARCHAR(255),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    entity VARCHAR(255),
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    transaction_date DATE NOT NULL,
    recurring BOOLEAN DEFAULT false,
    recurring_id UUID,
    tags TEXT[],
    location VARCHAR(255),
    receipt_url TEXT,
    ai_processed BOOLEAN DEFAULT false,
    confidence DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(255) NOT NULL,
    limit_amount DECIMAL(15,2) NOT NULL,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    period VARCHAR(20) DEFAULT 'monthly' CHECK (period IN ('monthly', 'yearly')),
    month INTEGER NOT NULL CHECK (month >= 0 AND month <= 11),
    year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category, month, year)
);

-- Recurring transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    expected_amount DECIMAL(15,2) NOT NULL,
    max_acceptable_amount DECIMAL(15,2),
    min_acceptable_amount DECIMAL(15,2),
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    next_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN DEFAULT true,
    auto_include_in_budget BOOLEAN DEFAULT true,
    alert_on_variation BOOLEAN DEFAULT true,
    variation_threshold DECIMAL(5,2) DEFAULT 20,
    statistics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring transaction history
CREATE TABLE IF NOT EXISTS recurring_transaction_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recurring_transaction_id UUID NOT NULL REFERENCES recurring_transactions(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    transaction_date DATE NOT NULL,
    variance DECIMAL(15,2) NOT NULL,
    variance_percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Savings goals table
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    target_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('emergency', 'vacation', 'house', 'car', 'education', 'retirement', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    linked_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    monthly_contribution DECIMAL(15,2),
    auto_transfer BOOLEAN DEFAULT false,
    milestones JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Savings transactions table
CREATE TABLE IF NOT EXISTS savings_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    savings_goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
    transaction_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('vehicle', 'property', 'equipment')),
    value DECIMAL(15,2) NOT NULL,
    purchase_date DATE NOT NULL,
    documents TEXT[],
    insurance JSONB,
    maintenance JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI rules table
CREATE TABLE IF NOT EXISTS ai_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    pattern VARCHAR(500) NOT NULL,
    pattern_type VARCHAR(20) NOT NULL CHECK (pattern_type IN ('contains', 'startsWith', 'endsWith', 'regex')),
    entity VARCHAR(255),
    category VARCHAR(255),
    subcategory VARCHAR(255),
    tags TEXT[],
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.8,
    priority INTEGER NOT NULL DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_accounts_user_status ON accounts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_recurring_user_active ON recurring_transactions(user_id, active);
CREATE INDEX IF NOT EXISTS idx_savings_user_status ON savings_goals(user_id, status);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, password_hash, name, role) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@financeflow.local',
    '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ',
    'Administrador',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert default demo user (password: demo123)
INSERT INTO users (id, email, password_hash, name, role) 
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'demo@financeflow.local',
    '$2b$10$demo123hashdemo123hashdemo123hashdemo123hashdemo123hash',
    'Utilizador Demo',
    'user'
) ON CONFLICT (email) DO NOTHING;