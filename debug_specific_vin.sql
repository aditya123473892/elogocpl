-- Debug Specific VIN for Last Mile Departure
USE [fleet3]
GO

DECLARE @TestVIN NVARCHAR(50) = 'MA3JMTB1STCE56958'; -- Replace with your actual VIN

PRINT 'Debugging specific VIN: ' + @TestVIN
PRINT '=================================================='

-- 1. Check if VIN exists in OEM_Pickup
PRINT '1. Checking OEM_Pickup for VIN: ' + @TestVIN
SELECT 
    ID,
    VIN_Number,
    Status,
    Plant,
    Truck_Number,
    Driver_Name,
    Created_At,
    Updated_At
FROM [dbo].[OEM_Pickup]
WHERE VIN_Number = @TestVIN;

IF @@ROWCOUNT = 0
    PRINT '   VIN NOT FOUND in OEM_Pickup table!'
ELSE
    PRINT '   VIN FOUND in OEM_Pickup table'

PRINT ''
GO

-- 2. Check if VIN is already used in Last Mile Departure
PRINT '2. Checking if VIN already used in Last Mile Departure...'
SELECT 
    lmd.ID as Departure_ID,
    lmd.Truck_Number,
    lmd.Driver_Name,
    lmdv.VIN_Number,
    lmdv.VIN_Position,
    lmdv.Created_At as VIN_Created_At
FROM [dbo].[Last_Mile_Departure_VINs] lmdv
INNER JOIN [dbo].[Last_Mile_Departure] lmd ON lmdv.Departure_ID = lmd.ID
WHERE lmdv.VIN_Number = @TestVIN;

IF @@ROWCOUNT = 0
    PRINT '   VIN NOT USED in Last Mile Departure (GOOD)'
ELSE
    PRINT '   VIN ALREADY USED in Last Mile Departure (BAD)'

PRINT ''
GO

-- 3. Test the Available_VINs_LastMile_View directly
PRINT '3. Testing Available_VINs_LastMile_View for this VIN...'
SELECT VIN_Number
FROM [dbo].[Available_VINs_LastMile_View]
WHERE VIN_Number = @TestVIN;

IF @@ROWCOUNT = 0
    PRINT '   VIN NOT AVAILABLE in view (PROBLEM)'
ELSE
    PRINT '   VIN AVAILABLE in view (GOOD)'

PRINT ''
GO

-- 4. Manually test the view logic
PRINT '4. Testing view logic manually...'
PRINT '   Checking OEM_Pickup conditions:'

SELECT 
    o.VIN_Number,
    o.Status,
    'OEM Status Check' AS Check_Type,
    CASE 
        WHEN o.VIN_Number IS NULL THEN 'FAIL: VIN is NULL'
        WHEN o.VIN_Number = '' THEN 'FAIL: VIN is empty'
        WHEN o.Status IS NULL THEN 'FAIL: Status is NULL'
        WHEN o.Status != 'Active' THEN 'FAIL: Status is not Active (' + ISNULL(o.Status, 'NULL') + ')'
        ELSE 'PASS: All OEM conditions met'
    END AS OEM_Result
FROM [dbo].[OEM_Pickup] o
WHERE o.VIN_Number = @TestVIN;

PRINT ''
PRINT '   Checking Last Mile Departure exclusion:'

SELECT 
    o.VIN_Number,
    lmdv.VIN_Number as Used_VIN,
    'Last Mile Exclusion Check' AS Check_Type,
    CASE 
        WHEN lmdv.VIN_Number IS NOT NULL THEN 'FAIL: VIN already used in Last Mile Departure'
        ELSE 'PASS: VIN not used in Last Mile Departure'
    END AS LMD_Result
FROM [dbo].[OEM_Pickup] o
LEFT JOIN [dbo].[Last_Mile_Departure_VINs] lmdv ON o.VIN_Number = lmdv.VIN_Number
WHERE o.VIN_Number = @TestVIN;

PRINT ''
GO

-- 5. Show all available VINs for reference
PRINT '5. Showing all available VINs (top 10)...'
SELECT TOP 10 
    VIN_Number
FROM [dbo].[Available_VINs_LastMile_View]
ORDER BY VIN_Number;

IF @@ROWCOUNT = 0
    PRINT '   NO AVAILABLE VINs FOUND!'
ELSE
    PRINT '   Found ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' available VINs'

PRINT ''
PRINT '=================================================='
PRINT 'Debug completed for VIN: ' + @TestVIN
