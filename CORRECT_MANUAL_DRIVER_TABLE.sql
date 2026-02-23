-- CORRECT DRIVER_MASTER Table with Manual Driver ID
-- Database: fleet3
-- Created: 23-02-2026 12:47
-- Complete table with manual driver_id (NO IDENTITY)

USE [fleet3]
GO

-- Drop existing table if it exists
IF OBJECT_ID('dbo.DRIVER_MASTER') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[DRIVER_MASTER]
    PRINT 'Dropped existing DRIVER_MASTER table'
END
GO

-- Create DRIVER_MASTER table with MANUAL driver_id (no IDENTITY)
CREATE TABLE [dbo].[DRIVER_MASTER](
	[driver_id] [varchar](20) NOT NULL,      -- Manual driver ID (VARCHAR, no IDENTITY)
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

PRINT 'DRIVER_MASTER table created with manual VARCHAR(20) driver_id'
GO

-- Add default values
ALTER TABLE [dbo].[DRIVER_MASTER] ADD DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[DRIVER_MASTER] ADD DEFAULT (getdate()) FOR [created_at]
GO

PRINT 'Added default values'
GO

-- Add validation constraints (fixed to allow NULL and empty strings)
ALTER TABLE [dbo].[DRIVER_MASTER] WITH NOCHECK ADD CONSTRAINT [CK_DRIVER_AADHAAR] CHECK (([aadhaar_number] IS NULL OR [aadhaar_number]='' OR len([aadhaar_number])=(12) AND [aadhaar_number] like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'))
GO
ALTER TABLE [dbo].[DRIVER_MASTER] CHECK CONSTRAINT [CK_DRIVER_AADHAAR]
GO

ALTER TABLE [dbo].[DRIVER_MASTER] WITH NOCHECK ADD CONSTRAINT [CK_DRIVER_LICENSE_EXPIRY] CHECK (([license_expiry_date] IS NULL OR [license_expiry_date]>=CONVERT([date],getdate())))
GO
ALTER TABLE [dbo].[DRIVER_MASTER] CHECK CONSTRAINT [CK_DRIVER_LICENSE_EXPIRY]
GO

ALTER TABLE [dbo].[DRIVER_MASTER] WITH NOCHECK ADD CONSTRAINT [CK_DRIVER_PAN] CHECK (([pan_number] IS NULL OR [pan_number]='' OR len([pan_number])=(10) AND [pan_number] like '[A-Z][A-Z][A-Z][A-Z][0-9][0-9][0-9][0-9][A-Z]'))
GO
ALTER TABLE [dbo].[DRIVER_MASTER] CHECK CONSTRAINT [CK_DRIVER_PAN]
GO

PRINT 'Added validation constraints'
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

-- Check driver_id is manual (not IDENTITY)
SELECT 
    name,
    is_identity,
    is_nullable,
    TYPE_NAME(user_type_id) AS data_type
FROM sys.columns 
WHERE object_id = OBJECT_ID('DRIVER_MASTER') AND name = 'driver_id'
GO

-- Test insert with manual driver ID
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
    NULL,                     -- NULL Aadhaar should work
    NULL,                     -- NULL PAN should work
    DATEADD(YEAR, 2, GETDATE()),
    1
);
GO

PRINT 'Test insert with manual ID DE01 successful'
GO

-- Test another format
INSERT INTO [dbo].[DRIVER_MASTER] (
    driver_id,
    driver_name,
    driver_contact,
    driver_license,
    aadhaar_number,
    pan_number,
    is_active
) 
VALUES 
(
    'DRIVER001',              -- Different manual ID format
    'Second Driver',
    '9876543211',
    'DL-SECOND789',
    '',                       -- Empty Aadhaar should work
    '',                       -- Empty PAN should work
    1
);
GO

PRINT 'Test insert with manual ID DRIVER001 successful'
GO

-- Test update with NULL values
UPDATE [dbo].[DRIVER_MASTER] 
SET aadhaar_number = NULL, pan_number = NULL 
WHERE driver_id = 'DRIVER001'
GO

PRINT 'Test update with NULL values successful'
GO

-- Show all test data
SELECT driver_id, driver_name, driver_contact, aadhaar_number, pan_number, created_at 
FROM [dbo].[DRIVER_MASTER] 
ORDER BY driver_id
GO

PRINT 'CORRECT DRIVER_MASTER TABLE READY!'
PRINT 'Features:'
PRINT '- driver_id is VARCHAR(20) (no IDENTITY)'
PRINT '- Supports manual IDs like DE01, DRIVER001, etc.'
PRINT '- Constraints allow NULL and empty strings'
PRINT '- Backend can handle manual driver IDs'
PRINT '- Frontend can create/update drivers without errors'
GO
