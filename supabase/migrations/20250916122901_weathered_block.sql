-- FinanceFlow MariaDB Initialization Script
-- This script is automatically executed when MariaDB container starts for the first time

-- Set charset and collation
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ensure we're using the correct database
USE financeflow;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    color VARCHAR(7) DEFAULT '#3B82F6',
    documents JSON,
    insurance JSON,
    maintenance JSON,
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    FOREIGN KEY (savings_goal_id) REFERENCES savings_goals(id) ON DELETE SET NULL,
    FOREIGN KEY (recurring_transaction_id) REFERENCES recurring_transactions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, password_hash, name, role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@financeflow.local', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ', 'Administrador', 'admin')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert default demo user (password: demo123)
INSERT INTO users (id, email, password_hash, name, role) VALUES
('00000000-0000-0000-0000-000000000002', 'demo@financeflow.local', '$2b$10$demo123hashdemo123hashdemo123hashdemo123hashdemo123hash', 'Utilizador Demo', 'user')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert default categories for demo user
INSERT INTO categories (id, user_id, name, type, subcategories, color, icon) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Alimentação', 'expense', '["Supermercado", "Restaurantes", "Takeaway", "Mercearia"]', '#059669', '🍽️'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Transporte', 'expense', '["Combustível", "Transportes Públicos", "Táxi/Uber", "Manutenção"]', '#DC2626', '🚗'),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Salário', 'income', '["Salário Base", "Subsídios", "Bónus", "Horas Extra"]', '#059669', '💰'),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Habitação', 'expense', '["Renda", "Prestação Casa", "Condomínio", "Reparações"]', '#7C3AED', '🏠'),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'Entretenimento', 'expense', '["Cinema", "Streaming", "Jogos", "Livros"]', '#EC4899', '🎮'),
('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'Saúde', 'expense', '["Médico", "Farmácia", "Dentista", "Seguro Saúde"]', '#F59E0B', '🏥')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert default entities for demo user
INSERT INTO entities (id, user_id, name, type, category, aliases, default_category, default_subcategory) VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Continente', 'company', 'Supermercado', '["CONTINENTE", "CONT.", "SONAE MC"]', 'Alimentação', 'Supermercado'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Galp', 'company', 'Combustível', '["GALP", "GALP ENERGIA"]', 'Transporte', 'Combustível'),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Empresa XYZ', 'company', 'Empregador', '["EMPRESA XYZ", "XYZ LDA"]', 'Salário', 'Salário Base'),
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Netflix', 'company', 'Streaming', '["NETFLIX", "NETFLIX.COM"]', 'Entretenimento', 'Streaming'),
('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'Pingo Doce', 'company', 'Supermercado', '["PINGO DOCE", "PINGODOCE"]', 'Alimentação', 'Supermercado')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert default accounts for demo user
INSERT INTO accounts (id, user_id, name, type, balance, initial_balance, initial_balance_date, institution, color) VALUES
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Conta Corrente Principal', 'checking', 2500.75, 1000.00, '2023-01-01', 'Banco Exemplo', '#3B82F6'),
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Conta Poupança', 'savings', 15000.00, 10000.00, '2023-02-15', 'Banco Exemplo', '#059669'),
('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Cartão de Crédito', 'credit', -850.25, 0.00, '2023-03-01', 'Banco Crédito', '#DC2626'),
('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'ETF Global', 'investment', 5200.00, 5000.00, '2023-06-01', 'XTB', '#8B5CF6')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Update investment account with details
UPDATE accounts SET 
    investment_type = 'etf',
    investment_details = '{
        "symbol": "VWCE",
        "quantity": 25.5,
        "averageCost": 196.08,
        "currentPrice": 203.92,
        "lastPriceUpdate": "2024-01-15T14:30:00Z",
        "broker": "XTB",
        "notes": "ETF diversificado global"
    }'
WHERE id = '30000000-0000-0000-0000-000000000004';

-- Insert sample assets
INSERT INTO assets (id, user_id, name, type, category, value, purchase_date, purchase_price, brand, model, year_manufactured, color, insurance, maintenance, documents) VALUES
('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'BMW Serie 3', 'vehicle', 'Automóvel', 25000.00, '2021-03-15', 35000.00, 'BMW', 'Serie 3 320d', 2021, '#3B82F6', '{
    "company": "Allianz",
    "policy": "AUTO-2021-1234",
    "expiryDate": "2024-03-15",
    "premium": "450.00",
    "coverage": "Completa"
}', '[
    {
        "date": "2024-01-10",
        "description": "Inspeção Anual",
        "cost": 120.00,
        "nextDue": "2025-01-10",
        "type": "inspection"
    },
    {
        "date": "2023-12-05", 
        "description": "Mudança de óleo",
        "cost": 85.00,
        "nextDue": "2024-06-05",
        "type": "maintenance"
    }
]', '["registo_veiculo.pdf", "seguro_2024.pdf", "manual_utilizador.pdf"]'),
('90000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'MacBook Pro 16"', 'equipment', 'Informática', 2800.00, '2023-06-20', 3200.00, 'Apple', 'MacBook Pro 16" M2', 2023, '#6B7280', '{
    "company": "Apple",
    "expiryDate": "2026-06-20",
    "type": "warranty",
    "coverage": "AppleCare+"
}', '[]', '["garantia_apple.pdf", "fatura_compra.pdf"]')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample transactions with asset associations
INSERT INTO transactions (id, user_id, type, amount, description, category, subcategory, account_id, asset_id, transaction_date) VALUES
('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'expense', 45.80, 'Supermercado Continente', 'Alimentação', 'Supermercado', '30000000-0000-0000-0000-000000000001', NULL, CURDATE()),
('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'income', 2800.00, 'Salário Mensal', 'Salário', 'Salário Base', '30000000-0000-0000-0000-000000000001', NULL, CURDATE()),
('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'expense', 25.00, 'Combustível Galp', 'Transporte', 'Combustível', '30000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', CURDATE() - INTERVAL 1 DAY),
('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'expense', 120.00, 'Inspeção BMW', 'Transporte', 'Manutenção', '30000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', '2024-01-10')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insert sample budgets for current month
INSERT INTO budgets (id, user_id, category, limit_amount, spent_amount, month, year, start_date, end_date) VALUES
('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Alimentação', 400.00, 245.80, MONTH(CURDATE()) - 1, YEAR(CURDATE()), DATE_FORMAT(CURDATE(), '%Y-%m-01'), LAST_DAY(CURDATE())),
('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Transporte', 200.00, 125.00, MONTH(CURDATE()) - 1, YEAR(CURDATE()), DATE_FORMAT(CURDATE(), '%Y-%m-01'), LAST_DAY(CURDATE()))
ON DUPLICATE KEY UPDATE limit_amount = VALUES(limit_amount);

-- Insert sample savings goals
INSERT INTO savings_goals (id, user_id, name, description, target_amount, current_amount, target_date, category, priority, linked_account_id, monthly_contribution, milestones) VALUES
('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Fundo de Emergência', 'Reserva para emergências equivalente a 6 meses de despesas', 15000.00, 8500.00, '2024-12-31', 'emergency', 'high', '30000000-0000-0000-0000-000000000002', 500.00, '[
    {"percentage": 25, "amount": 3750, "achievedAt": "2023-08-15T10:00:00Z"},
    {"percentage": 50, "amount": 7500, "achievedAt": "2023-11-20T10:00:00Z"},
    {"percentage": 75, "amount": 11250},
    {"percentage": 100, "amount": 15000}
]'),
('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Férias na Tailândia', 'Viagem de 2 semanas para a Tailândia', 3500.00, 1200.00, '2024-08-15', 'vacation', 'medium', '30000000-0000-0000-0000-000000000002', 300.00, '[
    {"percentage": 25, "amount": 875, "achievedAt": "2023-12-01T10:00:00Z"},
    {"percentage": 50, "amount": 1750},
    {"percentage": 75, "amount": 2625},
    {"percentage": 100, "amount": 3500}
]')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert AI rules
INSERT INTO ai_rules (id, user_id, name, pattern, pattern_type, entity, category, subcategory, tags, confidence, priority) VALUES
('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Continente - Supermercado', 'CONTINENTE', 'contains', 'Continente', 'Alimentação', 'Supermercado', '["supermercado", "essencial"]', 0.95, 1),
('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Galp - Combustível', 'GALP', 'contains', 'Galp', 'Transporte', 'Combustível', '["combustível", "transporte"]', 0.90, 1),
('70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Netflix - Streaming', 'NETFLIX', 'contains', 'Netflix', 'Entretenimento', 'Streaming', '["streaming", "mensal"]', 0.98, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample recurring transactions
INSERT INTO recurring_transactions (id, user_id, name, amount, expected_amount, max_acceptable_amount, type, category, subcategory, account_id, frequency, next_date, statistics) VALUES
('80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Salário Mensal', 2800.00, 2800.00, 3000.00, 'income', 'Salário', 'Salário Base', '30000000-0000-0000-0000-000000000001', 'monthly', '2024-02-01', '{
    "averageAmount": 2825,
    "lastSixMonthsAverage": 2825,
    "totalVariance": 190,
    "timesOverExpected": 3,
    "timesUnderExpected": 1
}'),
('80000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Renda da Casa', 750.00, 750.00, 800.00, 'expense', 'Habitação', 'Renda', '30000000-0000-0000-0000-000000000001', 'monthly', '2024-01-28', '{
    "averageAmount": 757.5,
    "lastSixMonthsAverage": 757.5,
    "totalVariance": 30,
    "timesOverExpected": 1,
    "timesUnderExpected": 0
}'),
('80000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Netflix', 15.99, 15.99, 20.00, 'expense', 'Entretenimento', 'Streaming', '30000000-0000-0000-0000-000000000001', 'monthly', '2024-02-15', '{
    "averageAmount": 16.66,
    "lastSixMonthsAverage": 16.66,
    "totalVariance": 2,
    "timesOverExpected": 1,
    "timesUnderExpected": 0
}')
ON DUPLICATE KEY UPDATE name = VALUES(name);