-- Change DRIVER_MASTER to Manual ID - No Data Copy
-- Database: fleet3
-- Created: 23-02-2026 12:38
-- Simply changes driver_id from IDENTITY to manual field

USE [fleet3]
GO

-- Check current driver_id status
SELECT 
    name,
    is_identity,
    is_nullable,
    TYPE_NAME(user_type_id) AS data_type
FROM sys.columns 
WHERE object_id = OBJECT_ID('DRIVER_MASTER') AND name = 'driver_id'
GO

-- Step 1: Create a new table with manual driver_id
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

PRINT 'Created DRIVER_MASTER_NEW with manual driver_id'
GO

-- Step 2: Add default values
ALTER TABLE [dbo].[DRIVER_MASTER_NEW] ADD DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[DRIVER_MASTER_NEW] ADD DEFAULT (getdate()) FOR [created_at]
GO

PRINT 'Added default values to DRIVER_MASTER_NEW'
GO

-- Step 3: Add validation constraints
ALTER TABLE [dbo].[DRIVER_MASTER_NEW] WITH NOCHECK ADD CONSTRAINT [CK_DRIVER_AADHAAR] CHECK (([aadhaar_number] IS NULL OR len([aadhaar_number])=(12) AND [aadhaar_number] like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'))
GO
ALTER TABLE [dbo].[DRIVER_MASTER_NEW] CHECK CONSTRAINT [CK_DRIVER_AADHAAR]
GO

ALTER TABLE [dbo].[DRIVER_MASTER_NEW] WITH NOCHECK ADD CONSTRAINT [CK_DRIVER_LICENSE_EXPIRY] CHECK (([license_expiry_date] IS NULL OR [license_expiry_date]>=CONVERT([date],getdate())))
GO
ALTER TABLE [dbo].[DRIVER_MASTER_NEW] CHECK CONSTRAINT [CK_DRIVER_LICENSE_EXPIRY]
GO

ALTER TABLE [dbo].[DRIVER_MASTER_NEW] WITH NOCHECK ADD CONSTRAINT [CK_DRIVER_PAN] CHECK (([pan_number] IS NULL OR len([pan_number])=(10) AND [pan_number] like '[A-Z][A-Z][A-Z][A-Z][0-9][0-9][0-9][0-9][A-Z]'))
GO
ALTER TABLE [dbo].[DRIVER_MASTER_NEW] CHECK CONSTRAINT [CK_DRIVER_PAN]
GO

PRINT 'Added validation constraints to DRIVER_MASTER_NEW'
GO

-- Step 4: Manual replacement steps
PRINT 'MANUAL STEPS REQUIRED:'
PRINT '1. DROP TABLE [dbo].[DRIVER_MASTER]'
PRINT '2. EXEC sp_rename ''dbo.DRIVER_MASTER_NEW'', ''DRIVER_MASTER'''
PRINT '3. Your table will now have manual driver_id'
PRINT '4. Frontend can now use manual driver IDs'
GO

-- Verify the new table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'DRIVER_MASTER_NEW'
ORDER BY ORDINAL_POSITION;
GO

-- Check if driver_id is manual in new table
SELECT 
    name,
    is_identity,
    is_nullable,
    TYPE_NAME(user_type_id) AS data_type
FROM sys.columns 
WHERE object_id = OBJECT_ID('DRIVER_MASTER_NEW') AND name = 'driver_id'
GO

PRINT 'DRIVER_MASTER_NEW is ready with manual driver_id'
PRINT 'Run the manual steps above to complete the change'
GO
