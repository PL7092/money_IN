-- FinanceFlow MariaDB Database Initialization
-- This script creates the initial database structure for MariaDB

-- Set charset and collation
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Users table (for multi-user support)
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    active BOOLEAN DEFAULT true
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('checking', 'savings', 'credit', 'investment') NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    initial_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    initial_balance_date DATE NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    institution VARCHAR(255),
    color VARCHAR(7) DEFAULT '#3B82F6',
    status ENUM('active', 'archived') DEFAULT 'active',
    investment_type ENUM('stocks', 'bonds', 'etf', 'crypto', 'real_estate', 'commodities', 'other') NULL,
    investment_details JSON,
    upload_config JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('income', 'expense', 'both') NOT NULL,
    subcategories JSON,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(10) DEFAULT '📂',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_category (user_id, name)
);

-- Entities table
CREATE TABLE IF NOT EXISTS entities (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('person', 'company', 'government', 'other') NOT NULL,
    category VARCHAR(255),
    aliases JSON,
    default_category VARCHAR(255),
    default_subcategory VARCHAR(255),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_entity (user_id, name)
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('vehicle', 'property', 'equipment', 'other') NOT NULL,
    category VARCHAR(255),
    value DECIMAL(15,2) NOT NULL,
    purchase_date DATE NOT NULL,
    purchase_price DECIMAL(15,2),
    depreciation_rate DECIMAL(5,2) DEFAULT 0,
    current_condition ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'good',
    location VARCHAR(255),
    serial_number VARCHAR(255),
    model VARCHAR(255),
    brand VARCHAR(255),
    year_manufactured INTEGER,
    documents JSON,
    insurance JSON,
    maintenance JSON,
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    type ENUM('income', 'expense', 'transfer') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    entity VARCHAR(255),
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255),
    account_id CHAR(36) NOT NULL,
    to_account_id CHAR(36) NULL,
    asset_id CHAR(36) NULL,
    savings_goal_id CHAR(36) NULL,
    recurring_transaction_id CHAR(36) NULL,
    transaction_date DATE NOT NULL,
    recurring BOOLEAN DEFAULT false,
    tags JSON,
    location VARCHAR(255),
    receipt_url TEXT,
    ai_processed BOOLEAN DEFAULT false,
    confidence DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    category VARCHAR(255) NOT NULL,
    limit_amount DECIMAL(15,2) NOT NULL,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    period ENUM('monthly', 'yearly') DEFAULT 'monthly',
    month INTEGER NOT NULL CHECK (month >= 0 AND month <= 11),
    year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_budget (user_id, category, month, year)
);

-- Recurring transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    expected_amount DECIMAL(15,2) NOT NULL,
    max_acceptable_amount DECIMAL(15,2),
    min_acceptable_amount DECIMAL(15,2),
    type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255),
    account_id CHAR(36) NOT NULL,
    frequency ENUM('weekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
    next_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN DEFAULT true,
    auto_include_in_budget BOOLEAN DEFAULT true,
    alert_on_variation BOOLEAN DEFAULT true,
    variation_threshold DECIMAL(5,2) DEFAULT 20,
    statistics JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Recurring transaction history
CREATE TABLE IF NOT EXISTS recurring_transaction_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    recurring_transaction_id CHAR(36) NOT NULL,
    transaction_id CHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_date DATE NOT NULL,
    variance DECIMAL(15,2) NOT NULL,
    variance_percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recurring_transaction_id) REFERENCES recurring_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Savings goals table
CREATE TABLE IF NOT EXISTS savings_goals (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    target_date DATE NOT NULL,
    category ENUM('emergency', 'vacation', 'house', 'car', 'education', 'retirement', 'other') NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('active', 'completed', 'paused') DEFAULT 'active',
    linked_account_id CHAR(36) NULL,
    monthly_contribution DECIMAL(15,2),
    auto_transfer BOOLEAN DEFAULT false,
    milestones JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (linked_account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

-- Savings transactions table
CREATE TABLE IF NOT EXISTS savings_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    savings_goal_id CHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type ENUM('deposit', 'withdrawal') NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (savings_goal_id) REFERENCES savings_goals(id) ON DELETE CASCADE
);

-- AI rules table
CREATE TABLE IF NOT EXISTS ai_rules (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    pattern VARCHAR(500) NOT NULL,
    pattern_type ENUM('contains', 'startsWith', 'endsWith', 'regex') NOT NULL,
    entity VARCHAR(255),
    category VARCHAR(255),
    subcategory VARCHAR(255),
    tags JSON,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.8,
    priority INTEGER NOT NULL DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_asset ON transactions(asset_id);
CREATE INDEX idx_budgets_user_period ON budgets(user_id, year, month);
CREATE INDEX idx_accounts_user_status ON accounts(user_id, status);
CREATE INDEX idx_recurring_user_active ON recurring_transactions(user_id, active);
CREATE INDEX idx_savings_user_status ON savings_goals(user_id, status);
CREATE INDEX idx_assets_user_active ON assets(user_id, active);