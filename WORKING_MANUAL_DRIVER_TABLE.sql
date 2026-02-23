-- WORKING Manual Driver Table - Simple and Clean
-- Database: fleet3
-- Created: 23-02-2026 12:51

USE [fleet3]
GO

-- Just create the table - simple approach
CREATE TABLE [dbo].[DRIVER_MASTER](
	[driver_id] [varchar](20) NOT NULL,
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
 CONSTRAINT [PK_DRIVER_MASTER] PRIMARY KEY CLUSTERED ([driver_id] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

PRINT 'DRIVER_MASTER table created successfully'
GO

-- Add unique constraint for contact
ALTER TABLE [dbo].[DRIVER_MASTER] ADD CONSTRAINT [UQ_DRIVER_CONTACT] UNIQUE ([driver_contact])
GO

PRINT 'Added unique constraint for driver_contact'
GO

-- Test the table
INSERT INTO [dbo].[DRIVER_MASTER] (driver_id, driver_name, driver_contact, driver_license)
VALUES ('DE01', 'Test Driver', '9876543210', 'DL-TEST123')
GO

PRINT 'Test insert successful'
GO

-- Verify
SELECT * FROM [dbo].[DRIVER_MASTER] WHERE driver_id = 'DE01'
GO

PRINT 'Table is ready for manual driver IDs!'
GO
