-- Debug VIN0007 specifically
USE [fleet3]
GO

DECLARE @TestVIN NVARCHAR(50) = 'VIN0007';

PRINT 'Debugging VIN0007 specifically...'
PRINT '======================================'

-- 1. Check exact OEM_Pickup record
PRINT '1. Exact OEM_Pickup record:';
SELECT 
    ID,
    VIN_Number,
    Status,
    Plant,
    Truck_Number,
    Driver_Name,
    Created_At,
    Updated_At,
    LEN(VIN_Number) as VIN_Length,
    ASCII(VIN_Number) as VIN_ASCII
FROM [dbo].[OEM_Pickup]
WHERE VIN_Number = @TestVIN;

PRINT ''
GO

-- 2. Check if it's in Last_Mile_Departure_VINs
PRINT '2. Last_Mile Departure VINs record:';
SELECT 
    lmdv.ID as LMD_VIN_ID,
    lmdv.Departure_ID,
    lmdv.VIN_Number,
    lmdv.VIN_Position,
    lmdv.Created_At as VIN_Created_At,
    LEN(lmdv.VIN_Number) as LMD_VIN_Length,
    ASCII(lmdv.VIN_Number) as LMD_VIN_ASCII
FROM [dbo].[Last_Mile_Departure_VINs] lmdv
WHERE lmdv.VIN_Number = @TestVIN;

PRINT ''
GO

-- 3. Manual check of Available_VINs_LastMile_View logic
PRINT '3. Manual view logic check:';

-- Step 3a: Check OEM conditions
DECLARE @OEMValid BIT = 0;
DECLARE @OEMStatus NVARCHAR(50);

SELECT 
    @OEMValid = 1,
    @OEMStatus = Status
FROM [dbo].[OEM_Pickup] o
WHERE o.VIN_Number = @TestVIN
  AND o.VIN_Number IS NOT NULL 
  AND LTRIM(RTRIM(o.VIN_Number)) <> ''
  AND o.Status IN ('Active', 'REACHED PLANT', 'ok');

PRINT '   OEM Valid: ' + CASE WHEN @OEMValid = 1 THEN 'YES' ELSE 'NO' END;
PRINT '   OEM Status: ' + ISNULL(@OEMStatus, 'NULL');

-- Step 3b: Check Last Mile Departure exclusion
DECLARE @LMDUsed BIT = 0;
IF EXISTS (
    SELECT 1 
    FROM [dbo].[Last_Mile_Departure_VINs] lmdv
    WHERE lmdv.VIN_Number = @TestVIN
)
    SET @LMDUsed = 1;

PRINT '   Used in LMD: ' + CASE WHEN @LMDUsed = 1 THEN 'YES' ELSE 'NO' END;

-- Step 3c: Should be available?
DECLARE @ShouldBeAvailable BIT = 0;
IF @OEMValid = 1 AND @LMDUsed = 0
    SET @ShouldBeAvailable = 1;

PRINT '   Should be Available: ' + CASE WHEN @ShouldBeAvailable = 1 THEN 'YES' ELSE 'NO' END;

PRINT ''
GO

-- 4. Check what's actually in the view
PRINT '4. Actual view result:';
SELECT 
    VIN_Number,
    LEN(VIN_Number) as View_VIN_Length,
    ASCII(VIN_Number) as View_VIN_ASCII
FROM [dbo].[Available_VINs_LastMile_View]
WHERE VIN_Number = @TestVIN;

IF @@ROWCOUNT = 0
    PRINT '   VIN NOT FOUND in view - THIS IS THE PROBLEM!'
ELSE
    PRINT '   VIN FOUND in view';

PRINT ''
GO

-- 5. Recreate view with debugging
PRINT '5. Recreating view with debug info...';

IF OBJECT_ID('[dbo].[Available_VINs_LastMile_View]', 'V') IS NOT NULL
    DROP VIEW [dbo].[Available_VINs_LastMile_View];

-- Create view with explicit debugging
EXEC('
CREATE VIEW [dbo].[Available_VINs_LastMile_View] AS
SELECT DISTINCT 
    o.VIN_Number,
    o.Status as OEM_Status,
    o.Plant,
    o.Truck_Number,
    o.Driver_Name,
    LEN(o.VIN_Number) as VIN_Length,
    ASCII(o.VIN_Number) as VIN_ASCII,
    ''Available'' as Availability_Status
FROM [dbo].[OEM_Pickup] o
WHERE o.VIN_Number IS NOT NULL 
    AND LTRIM(RTRIM(o.VIN_Number)) <> ''''
    AND o.Status IN (''Active'', ''REACHED PLANT'', ''ok'')
    AND NOT EXISTS (
        SELECT 1 
        FROM [dbo].[Last_Mile_Departure_VINs] lmdv
        WHERE lmdv.VIN_Number = o.VIN_Number
    )');

PRINT 'View recreated with debugging columns';
GO

-- Test the recreated view
PRINT '6. Testing recreated view:';
SELECT TOP 5 
    VIN_Number,
    OEM_Status,
    VIN_Length,
    Availability_Status
FROM [dbo].[Available_VINs_LastMile_View]
ORDER BY VIN_Number;

-- Check for our specific VIN
IF EXISTS (SELECT 1 FROM [dbo].[Available_VINs_LastMile_View] WHERE VIN_Number = @TestVIN)
    PRINT '   VIN0007 FOUND in recreated view - SUCCESS!'
ELSE
    PRINT '   VIN0007 NOT FOUND in recreated view - STILL PROBLEM!';

PRINT ''
PRINT '======================================'
PRINT 'Debug completed for VIN0007';
