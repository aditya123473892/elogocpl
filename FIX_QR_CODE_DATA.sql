-- Fix QR Code Data for Drivers
-- Database: fleet3
-- Created: 23-02-2026 13:03
-- Check and add QR code data for existing drivers

USE [fleet3]
GO

-- Check which drivers have QR code data
SELECT 
    driver_id, 
    driver_name, 
    driver_contact,
    CASE 
        WHEN qr_code_data IS NULL OR qr_code_data = '' THEN 'MISSING QR DATA'
        ELSE 'HAS QR DATA'
    END as qr_status
FROM [dbo].[DRIVER_MASTER]
ORDER BY driver_id
GO

-- Add QR code data for drivers that don't have it
UPDATE [dbo].[DRIVER_MASTER]
SET qr_code_data = 'DRIVER-' + driver_id + '-' + driver_name + '-' + driver_contact
WHERE qr_code_data IS NULL OR qr_code_data = ''
GO

PRINT 'Added QR code data for drivers that were missing it'
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

-- Check all drivers now have QR code data
SELECT 
    driver_id, 
    driver_name, 
    driver_contact,
    CASE 
        WHEN qr_code_data IS NULL OR qr_code_data = '' THEN 'MISSING QR DATA'
        ELSE 'HAS QR DATA'
    END as qr_status
FROM [dbo].[DRIVER_MASTER]
ORDER BY driver_id
GO

PRINT 'QR code data fix completed!'
PRINT 'All drivers should now have QR code data for QR generation'
GO
