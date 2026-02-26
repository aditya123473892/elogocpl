-- Create ARTICLE_MASTER table
CREATE TABLE ARTICLE_MASTER (
    article_id INT IDENTITY(1,1) PRIMARY KEY,
    article_code VARCHAR(50) NOT NULL UNIQUE,
    article_name VARCHAR(100) NOT NULL,
    article_group VARCHAR(50) NOT NULL,
    article_length VARCHAR(20) NULL,
    article_width VARCHAR(20) NULL,
    article_height VARCHAR(20) NULL,
    article_image VARCHAR(500) NULL, -- Store image path/URL
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Create index for faster searches
CREATE INDEX IX_ARTICLE_MASTER_CODE ON ARTICLE_MASTER(article_code);
CREATE INDEX IX_ARTICLE_MASTER_NAME ON ARTICLE_MASTER(article_name);
CREATE INDEX IX_ARTICLE_MASTER_GROUP ON ARTICLE_MASTER(article_group);

-- Insert sample data
INSERT INTO ARTICLE_MASTER (article_code, article_name, article_group, article_length, article_width, article_height) VALUES
('YE311', 'ALTO', 'Hatchback', '3430', '1490', '1475'),
('ACE01', 'ACE', 'Commercial', '3200', '1400', '1800'),
('ACEHT01', 'ACE HT', 'Commercial', '3300', '1450', '1850'),
('ALC01', 'ALCAZAR', 'SUV', '4500', '1790', '1675'),
('ALK10', 'ALTO K10', 'Hatchback', '3530', '1490', '1475'),
('ALZ01', 'ALTROZ', 'Hatchback', '3990', '1755', '1523'),
('AMB01', 'AMBASSADOR', 'Sedan', '4390', '1695', '1524'),
('AUR01', 'AURA', 'Sedan', '3995', '1680', '1520'),
('BAL01', 'BALENO', 'Hatchback', '3995', '1745', '1500'),
('BALA01', 'BALENO ALPHA', 'Hatchback', '3995', '1745', '1500'),
('BALO01', 'BALENO OLD', 'Hatchback', '3990', '1745', '1500'),
('BLK01', 'BLANK SPACE', 'Other', '0', '0', '0'),
('BRZ01', 'BREZZA', 'SUV', '3995', '1790', '1640');
