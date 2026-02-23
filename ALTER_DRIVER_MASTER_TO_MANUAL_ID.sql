-- ALTER DRIVER_MASTER Table to Manual Driver ID
-- Database: fleet3
-- Created: 23-02-2026 12:29
-- Updates existing table to use manual driver ID instead of auto-increment

USE [fleet3]
GO

-- Step 1: Drop existing IDENTITY property from driver_id
-- This requires recreating the table with manual driver_id

-- First, create a backup of existing data
SELECT * INTO [dbo].[DRIVER_MASTER_BACKUP] FROM [dbo].[DRIVER_MASTER]
GO

PRINT 'Backup of DRIVER_MASTER created as DRIVER_MASTER_BACKUP'
GO

-- Step 2: Drop all foreign key constraints referencing DRIVER_MASTER (if any)
-- (Add this if there are foreign keys from other tables)

-- Step 3: Drop constraints on DRIVER_MASTER table
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'UK_DRIVER_ID' AND type = 'UQ')
BEGIN
    ALTER TABLE [dbo].[DRIVER_MASTER] DROP CONSTRAINT [UK_DRIVER_ID]
    PRINT 'Dropped UK_DRIVER_ID constraint'
END
GO

IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'CK_DRIVER_AADHAAR' AND type = 'C')
BEGIN
    ALTER TABLE [dbo].[DRIVER_MASTER] DROP CONSTRAINT [CK_DRIVER_AADHAAR]
    PRINT 'Dropped CK_DRIVER_AADHAAR constraint'
END
GO

IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'CK_DRIVER_LICENSE_EXPIRY' AND type = 'C')
BEGIN
    ALTER TABLE [dbo].[DRIVER_MASTER] DROP CONSTRAINT [CK_DRIVER_LICENSE_EXPIRY]
    PRINT 'Dropped CK_DRIVER_LICENSE_EXPIRY constraint'
END
GO

IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'CK_DRIVER_PAN' AND type = 'C')
BEGIN
    ALTER TABLE [dbo].[DRIVER_MASTER] DROP CONSTRAINT [CK_DRIVER_PAN]
    PRINT 'Dropped CK_DRIVER_PAN constraint'
END
GO

-- Step 4: Drop unique constraint on driver_contact
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'UQ__DRIVER_M__7B6135EC' AND type = 'UQ')
BEGIN
    ALTER TABLE [dbo].[DRIVER_MASTER] DROP CONSTRAINT [UQ__DRIVER_M__7B6135EC]
    PRINT 'Dropped unique constraint on driver_contact'
END
GO

-- Step 5: Create a new table with manual driver_id
CREATE TABLE [dbo].[DRIVER_MASTER_NEW](
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
PRIMARY KEY CLUSTERED 
	(
		[driver_id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
	UNIQUE NONCLUSTERED 
	(
		[driver_contact] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

PRINT 'Created new DRIVER_MASTER_NEW table with manual driver_id'
GO

-- Step 6: Migrate data from old table to new table
-- Convert existing auto-increment IDs to manual IDs (e.g., 1 -> 'D001', 2 -> 'D002')
INSERT INTO [dbo].[DRIVER_MASTER_NEW] (
    driver_id,
    driver_name,
    driver_contact,
    driver_license,
    is_active,
    created_at,
    updated_at,
    qr_code_data,
    aadhaar_number,
    pan_number,
    license_image,
    license_expiry_date,
    aadhaar_image,
    pan_image
)
SELECT 
    'D' + RIGHT('000' + CAST(driver_id AS VARCHAR(3)), 3) AS driver_id,  -- Convert 1->D001, 2->D002, etc.
    driver_name,
    driver_contact,
    driver_license,
    is_active,
    created_at,
    updated_at,
    qr_code_data,
    aadhaar_number,
    pan_number,
    license_image,
    license_expiry_date,
    aadhaar_image,
    pan_image
FROM [dbo].[DRIVER_MASTER]
GO

PRINT 'Migrated data from DRIVER_MASTER to DRIVER_MASTER_NEW'
GO

-- Step 7: Drop the old table
DROP TABLE [dbo].[DRIVER_MASTER]
GO

PRINT 'Dropped old DRIVER_MASTER table'
GO

-- Step 8: Rename the new table to DRIVER_MASTER
EXEC sp_rename 'dbo.DRIVER_MASTER_NEW', 'DRIVER_MASTER'
GO

PRINT 'Renamed DRIVER_MASTER_NEW to DRIVER_MASTER'
GO

-- Step 9: Add default values
ALTER TABLE [dbo].[DRIVER_MASTER] ADD DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[DRIVER_MASTER] ADD DEFAULT (getdate()) FOR [created_at]
GO

PRINT 'Added default values'
GO

-- Step 10: Add constraints for data validation
ALTER TABLE [dbo].[DRIVER_MASTER] WITH CHECK ADD CONSTRAINT [CK_DRIVER_AADHAAR] CHECK (([aadhaar_number] IS NULL OR len([aadhaar_number])=(12) AND [aadhaar_number] like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'))
GO
ALTER TABLE [dbo].[DRIVER_MASTER] CHECK CONSTRAINT [CK_DRIVER_LICENSE_EXPIRY] CHECK (([license_expiry_date] IS NULL OR [license_expiry_date]>=CONVERT([date],getdate())))
GO
ALTER TABLE [dbo].[DRIVER_MASTER] WITH CHECK ADD CONSTRAINT [CK_DRIVER_PAN] CHECK (([pan_number] IS NULL OR len([pan_number])=(10) AND [pan_number] like '[A-Z][A-Z][A-Z][A-Z][0-9][0-9][0-9][0-9][A-Z]'))
GO

PRINT 'Added data validation constraints'
GO

-- Step 11: Add unique constraint for driver_id (since it's manual now)
ALTER TABLE [dbo].[DRIVER_MASTER] ADD CONSTRAINT [UK_DRIVER_ID] UNIQUE ([driver_id])
GO

PRINT 'Added unique constraint for driver_id'
GO

-- Step 12: Verify table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'DRIVER_MASTER'
ORDER BY ORDINAL_POSITION;
GO

-- Step 13: Verify data migration
SELECT COUNT(*) AS TotalDrivers FROM [dbo].[DRIVER_MASTER]
GO

-- Step 14: Show sample data
SELECT TOP 5 driver_id, driver_name, driver_contact, created_at 
FROM [dbo].[DRIVER_MASTER] 
ORDER BY driver_id
GO

PRINT 'DRIVER_MASTER table successfully updated to manual driver_id'
PRINT 'Existing auto-increment IDs converted to manual format (D001, D002, etc.)'
GO
