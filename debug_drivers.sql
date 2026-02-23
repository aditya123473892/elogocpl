-- Debug: Check if there are any active drivers in the database
USE [fleet3]
GO

-- Check total drivers
SELECT COUNT(*) as total_drivers FROM DRIVER_MASTER
GO

-- Check active drivers
SELECT COUNT(*) as active_drivers FROM DRIVER_MASTER WHERE is_active = 1
GO

-- Show all drivers
SELECT driver_id, driver_name, driver_contact, is_active FROM DRIVER_MASTER
GO

-- Show recent drivers (last 5)
SELECT TOP 5 driver_id, driver_name, driver_contact, is_active, created_at 
FROM DRIVER_MASTER 
ORDER BY created_at DESC
GO
