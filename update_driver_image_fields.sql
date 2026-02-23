-- Queries to update driver with image upload and other fields
USE [fleet3]
GO

-- Update driver with license image (binary data will come from application)
-- This is typically handled by the application, but here's the SQL structure
UPDATE [dbo].[DRIVER_MASTER]
SET 
    license_image = CONVERT(VARBINARY(MAX), 0x89504E470D0A1A0A0000000D4948445200000001000000010802000000907753DE0000000C4944415478DA6300010000050001F9A5E6E20000000049454E44AE426082), -- Example binary data
    aadhaar_number = '123456789012',
    pan_number = 'ABCDE1234F',
    license_expiry_date = '2025-12-31'
WHERE driver_id = 1;
GO

-- Update only specific fields
UPDATE [dbo].[DRIVER_MASTER]
SET 
    aadhaar_number = '987654321098',
    pan_number = 'FGHIJ5678K'
WHERE driver_id = 2;
GO

-- Update only license expiry
UPDATE [dbo].[DRIVER_MASTER]
SET 
    license_expiry_date = DATEADD(YEAR, 3, GETDATE())
WHERE driver_id = 3;
GO

-- Clear license image (set to NULL)
UPDATE [dbo].[DRIVER_MASTER]
SET 
    license_image = NULL
WHERE driver_id = 4;
GO

-- Check drivers with expiring licenses (within 30 days)
SELECT 
    driver_id,
    driver_name,
    driver_contact,
    license_expiry_date,
    DATEDIFF(DAY, GETDATE(), license_expiry_date) as days_until_expiry,
    CASE 
        WHEN DATEDIFF(DAY, GETDATE(), license_expiry_date) <= 30 THEN 'Expiring Soon'
        WHEN DATEDIFF(DAY, GETDATE(), license_expiry_date) < 0 THEN 'Expired'
        ELSE 'Valid'
    END as license_status
FROM [dbo].[DRIVER_MASTER]
WHERE license_expiry_date IS NOT NULL
ORDER BY license_expiry_date ASC;
GO

-- Check drivers with missing documents
SELECT 
    driver_id,
    driver_name,
    driver_contact,
    CASE 
        WHEN aadhaar_number IS NULL THEN 'Missing'
        ELSE 'Provided'
    END as aadhaar_status,
    CASE 
        WHEN pan_number IS NULL THEN 'Missing'
        ELSE 'Provided'
    END as pan_status,
    CASE 
        WHEN license_image IS NULL THEN 'Missing'
        ELSE 'Uploaded'
    END as license_image_status,
    CASE 
        WHEN license_expiry_date IS NULL THEN 'Missing'
        ELSE 'Provided'
    END as license_expiry_status
FROM [dbo].[DRIVER_MASTER]
WHERE 
    aadhaar_number IS NULL OR 
    pan_number IS NULL OR 
    license_image IS NULL OR 
    license_expiry_date IS NULL
ORDER BY driver_name;
GO

PRINT 'Driver update operations completed'
GO
