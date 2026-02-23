-- Fix Driver ID Data Type - Change INT to VARCHAR
-- Database: fleet3
-- Created: 23-02-2026 12:43
-- Changes driver_id from INT to VARCHAR to support manual IDs like "DE01"

USE [fleet3]
GO

-- Check current driver_id data type
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'DRIVER_MASTER' AND COLUMN_NAME = 'driver_id'
GO

-- Drop constraints that reference driver_id
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'UK_DRIVER_ID' AND type = 'UQ')
BEGIN
    ALTER TABLE [dbo].[DRIVER_MASTER] DROP CONSTRAINT [UK_DRIVER_ID]
    PRINT 'Dropped UK_DRIVER_ID constraint'
END
GO

IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'PK_DRIVER_MASTER' AND type = 'PK')
BEGIN
    ALTER TABLE [dbo].[DRIVER_MASTER] DROP CONSTRAINT [PK_DRIVER_MASTER]
    PRINT 'Dropped PK_DRIVER_MASTER constraint'
END
GO

-- Change driver_id data type from INT to VARCHAR(20)
ALTER TABLE [dbo].[DRIVER_MASTER] ALTER COLUMN [driver_id] VARCHAR(20) NOT NULL
GO

PRINT 'Changed driver_id from INT to VARCHAR(20)'
GO

-- Recreate primary key constraint
ALTER TABLE [dbo].[DRIVER_MASTER] ADD CONSTRAINT [PK_DRIVER_MASTER] PRIMARY KEY CLUSTERED ([driver_id] ASC)
GO

PRINT 'Recreated primary key constraint'
GO

-- Recreate unique constraint for driver_id
ALTER TABLE [dbo].[DRIVER_MASTER] ADD CONSTRAINT [UK_DRIVER_ID] UNIQUE ([driver_id])
GO

PRINT 'Recreated unique constraint for driver_id'
GO

-- Verify the change
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'DRIVER_MASTER' AND COLUMN_NAME = 'driver_id'
GO

-- Test insert with manual ID
INSERT INTO [dbo].[DRIVER_MASTER] (
    driver_id,
    driver_name,
    driver_contact,
    driver_license,
    is_active
) 
VALUES 
(
    'DE01',                    -- Manual driver ID as string
    'Test Driver',
    '9876543210',
    'DL-TEST123456',
    1
);
GO

PRINT 'Test insert successful with manual ID: DE01'
GO

-- Verify test data
SELECT driver_id, driver_name, driver_contact 
FROM [dbo].[DRIVER_MASTER] 
WHERE driver_id = 'DE01'
GO

PRINT 'Driver ID data type successfully changed to VARCHAR(20)'
PRINT 'Backend can now handle manual driver IDs like "DE01", "DRIVER001", etc.'
GO
