-- CLEAN Manual Driver Table Creation
-- Database: fleet3
-- Created: 23-02-2026 12:48
-- Properly handles foreign keys and creates clean manual driver table

USE [fleet3]
GO

-- Step 1: Find and drop foreign key constraints
PRINT 'Checking for foreign key constraints...'
GO

DECLARE @sql NVARCHAR(MAX) = '';
SELECT @sql = @sql + 'ALTER TABLE [' + OBJECT_SCHEMA_NAME(parent_object_id) + '].[' + OBJECT_NAME(parent_object_id) + '] DROP CONSTRAINT [' + name + '];' + CHAR(13)
FROM sys.foreign_keys
WHERE referenced_object_id = OBJECT_ID('DRIVER_MASTER');

IF LEN(@sql) > 0
BEGIN
    PRINT 'Dropping foreign key constraints...'
    EXEC sp_executesql @sql;
    PRINT 'Foreign key constraints dropped'
END
ELSE
BEGIN
    PRINT 'No foreign key constraints found'
END
GO

-- Step 2: Drop the table completely
IF OBJECT_ID('dbo.DRIVER_MASTER') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[DRIVER_MASTER]
    PRINT 'Dropped DRIVER_MASTER table'
END
GO

-- Step 3: Create clean table with manual driver_id
CREATE TABLE [dbo].[DRIVER_MASTER](
	[driver_id] [varchar](20) NOT NULL,      -- Manual driver ID (VARCHAR, no IDENTITY)
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

PRINT 'Clean DRIVER_MASTER table created with manual VARCHAR(20) driver_id'
GO

-- Step 4: Add validation constraints (fixed to allow NULL and empty strings)
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

-- Step 5: Verify table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'DRIVER_MASTER'
ORDER BY ORDINAL_POSITION;
GO

-- Step 6: Check driver_id is manual (not IDENTITY)
SELECT 
    name,
    is_identity,
    is_nullable,
    TYPE_NAME(user_type_id) AS data_type
FROM sys.columns 
WHERE object_id = OBJECT_ID('DRIVER_MASTER') AND name = 'driver_id'
GO

-- Step 7: Test insert with manual driver ID
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

-- Step 8: Test another format
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

-- Step 9: Test update with NULL values
UPDATE [dbo].[DRIVER_MASTER] 
SET aadhaar_number = NULL, pan_number = NULL 
WHERE driver_id = 'DRIVER001'
GO

PRINT 'Test update with NULL values successful'
GO

-- Step 10: Show all test data
SELECT driver_id, driver_name, driver_contact, aadhaar_number, pan_number, created_at 
FROM [dbo].[DRIVER_MASTER] 
ORDER BY driver_id
GO

PRINT 'CLEAN MANUAL DRIVER TABLE READY!'
PRINT 'Features:'
PRINT '- driver_id is VARCHAR(20) (no IDENTITY)'
PRINT '- Supports manual IDs like DE01, DRIVER001, etc.'
PRINT '- Constraints allow NULL and empty strings'
PRINT '- Backend can handle manual driver IDs'
PRINT '- Frontend can create/update drivers without errors'
GO

-- Step 11: Recreate foreign key constraints if needed
-- You'll need to manually recreate any foreign key constraints that were dropped
-- Example:
-- ALTER TABLE [dbo].[VEHICLE_MASTER] ADD CONSTRAINT [FK_VEHICLE_DRIVER] 
-- FOREIGN KEY (current_driver_id) REFERENCES [dbo].[DRIVER_MASTER](driver_id)
-- GO

PRINT 'If you had foreign key constraints, you need to recreate them manually'
PRINT 'Example: ALTER TABLE [VEHICLE_MASTER] ADD CONSTRAINT [FK_VEHICLE_DRIVER] FOREIGN KEY (current_driver_id) REFERENCES [dbo].[DRIVER_MASTER](driver_id)'
GO
