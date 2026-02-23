-- Insert new driver with all enhanced fields including image binary data
USE [fleet3]
GO

-- Example of inserting a new driver with all fields
INSERT INTO [dbo].[DRIVER_MASTER] (
    driver_name,
    driver_contact,
    driver_license,
    aadhaar_number,
    pan_number,
    license_image,
    license_expiry_date,
    is_active
) 
VALUES 
(
    'New Test Driver',
    '9876543210',
    'DL-NEW123456',
    '987654321012',                    -- 12-digit Aadhaar number
    'PQRST5678M',                      -- 10-digit PAN number
    NULL,                               -- License image (binary data - will be uploaded via application)
    DATEADD(YEAR, 2, GETDATE()),       -- License expiry 2 years from now
    1                                   -- Active status
);
GO

-- Another example with minimal required fields
INSERT INTO [dbo].[DRIVER_MASTER] (
    driver_name,
    driver_contact,
    driver_license,
    is_active
) 
VALUES 
(
    'Minimal Driver',
    '9998887776',
    'DL-MIN789012',
    1
);
GO

-- Show all drivers with new fields
SELECT 
    driver_id,
    driver_name,
    driver_contact,
    driver_license,
    aadhaar_number,
    pan_number,
    license_expiry_date,
    CASE 
        WHEN license_image IS NOT NULL THEN 'Image uploaded'
        ELSE 'No image'
    END as license_image_status,
    is_active,
    created_at
FROM [dbo].[DRIVER_MASTER]
ORDER BY driver_id DESC;
GO

PRINT 'Driver insertion examples completed'
GO
