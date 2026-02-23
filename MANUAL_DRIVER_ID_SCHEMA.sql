-- DRIVER_MASTER Table Creation Script with Manual Driver ID
-- Database: fleet3
-- Created: 23-02-2026 12:15
-- Updated to use manual driver ID assignment instead of auto-increment

USE [fleet3]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Drop existing DRIVER_MASTER table if it exists
IF OBJECT_ID('dbo.DRIVER_MASTER') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[DRIVER_MASTER]
    PRINT 'Existing DRIVER_MASTER table dropped'
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

-- Add default values
ALTER TABLE [dbo].[DRIVER_MASTER] ADD DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[DRIVER_MASTER] ADD DEFAULT (getdate()) FOR [created_at]
GO

-- Add constraints for data validation
ALTER TABLE [dbo].[DRIVER_MASTER] WITH CHECK ADD CONSTRAINT [CK_DRIVER_AADHAAR] CHECK (([aadhaar_number] IS NULL OR len([aadhaar_number])=(12) AND [aadhaar_number] like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'))
GO
ALTER TABLE [dbo].[DRIVER_MASTER] CHECK CONSTRAINT [CK_DRIVER_LICENSE_EXPIRY] CHECK (([license_expiry_date] IS NULL OR [license_expiry_date]>=CONVERT([date],getdate())))
GO
ALTER TABLE [dbo].[DRIVER_MASTER] WITH CHECK ADD CONSTRAINT [CK_DRIVER_PAN] CHECK (([pan_number] IS NULL OR len([pan_number])=(10) AND [pan_number] like '[A-Z][A-Z][A-Z][A-Z][0-9][0-9][0-9][0-9][A-Z]'))
GO

-- Add unique constraint for driver_id (since it's manual now)
ALTER TABLE [dbo].[DRIVER_MASTER] ADD CONSTRAINT [UK_DRIVER_ID] UNIQUE ([driver_id])
GO

PRINT 'DRIVER_MASTER table created with manual driver ID assignment'
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
