-- SIMPLEST DRIVER TABLE - Just the Basics
-- Database: fleet3

USE [fleet3]
GO

-- Create table with minimal constraints
CREATE TABLE [dbo].[DRIVER_MASTER](
	[driver_id] [varchar](20) PRIMARY KEY,
	[driver_name] [varchar](100) NOT NULL,
	[driver_contact] [varchar](20) NOT NULL,
	[driver_license] [varchar](50) NULL,
	[is_active] [bit] DEFAULT 1,
	[created_at] [datetime] DEFAULT GETDATE(),
	[updated_at] [datetime] NULL,
	[qr_code_data] [varchar](255) NULL,
	[aadhaar_number] [varchar](12) NULL,
	[pan_number] [varchar](10) NULL,
	[license_image] [varbinary](max) NULL,
	[license_expiry_date] [date] NULL,
	[aadhaar_image] [varbinary](max) NULL,
	[pan_image] [varbinary](max) NULL
)
GO

-- Test it
INSERT INTO [dbo].[DRIVER_MASTER] (driver_id, driver_name, driver_contact)
VALUES ('DE01', 'Test Driver', '9876543210')
GO

-- Check if it worked
SELECT * FROM [dbo].[DRIVER_MASTER]
GO
