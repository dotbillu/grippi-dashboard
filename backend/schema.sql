-- 1. Create the Table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    clicks INTEGER DEFAULT 0,
    cost DECIMAL(10, 2) DEFAULT 0.00,
    impressions INTEGER DEFAULT 0,
    color VARCHAR(20) DEFAULT '#3b82f6'
);

INSERT INTO campaigns (name, status, clicks, cost, impressions, color) VALUES 
('Summer Sale', 'Active', 1250, 450.00, 15000, '#2563eb'),
('Black Friday', 'Paused', 320, 89.50, 2500, '#94a3b8'),
('Influencer Promo', 'Active', 800, 210.20, 5600, '#16a34a'),
('Retargeting', 'Active', 450, 125.00, 3400, '#d97706'),
('Winter Clearance', 'Active', 600, 180.50, 4200, '#8b5cf6'),
('Email Blast', 'Paused', 120, 40.00, 1200, '#ef4444'),
('Google Ads Q1', 'Active', 2100, 890.00, 45000, '#0ea5e9'),
('Facebook Q1', 'Active', 1800, 750.50, 32000, '#3b82f6'),
('Referral Program', 'Paused', 50, 0.00, 200, '#64748b'),
('Spring Launch', 'Active', 950, 310.00, 8900, '#10b981');
