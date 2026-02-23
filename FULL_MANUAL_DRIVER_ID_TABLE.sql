-- FULL DRIVER_MASTER Table with Manual Driver ID
-- Database: fleet3
-- Created: 23-02-2026 12:39
-- Complete table creation script - copy and paste ready

USE [fleet3]
GO

-- Drop existing table if it exists
IF OBJECT_ID('dbo.DRIVER_MASTER') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[DRIVER_MASTER]
    PRINT 'Dropped existing DRIVER_MASTER table'
END
GO

-- Create DRIVER_MASTER table with manual driver ID
CREATE TABLE [dbo].[DRIVER_MASTER](
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
 CONSTRAINT [PK_DRIVER_MASTER] PRIMARY KEY CLUSTERED 
(
	[driver_id] ASC
) ON [PRIMARY],
 CONSTRAINT [UQ_DRIVER_MASTER_driver_contact] UNIQUE NONCLUSTERED 
(
	[driver_contact] ASC
) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

PRINT 'DRIVER_MASTER table created with manual driver_id'
GO

-- Add default values
ALTER TABLE [dbo].[DRIVER_MASTER] ADD DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[DRIVER_MASTER] ADD DEFAULT (getdate()) FOR [created_at]
GO

PRINT 'Added default values'
GO

-- Add validation constraints
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

PRINT 'Added validation constraints'
GO

-- Add unique constraint for driver_id (since it's manual now)
ALTER TABLE [dbo].[DRIVER_MASTER] ADD CONSTRAINT [UK_DRIVER_ID] UNIQUE ([driver_id])
GO

PRINT 'Added unique constraint for driver_id'
GO

-- Verify table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'DRIVER_MASTER'
ORDER BY ORDINAL_POSITION;
GO

-- Check if driver_id is manual
SELECT 
    name,
    is_identity,
    is_nullable,
    TYPE_NAME(user_type_id) AS data_type
FROM sys.columns 
WHERE object_id = OBJECT_ID('DRIVER_MASTER') AND name = 'driver_id'
GO

-- Sample insert for testing
INSERT INTO [dbo].[DRIVER_MASTER] (
    driver_id,
    driver_name,
    driver_contact,
    driver_license,
    aadhaar_number,
    pan_number,
    license_expiry_date,
    is_active
) 
VALUES 
(
    'DE01',                    -- Manual driver ID
    'Test Driver',
    '9876543210',
    'DL-TEST123456',
    '123456789012',
    'ABCDE1234F',
    DATEADD(YEAR, 2, GETDATE()),
    1
);
GO

PRINT 'Sample driver inserted with manual ID: DE01'
GO

-- Verify insert
SELECT * FROM [dbo].[DRIVER_MASTER] WHERE driver_name = 'Test Driver';
GO

-- Test another manual ID format
INSERT INTO [dbo].[DRIVER_MASTER] (
    driver_id,
    driver_name,
    driver_contact,
    driver_license,
    is_active
) 
VALUES 
(
    'DRIVER001',              -- Another manual ID format
    'Second Driver',
    '9876543211',
    'DL-SECOND789',
    1
);
GO

PRINT 'Second driver inserted with manual ID: DRIVER001'
GO

-- Show all drivers
SELECT driver_id, driver_name, driver_contact, created_at 
FROM [dbo].[DRIVER_MASTER] 
ORDER BY driver_id
GO

PRINT 'DRIVER_MASTER table ready for manual driver IDs!'
PRINT 'Features:'
PRINT '- Manual driver_id field (no auto-increment)'
PRINT '- Unique constraint on driver_id'
PRINT '- Validation for Aadhaar (12 digits), PAN (10 chars), license expiry'
PRINT '- Support for all image types (license, Aadhaar, PAN)'
PRINT '- Default values for is_active (1) and created_at (current date)'
GO
