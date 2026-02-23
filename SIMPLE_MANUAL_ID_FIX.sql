-- Simple Manual Driver ID Fix - SQL Server Compatible
-- Database: fleet3
-- Created: 23-02-2026 12:35
-- Fixes remaining issues with manual driver ID conversion

USE [fleet3]
GO

-- Check current table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'DRIVER_MASTER'
ORDER BY ORDINAL_POSITION;
GO

-- Check if driver_id is still IDENTITY
SELECT 
    name,
    is_identity,
    is_nullable
FROM sys.columns 
WHERE object_id = OBJECT_ID('DRIVER_MASTER') AND name = 'driver_id'
GO

-- Check for foreign key constraints
SELECT 
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS TableName,
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName
FROM sys.foreign_keys AS fk
INNER JOIN sys.foreign_key_columns AS fc ON fk.object_id = fc.constraint_object_id
WHERE OBJECT_NAME(fc.referenced_object_id) = 'DRIVER_MASTER'
GO

-- If there are foreign keys, we need to drop them first
-- (You'll need to manually handle these based on the output above)

-- Simple approach: Create a new table and copy data
CREATE TABLE [dbo].[DRIVER_MASTER_TEMP](
	[driver_id] [int] NOT NULL,              -- Manual driver ID (no auto-increment)
	[driver_name] [varchar](100) NOT NULL,
	[driver_contact] [varchar](20) NOT NULL,
	[driver_license] [varchar](50) NULL,
	[is_active] [bit] NOT NULL DEFAULT 1,
	[created_at] [datetime] NOT NULL DEFAULT GETDATE(),
	[updated_at] [datetime] NULL,
	[qr_code_data] [varchar](255) NULL,
	[aadhaar_number] [varchar](12) NULL,
	[pan_number] [varchar](10) NULL,
	[license_image] [varbinary](max) NULL,
	[license_expiry_date] [date] NULL,
	[aadhaar_image] [varbinary](max) NULL,
	[pan_image] [varbinary](max) NULL,
	CONSTRAINT [PK_DRIVER_MASTER] PRIMARY KEY CLUSTERED ([driver_id] ASC),
	CONSTRAINT [UQ_DRIVER_CONTACT] UNIQUE NONCLUSTERED ([driver_contact] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

PRINT 'Created DRIVER_MASTER_TEMP with manual driver_id'
GO

-- Copy data with manual ID conversion
INSERT INTO [dbo].[DRIVER_MASTER_TEMP] (
    driver_id, driver_name, driver_contact, driver_license,
    is_active, created_at, updated_at, qr_code_data,
    aadhaar_number, pan_number, license_image, license_expiry_date,
    aadhaar_image, pan_image
)
SELECT 
    'D' + RIGHT('000' + CAST(driver_id AS VARCHAR(3)), 3) AS driver_id,
    driver_name, driver_contact, driver_license,
    is_active, created_at, updated_at, qr_code_data,
    aadhaar_number, pan_number, license_image, license_expiry_date,
    aadhaar_image, pan_image
FROM [dbo].[DRIVER_MASTER]
GO

PRINT 'Copied data to DRIVER_MASTER_TEMP with manual IDs'
GO

-- Check data in temp table
SELECT COUNT(*) AS TempDrivers FROM [dbo].[DRIVER_MASTER_TEMP]
GO

SELECT TOP 3 driver_id, driver_name, driver_contact FROM [dbo].[DRIVER_MASTER_TEMP]
GO

-- Now you need to manually drop the old table and rename
-- Run these commands one by one:

-- Step 1: Drop any foreign key constraints (if they exist)
-- ALTER TABLE [dbo].[OTHER_TABLE] DROP CONSTRAINT [FK_NAME]
-- (Replace OTHER_TABLE and FK_NAME with actual names)

-- Step 2: Drop the old table
-- DROP TABLE [dbo].[DRIVER_MASTER]
-- GO

-- Step 3: Rename the temp table
-- EXEC sp_rename 'dbo.DRIVER_MASTER_TEMP', 'DRIVER_MASTER'
-- GO

-- Step 4: Recreate foreign key constraints (if needed)
-- ALTER TABLE [dbo].[OTHER_TABLE] ADD CONSTRAINT [FK_NAME] 
-- FOREIGN KEY (driver_id) REFERENCES [dbo].[DRIVER_MASTER](driver_id)
-- GO

-- Step 5: Add validation constraints
-- ALTER TABLE [dbo].[DRIVER_MASTER] WITH NOCHECK ADD CONSTRAINT [CK_DRIVER_AADHAAR] 
-- CHECK (([aadhaar_number] IS NULL OR len([aadhaar_number])=(12)))
-- GO

-- For now, let's just verify the temp table structure
PRINT 'TEMP TABLE READY FOR MANUAL DRIVER ID'
PRINT 'Run the manual steps above to complete the migration'
GO

-- Verify temp table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'DRIVER_MASTER_TEMP'
ORDER BY ORDINAL_POSITION;
GO

-- Show sample data in temp table
SELECT TOP 5 driver_id, driver_name, driver_contact, created_at 
FROM [dbo].[DRIVER_MASTER_TEMP] 
ORDER BY driver_id
GO

PRINT 'DRIVER_MASTER_TEMP is ready with manual driver_id format'
PRINT 'Manual steps required to complete migration:'
PRINT '1. Drop foreign key constraints (if any)'
PRINT '2. DROP TABLE [dbo].[DRIVER_MASTER]'
PRINT '3. EXEC sp_rename ''dbo.DRIVER_MASTER_TEMP'', ''DRIVER_MASTER'''
PRINT '4. Recreate foreign key constraints (if any)'
PRINT '5. Add validation constraints if needed'
GO
