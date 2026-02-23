-- Add new columns to DRIVER_MASTER table for enhanced driver information
USE [fleet3]
GO

-- Add Aadhaar number column (12-digit unique identification number)
ALTER TABLE [dbo].[DRIVER_MASTER] 
ADD [aadhaar_number] VARCHAR(12) NULL;
GO

-- Add PAN number column (10-digit permanent account number)
ALTER TABLE [dbo].[DRIVER_MASTER] 
ADD [pan_number] VARCHAR(10) NULL;
GO

-- Add license image column to store image as binary data
ALTER TABLE [dbo].[DRIVER_MASTER] 
ADD [license_image] VARBINARY(MAX) NULL;
GO

-- Add Aadhaar image column to store image as binary data
ALTER TABLE [dbo].[DRIVER_MASTER] 
ADD [aadhaar_image] VARBINARY(MAX) NULL;
GO

-- Add PAN image column to store image as binary data
ALTER TABLE [dbo].[DRIVER_MASTER] 
ADD [pan_image] VARBINARY(MAX) NULL;
GO

-- Add license expiry date column
ALTER TABLE [dbo].[DRIVER_MASTER] 
ADD [license_expiry_date] DATE NULL;
GO

-- Add constraints for data validation
-- Aadhaar number should be exactly 12 digits if provided
ALTER TABLE [dbo].[DRIVER_MASTER] 
ADD CONSTRAINT [CK_DRIVER_AADHAAR] 
CHECK ([aadhaar_number] IS NULL OR LEN([aadhaar_number]) = 12 AND [aadhaar_number] LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]');
GO

-- PAN number should be exactly 10 characters in format ABCDE1234F if provided
ALTER TABLE [dbo].[DRIVER_MASTER] 
ADD CONSTRAINT [CK_DRIVER_PAN] 
CHECK ([pan_number] IS NULL OR (LEN([pan_number]) = 10 AND [pan_number] LIKE '[A-Z][A-Z][A-Z][A-Z][A-Z][0-9][0-9][0-9][0-9][A-Z]'));
GO

-- License expiry date should be in the future if provided
ALTER TABLE [dbo].[DRIVER_MASTER] 
ADD CONSTRAINT [CK_DRIVER_LICENSE_EXPIRY] 
CHECK ([license_expiry_date] IS NULL OR [license_expiry_date] >= CAST(GETDATE() AS DATE));
GO

PRINT 'New columns added to DRIVER_MASTER table successfully'
GO

-- Show the updated table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'DRIVER_MASTER'
ORDER BY ORDINAL_POSITION;
GO

-- Test the new columns with sample data
UPDATE [dbo].[DRIVER_MASTER] 
SET 
    aadhaar_number = '123456789012',
    pan_number = 'ABCDE1234F',
    license_expiry_date = DATEADD(YEAR, 1, GETDATE())
WHERE driver_id = 1;
GO

-- Verify the update
SELECT 
    driver_id,
    driver_name,
    aadhaar_number,
    pan_number,
    license_expiry_date,
    CASE 
        WHEN license_image IS NOT NULL THEN 'License uploaded'
        ELSE 'No license image'
    END as license_image_status,
    CASE 
        WHEN aadhaar_image IS NOT NULL THEN 'Aadhaar uploaded'
        ELSE 'No Aadhaar image'
    END as aadhaar_image_status,
    CASE 
        WHEN pan_image IS NOT NULL THEN 'PAN uploaded'
        ELSE 'No PAN image'
    END as pan_image_status
FROM [dbo].[DRIVER_MASTER]
WHERE driver_id = 1;
GO

PRINT 'Sample data update completed'
GO
