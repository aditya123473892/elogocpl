-- Check DRIVER_MASTER Table Status
-- Database: fleet3
-- Created: 23-02-2026 13:02

USE [fleet3]
GO

-- Check if table exists
IF OBJECT_ID('dbo.DRIVER_MASTER') IS NOT NULL
BEGIN
    PRINT 'DRIVER_MASTER table exists'
    
    -- Check table structure
    SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'DRIVER_MASTER'
    ORDER BY ORDINAL_POSITION;
    GO
    
    -- Check if driver_id is manual (not IDENTITY)
    SELECT 
        name,
        is_identity,
        is_nullable,
        TYPE_NAME(user_type_id) AS data_type
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('DRIVER_MASTER') AND name = 'driver_id'
    GO
    
    -- Check if there are any drivers
    SELECT COUNT(*) AS TotalDrivers FROM [dbo].[DRIVER_MASTER]
    GO
    
    -- Show all drivers if any exist
    IF EXISTS (SELECT 1 FROM [dbo].[DRIVER_MASTER])
    BEGIN
        SELECT driver_id, driver_name, driver_contact, created_at 
        FROM [dbo].[DRIVER_MASTER] 
        ORDER BY created_at DESC
    END
    ELSE
    BEGIN
        PRINT 'No drivers found in DRIVER_MASTER table'
    END
    GO
    
    -- Try to find driver VB21 specifically
    SELECT * FROM [dbo].[DRIVER_MASTER] WHERE driver_id = 'VB21'
    GO
    
END
ELSE
BEGIN
    PRINT 'DRIVER_MASTER table does not exist'
END
GO
