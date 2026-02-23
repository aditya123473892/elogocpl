-- Fix DRIVER_MASTER Manual ID Migration Issues
-- Database: fleet3
-- Created: 23-02-2026 12:31
-- Fixes issues from previous migration

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
    is_nullable,
    system_type_name
FROM sys.columns 
WHERE object_id = OBJECT_ID('DRIVER_MASTER') AND name = 'driver_id'
GO

-- If driver_id is still IDENTITY, we need to fix it
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('DRIVER_MASTER') AND name = 'driver_id' AND is_identity = 1)
BEGIN
    PRINT 'driver_id is still IDENTITY - need to fix'
    
    -- Create a new table with correct structure
    CREATE TABLE [dbo].[DRIVER_MASTER_FIX](
        [driver_id] [int] NOT NULL,              -- Manual driver ID (no auto-increment)
        [driver_name] [varchar](100) NOT NULL,
        [driver_contact] [varchar](20) NOT NULL,
        [driver_license] [varchar](50) NULL,
        [is_active] [bit] NOT NULL,
        [created_at] [datetime] NOT NULL,
        [updated_at] [datetime] NULL,
        [qr_code_data] [varchar](255) NULL,
        [aadhaar_number] [varchar](12) NULL,
        [pan_number] [varchar](10) NULL,
        [license_image] [varbinary](max) NULL,
        [license_expiry_date] [date] NULL,
        [aadhaar_image] [varbinary](max) NULL,
        [pan_image] [varbinary](max) NULL,
        PRIMARY KEY CLUSTERED ([driver_id] ASC),
        UNIQUE NONCLUSTERED ([driver_contact] ASC)
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    GO
    
    -- Migrate data with manual IDs
    INSERT INTO [dbo].[DRIVER_MASTER_FIX] (
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
    
    -- Drop old table and rename
    DROP TABLE [dbo].[DRIVER_MASTER]
    GO
    EXEC sp_rename 'dbo.DRIVER_MASTER_FIX', 'DRIVER_MASTER'
    GO
    
    PRINT 'Fixed driver_id IDENTITY issue'
END
ELSE
BEGIN
    PRINT 'driver_id is already manual - checking other issues'
END
GO

-- Fix constraints issues
-- Drop existing constraints if they exist
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'CK_DRIVER_AADHAAR' AND type = 'C')
BEGIN
    ALTER TABLE [dbo].[DRIVER_MASTER] DROP CONSTRAINT [CK_DRIVER_AADHAAR]
    PRINT 'Dropped existing CK_DRIVER_AADHAAR constraint'
END
GO

IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'CK_DRIVER_LICENSE_EXPIRY' AND type = 'C')
BEGIN
    ALTER TABLE [dbo].[DRIVER_MASTER] DROP CONSTRAINT [CK_DRIVER_LICENSE_EXPIRY]
    PRINT 'Dropped existing CK_DRIVER_LICENSE_EXPIRY constraint'
END
GO

IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'CK_DRIVER_PAN' AND type = 'C')
BEGIN
    ALTER TABLE [dbo].[DRIVER_MASTER] DROP CONSTRAINT [CK_DRIVER_PAN']
    PRINT 'Dropped existing CK_DRIVER_PAN constraint'
END
GO

-- Fix default values issues
-- Drop existing defaults if they exist
IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('DRIVER_MASTER') AND parent_column_id = COL_ID('DRIVER_MASTER', 'is_active'))
BEGIN
    DECLARE @default_name sysname
    SELECT @default_name = name FROM sys.default_constraints 
    WHERE parent_object_id = OBJECT_ID('DRIVER_MASTER') AND parent_column_id = COL_ID('DRIVER_MASTER', 'is_active')
    EXEC('ALTER TABLE [dbo].[DRIVER_MASTER] DROP CONSTRAINT ' + @default_name)
    PRINT 'Dropped existing default for is_active'
END
GO

IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('DRIVER_MASTER') AND parent_column_id = COL_ID('DRIVER_MASTER', 'created_at'))
BEGIN
    DECLARE @default_name2 sysname
    SELECT @default_name2 = name FROM sys.default_constraints 
    WHERE parent_object_id = OBJECT_ID('DRIVER_MASTER') AND parent_column_id = COL_ID('DRIVER_MASTER', 'created_at')
    EXEC('ALTER TABLE [dbo].[DRIVER_MASTER] DROP CONSTRAINT ' + @default_name2)
    PRINT 'Dropped existing default for created_at'
END
GO

-- Add proper default values
ALTER TABLE [dbo].[DRIVER_MASTER] ADD DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[DRIVER_MASTER] ADD DEFAULT (getdate()) FOR [created_at]
GO
PRINT 'Added proper default values'
GO

-- Add proper constraints (fixing the syntax issues)
ALTER TABLE [dbo].[DRIVER_MASTER] WITH NOCHECK ADD CONSTRAINT [CK_DRIVER_AADHAAR] CHECK (([aadhaar_number] IS NULL OR len([aadhaar_number])=(12) AND [aadhaar_number] like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'))
GO
ALTER TABLE [dbo].[DRIVER_MASTER] CHECK CONSTRAINT [CK_DRIVER_AADHAAR]
GO

ALTER TABLE [dbo].[DRIVER_MASTER] WITH NOCHECK ADD CONSTRAINT [CK_DRIVER_LICENSE_EXPIRY] CHECK (([license_expiry_date] IS NULL OR [license_expiry_date]>=CONVERT([date],getdate())))
GO
ALTER TABLE [dbo].[DRIVER_MASTER] CHECK CONSTRAINT [CK_DRIVER_LICENSE_EXPIRY]
GO

ALTER TABLE [dbo].[DRIVER_MASTER] WITH NOCHECK ADD CONSTRAINT [CK_DRIVER_PAN] CHECK (([pan_number] IS NULL OR len([pan_number])=(10) AND [pan_number] like '[A-Z][A-Z][A-Z][A-Z][0-9][0-9][0-9][0-9][A-Z]'))
GO
ALTER TABLE [dbo].[DRIVER_MASTER] CHECK CONSTRAINT [CK_DRIVER_PAN]
GO
PRINT 'Added proper validation constraints'
GO

-- Add unique constraint for driver_id
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'UK_DRIVER_ID' AND type = 'UQ')
BEGIN
    ALTER TABLE [dbo].[DRIVER_MASTER] ADD CONSTRAINT [UK_DRIVER_ID] UNIQUE ([driver_id])
    PRINT 'Added unique constraint for driver_id'
END
GO

-- Verify final table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'DRIVER_MASTER'
ORDER BY ORDINAL_POSITION;
GO

-- Verify data
SELECT COUNT(*) AS TotalDrivers FROM [dbo].[DRIVER_MASTER]
GO

-- Show sample data with new manual IDs
SELECT TOP 5 driver_id, driver_name, driver_contact, created_at 
FROM [dbo].[DRIVER_MASTER] 
ORDER BY driver_id
GO

-- Check if driver_id is now manual
SELECT 
    name,
    is_identity,
    is_nullable,
    system_type_name
FROM sys.columns 
WHERE object_id = OBJECT_ID('DRIVER_MASTER') AND name = 'driver_id'
GO

PRINT 'DRIVER_MASTER table successfully fixed for manual driver_id'
PRINT 'driver_id is now a manual field (no IDENTITY)'
PRINT 'Existing data converted to manual format (D001, D002, etc.)'
GO
