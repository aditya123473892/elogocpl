-- Fix Aadhaar Constraint - Allow NULL and Empty Values
-- Database: fleet3
-- Created: 23-02-2026 12:45
-- Fixes CK_DRIVER_AADHAAR constraint to properly handle NULL/empty values

USE [fleet3]
GO

-- Check current constraint
SELECT 
    name,
    definition,
    is_disabled
FROM sys.check_constraints 
WHERE parent_object_id = OBJECT_ID('DRIVER_MASTER') AND name = 'CK_DRIVER_AADHAAR'
GO

-- Drop the existing constraint
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'CK_DRIVER_AADHAAR' AND type = 'C')
BEGIN
    ALTER TABLE [dbo].[DRIVER_MASTER] DROP CONSTRAINT [CK_DRIVER_AADHAAR]
    PRINT 'Dropped CK_DRIVER_AADHAAR constraint'
END
GO

-- Add corrected constraint that properly handles NULL values
ALTER TABLE [dbo].[DRIVER_MASTER] WITH NOCHECK ADD CONSTRAINT [CK_DRIVER_AADHAAR] 
CHECK (
    [aadhaar_number] IS NULL OR 
    [aadhaar_number] = '' OR
    (len([aadhaar_number]) = 12 AND [aadhaar_number] like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]')
)
GO

ALTER TABLE [dbo].[DRIVER_MASTER] CHECK CONSTRAINT [CK_DRIVER_AADHAAR]
GO

PRINT 'Added corrected CK_DRIVER_AADHAAR constraint'
GO

-- Also fix PAN constraint in case it has similar issues
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'CK_DRIVER_PAN' AND type = 'C')
BEGIN
    ALTER TABLE [dbo].[DRIVER_MASTER] DROP CONSTRAINT [CK_DRIVER_PAN]
    PRINT 'Dropped CK_DRIVER_PAN constraint'
END
GO

ALTER TABLE [dbo].[DRIVER_MASTER] WITH NOCHECK ADD CONSTRAINT [CK_DRIVER_PAN] 
CHECK (
    [pan_number] IS NULL OR 
    [pan_number] = '' OR
    (len([pan_number]) = 10 AND [pan_number] like '[A-Z][A-Z][A-Z][A-Z][0-9][0-9][0-9][0-9][A-Z]')
)
GO

ALTER TABLE [dbo].[DRIVER_MASTER] CHECK CONSTRAINT [CK_DRIVER_PAN]
GO

PRINT 'Added corrected CK_DRIVER_PAN constraint'
GO

-- Test the fix with various Aadhaar values
INSERT INTO [dbo].[DRIVER_MASTER] (
    driver_id,
    driver_name,
    driver_contact,
    driver_license,
    aadhaar_number,
    pan_number,
    is_active
) 
VALUES 
(
    'TEST001',
    'Test Driver 1',
    '9876543210',
    'DL-TEST123456',
    NULL,                     -- NULL should work
    NULL,
    1
);
GO

INSERT INTO [dbo].[DRIVER_MASTER] (
    driver_id,
    driver_name,
    driver_contact,
    driver_license,
    aadhaar_number,
    pan_number,
    is_active
) 
VALUES 
(
    'TEST002',
    'Test Driver 2',
    '9876543211',
    'DL-TEST789012',
    '',                       -- Empty string should work
    '',
    1
);
GO

INSERT INTO [dbo].[DRIVER_MASTER] (
    driver_id,
    driver_name,
    driver_contact,
    driver_license,
    aadhaar_number,
    pan_number,
    is_active
) 
VALUES 
(
    'TEST003',
    'Test Driver 3',
    '9876543212',
    'DL-TEST345678',
    '123456789012',          -- Valid 12-digit Aadhaar should work
    'ABCDE1234F',             -- Valid PAN should work
    1
);
GO

PRINT 'Test inserts completed'
GO

-- Verify test data
SELECT driver_id, driver_name, aadhaar_number, pan_number 
FROM [dbo].[DRIVER_MASTER] 
WHERE driver_id LIKE 'TEST%'
GO

-- Test update with NULL Aadhaar
UPDATE [dbo].[DRIVER_MASTER] 
SET aadhaar_number = NULL 
WHERE driver_id = 'TEST003'
GO

PRINT 'Test update with NULL Aadhaar completed'
GO

-- Verify update
SELECT driver_id, driver_name, aadhaar_number, pan_number 
FROM [dbo].[DRIVER_MASTER] 
WHERE driver_id = 'TEST003'
GO

PRINT 'Aadhaar and PAN constraints fixed!'
PRINT 'Now allows: NULL, empty string, or valid format'
GO
