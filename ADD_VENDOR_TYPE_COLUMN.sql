-- Add VENDOR_TYPE column to VENDOR_MASTER table
-- This script adds support for vendor types: Transporter, Handling Agent, Broker, Surveyor

-- Step 1: Add VENDOR_TYPE column if it doesn't exist
IF NOT EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'VENDOR_MASTER' 
    AND COLUMN_NAME = 'VENDOR_TYPE'
)
BEGIN
    -- Add VENDOR_TYPE column
    ALTER TABLE VENDOR_MASTER 
    ADD VENDOR_TYPE NVARCHAR(50) NULL;
    
    PRINT 'VENDOR_TYPE column added successfully to VENDOR_MASTER table';
END
ELSE
BEGIN
    PRINT 'VENDOR_TYPE column already exists in VENDOR_MASTER table';
END
GO

-- Step 2: Add check constraint to ensure only valid vendor types are entered
IF NOT EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
    WHERE CONSTRAINT_NAME = 'CK_VENDOR_MASTER_VENDOR_TYPE'
)
BEGIN
    ALTER TABLE VENDOR_MASTER 
    ADD CONSTRAINT CK_VENDOR_MASTER_VENDOR_TYPE 
    CHECK (VENDOR_TYPE IN ('Transporter', 'Handling Agent', 'Broker', 'Surveyor') OR VENDOR_TYPE IS NULL);
    
    PRINT 'Check constraint CK_VENDOR_MASTER_VENDOR_TYPE added successfully';
END
ELSE
BEGIN
    PRINT 'Check constraint CK_VENDOR_MASTER_VENDOR_TYPE already exists';
END
GO

-- Step 3: Optional: Update existing records to have a default vendor type
-- Uncomment the following line if you want to set existing records to 'Transporter' by default
-- UPDATE VENDOR_MASTER SET VENDOR_TYPE = 'Transporter' WHERE VENDOR_TYPE IS NULL;
GO

-- Step 4: Display the current structure of VENDOR_MASTER table (optional)
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'VENDOR_MASTER' 
ORDER BY ORDINAL_POSITION;
GO

PRINT 'Vendor type implementation completed successfully!';
