-- Seed data for demo user in MariaDB
-- This script populates the database with sample data for testing

-- Use the database
USE financeflow;

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