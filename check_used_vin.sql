-- Check Specific Used VIN in OEM and Last Mile Departure
USE [fleet3]
GO

-- Replace with the actual VIN you used
DECLARE @UsedVIN NVARCHAR(50) = 'MA3JMTB1STCE56958';

PRINT 'Checking VIN: ' + @UsedVIN
PRINT '=========================================='

-- 1. Check if VIN exists in OEM_Pickup
PRINT '1. OEM_Pickup Record for this VIN:';
SELECT 
    ID,
    VIN_Number,
    Status,
    Plant,
    Truck_Number,
    Driver_Name,
    Created_At
FROM [dbo].[OEM_Pickup]
WHERE VIN_Number = @UsedVIN;

PRINT ''
GO

-- 2. Check if VIN exists in Last_Mile_Departure_VINs
PRINT '2. Last Mile Departure VINs Record for this VIN:';
SELECT 
    lmdv.ID as LMD_VIN_ID,
    lmdv.Departure_ID,
    lmdv.VIN_Number,
    lmdv.VIN_Position,
    lmdv.Created_At as LMD_Created_At,
    lmd.Truck_Number as LMD_Truck_Number,
    lmd.Driver_Name as LMD_Driver_Name,
    lmd.Status as LMD_Status
FROM [dbo].[Last_Mile_Departure_VINs] lmdv
LEFT JOIN [dbo].[Last_Mile_Departure] lmd ON lmdv.Departure_ID = lmd.ID
WHERE lmdv.VIN_Number = @UsedVIN;

PRINT ''
GO

-- 3. Check Available_VINs_LastMile_View for this specific VIN
PRINT '3. Available VINs View Check for this VIN:';
SELECT 
    VIN_Number,
    OEM_Status
FROM [dbo].[Available_VINs_LastMile_View]
WHERE VIN_Number = @UsedVIN;

PRINT ''
GO

-- 4. Manual check - what should be the result?
PRINT '4. Manual Logic Check:';
DECLARE @OEMExists BIT = 0;
DECLARE @LMDExists BIT = 0;
DECLARE @OEMStatus NVARCHAR(50);

-- Check OEM
SELECT 
    @OEMExists = 1,
    @OEMStatus = Status
FROM [dbo].[OEM_Pickup]
WHERE VIN_Number = @UsedVIN;

-- Check Last Mile Departure
IF EXISTS (SELECT 1 FROM [dbo].[Last_Mile_Departure_VINs] WHERE VIN_Number = @UsedVIN)
    SET @LMDExists = 1;

PRINT '   OEM Record Exists: ' + CASE WHEN @OEMExists = 1 THEN 'YES' ELSE 'NO' END;
PRINT '   OEM Status: ' + ISNULL(@OEMStatus, 'NULL');
PRINT '   Used in Last Mile Departure: ' + CASE WHEN @LMDExists = 1 THEN 'YES' ELSE 'NO' END;

-- Manual calculation
DECLARE @ShouldBeAvailable BIT = 0;
IF @OEMExists = 1 AND @LMDExists = 0
    SET @ShouldBeAvailable = 1;

PRINT '   Should be Available: ' + CASE WHEN @ShouldBeAvailable = 1 THEN 'YES' ELSE 'NO' END;

PRINT ''
GO

-- 5. Show all available VINs for comparison
PRINT '5. All Available VINs (first 10):';
SELECT TOP 10 
    VIN_Number,
    OEM_Status
FROM [dbo].[Available_VINs_LastMile_View]
ORDER BY VIN_Number;

PRINT ''
GO

-- 6. Debug: Show OEM VINs that should be available but aren't
PRINT '6. OEM VINs that should be available:';
SELECT 
    o.VIN_Number,
    o.Status,
    o.Plant,
    o.Truck_Number
FROM [dbo].[OEM_Pickup] o
WHERE o.VIN_Number IS NOT NULL 
    AND LTRIM(RTRIM(o.VIN_Number)) != ''
    AND o.Status IN ('Active', 'REACHED PLANT', 'ok', 'IN-TRANSIT')
    AND NOT EXISTS (
        SELECT 1 
        FROM [dbo].[Last_Mile_Departure_VINs] lmdv
        WHERE lmdv.VIN_Number = o.VIN_Number
    )
ORDER BY o.VIN_Number;

PRINT ''
PRINT '=========================================='
PRINT 'Debug completed for VIN: ' + @UsedVIN
