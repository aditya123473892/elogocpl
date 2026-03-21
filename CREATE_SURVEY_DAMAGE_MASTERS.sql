-- Create Survey Type Master and Damage Type Master tables
-- This script creates master tables for survey types and damage types

-- Step 1: Create SURVEY_TYPE_MASTER table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SURVEY_TYPE_MASTER')
BEGIN
    CREATE TABLE SURVEY_TYPE_MASTER (
        SURVEY_TYPE_ID NUMERIC(10, 0) IDENTITY(1,1) PRIMARY KEY,
        SURVEY_TYPE_NAME NVARCHAR(100) NOT NULL,
        DESCRIPTION NVARCHAR(500) NULL,
        STATUS NVARCHAR(20) DEFAULT 'Active',
        CREATED_BY NVARCHAR(50) DEFAULT 'SYSTEM',
        CREATED_ON DATETIME DEFAULT GETDATE(),
        UPDATED_BY NVARCHAR(50) NULL,
        UPDATED_ON DATETIME NULL
    );
    
    PRINT 'SURVEY_TYPE_MASTER table created successfully';
END
ELSE
BEGIN
    PRINT 'SURVEY_TYPE_MASTER table already exists';
END
GO

-- Step 2: Create DAMAGE_TYPE_MASTER table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'DAMAGE_TYPE_MASTER')
BEGIN
    CREATE TABLE DAMAGE_TYPE_MASTER (
        DAMAGE_TYPE_ID NUMERIC(10, 0) IDENTITY(1,1) PRIMARY KEY,
        DAMAGE_TYPE_NAME NVARCHAR(100) NOT NULL,
        DESCRIPTION NVARCHAR(500) NULL,
        STATUS NVARCHAR(20) DEFAULT 'Active',
        CREATED_BY NVARCHAR(50) DEFAULT 'SYSTEM',
        CREATED_ON DATETIME DEFAULT GETDATE(),
        UPDATED_BY NVARCHAR(50) NULL,
        UPDATED_ON DATETIME NULL
    );
    
    PRINT 'DAMAGE_TYPE_MASTER table created successfully';
END
ELSE
BEGIN
    PRINT 'DAMAGE_TYPE_MASTER table already exists';
END
GO

-- Step 3: Insert sample data into SURVEY_TYPE_MASTER
IF NOT EXISTS (SELECT 1 FROM SURVEY_TYPE_MASTER)
BEGIN
    INSERT INTO SURVEY_TYPE_MASTER (SURVEY_TYPE_NAME, DESCRIPTION, STATUS) VALUES
    ('Pre-Dispatch Survey', 'Survey conducted before vehicle dispatch', 'Active'),
    ('Transit Survey', 'Survey conducted during vehicle transit', 'Active'),
    ('Arrival Survey', 'Survey conducted at destination arrival', 'Active'),
    ('Damage Assessment Survey', 'Survey to assess vehicle damage', 'Active'),
    ('Quality Inspection Survey', 'Survey for quality inspection', 'Active'),
    ('Post-Repair Survey', 'Survey conducted after repair completion', 'Active'),
    ('Insurance Survey', 'Survey for insurance claims', 'Active'),
    ('Customs Survey', 'Survey for customs clearance', 'Active');
    
    PRINT 'Sample data inserted into SURVEY_TYPE_MASTER';
END
ELSE
BEGIN
    PRINT 'SURVEY_TYPE_MASTER already contains data';
END
GO

-- Step 4: Insert sample data into DAMAGE_TYPE_MASTER
IF NOT EXISTS (SELECT 1 FROM DAMAGE_TYPE_MASTER)
BEGIN
    INSERT INTO DAMAGE_TYPE_MASTER (DAMAGE_TYPE_NAME, DESCRIPTION, STATUS) VALUES
    ('Scratch', 'Minor surface scratches', 'Active'),
    ('Dent', 'Dented body panels', 'Active'),
    ('Crack', 'Cracked glass or plastic components', 'Active'),
    ('Breakage', 'Broken parts or components', 'Active'),
    ('Paint Damage', 'Paint peeling or discoloration', 'Active'),
    ('Rust', 'Rust formation on metal parts', 'Active'),
    ('Tire Damage', 'Damaged or worn tires', 'Active'),
    ('Glass Damage', 'Broken or cracked windows', 'Active'),
    ('Electrical Damage', 'Electrical system malfunction', 'Active'),
    ('Engine Damage', 'Engine related damages', 'Active'),
    ('Transmission Damage', 'Transmission system issues', 'Active'),
    ('Interior Damage', 'Interior upholstery or trim damage', 'Active'),
    ('Frame Damage', 'Structural frame damage', 'Active'),
    ('Suspension Damage', 'Suspension system damage', 'Active'),
    ('Light Damage', 'Headlights, taillights or indicator damage', 'Active');
    
    PRINT 'Sample data inserted into DAMAGE_TYPE_MASTER';
END
ELSE
BEGIN
    PRINT 'DAMAGE_TYPE_MASTER already contains data';
END
GO

-- Step 5: Display created tables structure
PRINT '=== SURVEY_TYPE_MASTER Structure ===';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'SURVEY_TYPE_MASTER' 
ORDER BY ORDINAL_POSITION;

PRINT '=== DAMAGE_TYPE_MASTER Structure ===';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'DAMAGE_TYPE_MASTER' 
ORDER BY ORDINAL_POSITION;

PRINT '=== Sample Data from SURVEY_TYPE_MASTER ===';
SELECT * FROM SURVEY_TYPE_MASTER ORDER BY SURVEY_TYPE_ID;

PRINT '=== Sample Data from DAMAGE_TYPE_MASTER ===';
SELECT * FROM DAMAGE_TYPE_MASTER ORDER BY DAMAGE_TYPE_ID;

PRINT 'Survey and Damage Type Masters created successfully!';
