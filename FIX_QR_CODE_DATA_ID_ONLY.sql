-- Fix QR Code Data - Driver ID Only
-- Database: fleet3
-- Created: 23-02-2026 13:05
-- Update QR code data to only contain driver ID

USE [fleet3]
GO

-- Check current QR code data
SELECT 
    driver_id, 
    driver_name, 
    driver_contact,
    qr_code_data
FROM [dbo].[DRIVER_MASTER]
ORDER BY driver_id
GO

-- Update QR code data to only contain driver ID
UPDATE [dbo].[DRIVER_MASTER]
SET qr_code_data = driver_id
WHERE qr_code_data IS NULL OR qr_code_data = '' OR qr_code_data LIKE 'DRIVER-%'
GO

PRINT 'Updated QR code data to only contain driver ID'
GO

-- Verify the fix
SELECT 
    driver_id, 
    driver_name, 
    driver_contact,
    qr_code_data
FROM [dbo].[DRIVER_MASTER]
WHERE driver_id = 'VB21'
GO

-- Check all drivers now have correct QR code data
SELECT 
    driver_id, 
    driver_name, 
    driver_contact,
    qr_code_data
FROM [dbo].[DRIVER_MASTER]
ORDER BY driver_id
GO

PRINT 'QR code data updated to driver ID only!'
PRINT 'QR codes will now contain only the driver ID (e.g., "VB21")'
GO
