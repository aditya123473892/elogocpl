-- Test Available VINs View Directly
USE [fleet3]
GO

PRINT 'Testing Available VINs View Directly...'
PRINT '========================================'

-- First, let's recreate the view with a simpler approach
PRINT 'Recreating view with simpler logic...';

IF OBJECT_ID('[dbo].[Available_VINs_LastMile_View]', 'V') IS NOT NULL
BEGIN
    DROP VIEW [dbo].[Available_VINs_LastMile_View];
    PRINT 'Dropped existing view';
END
GO

-- Create view with step-by-step logic
CREATE VIEW [dbo].[Available_VINs_LastMile_View] AS
SELECT DISTINCT 
    o.VIN_Number
FROM [dbo].[OEM_Pickup] o
WHERE o.VIN_Number IS NOT NULL 
    AND LTRIM(RTRIM(o.VIN_Number)) != ''
    AND o.Status IN ('Active', 'REACHED PLANT', 'ok')
    AND NOT EXISTS (
        SELECT 1 
        FROM [dbo].[Last_Mile_Departure_VINs] lmdv
        WHERE lmdv.VIN_Number = o.VIN_Number
    );

PRINT 'View recreated successfully';
GO

-- Test the view
PRINT 'Testing the recreated view...';

DECLARE @Count INT;
SELECT @Count = COUNT(*) FROM [dbo].[Available_VINs_LastMile_View];
PRINT 'Total available VINs: ' + CAST(@Count AS VARCHAR(10));

IF @Count > 0
BEGIN
    PRINT 'Available VINs found:';
    SELECT TOP 20 VIN_Number FROM [dbo].[Available_VINs_LastMile_View] ORDER BY VIN_Number;
END
ELSE
BEGIN
    PRINT 'No available VINs found. Debugging step by step...';
    
    -- Step 1: Check OEM VINs with valid statuses
    PRINT 'Step 1: OEM VINs with valid statuses';
    DECLARE @OEMValidCount INT;
    SELECT @OEMValidCount = COUNT(*) 
    FROM [dbo].[OEM_Pickup] 
    WHERE VIN_Number IS NOT NULL 
      AND LTRIM(RTRIM(VIN_Number)) != ''
      AND Status IN ('Active', 'REACHED PLANT', 'ok');
      
    PRINT 'OEM VINs with valid statuses: ' + CAST(@OEMValidCount AS VARCHAR(10));
    
    -- Step 2: Check total VINs used in Last Mile Departure
    PRINT 'Step 2: Total VINs used in Last Mile Departure';
    DECLARE @LMDUsedCount INT;
    SELECT @LMDUsedCount = COUNT(*) 
    FROM [dbo].[Last_Mile_Departure_VINs];
    
    PRINT 'Total VINs used in Last Mile Departure: ' + CAST(@LMDUsedCount AS VARCHAR(10));
    
    -- Step 3: Check OEM VINs that are not used in LMD
    PRINT 'Step 3: OEM VINs not used in LMD (should be available)';
    SELECT COUNT(*) as ShouldBeAvailable
    FROM [dbo].[OEM_Pickup] o
    WHERE o.VIN_Number IS NOT NULL 
      AND LTRIM(RTRIM(o.VIN_Number)) != ''
      AND o.Status IN ('Active', 'REACHED PLANT', 'ok')
      AND NOT EXISTS (
          SELECT 1 
          FROM [dbo].[Last_Mile_Departure_VINs] lmdv
          WHERE lmdv.VIN_Number = o.VIN_Number
      );
      
    -- Show some sample VINs that should be available
    PRINT 'Sample VINs that should be available:';
    SELECT TOP 5 
        VIN_Number,
        Status,
        Plant,
        Truck_Number
    FROM [dbo].[OEM_Pickup] o
    WHERE o.VIN_Number IS NOT NULL 
      AND LTRIM(RTRIM(o.VIN_Number)) != ''
      AND o.Status IN ('Active', 'REACHED PLANT', 'ok')
      AND NOT EXISTS (
          SELECT 1 
          FROM [dbo].[Last_Mile_Departure_VINs] lmdv
          WHERE lmdv.VIN_Number = o.VIN_Number
      )
    ORDER BY VIN_Number;
END

PRINT ''
GO

-- Test the specific VIN you mentioned
DECLARE @TestVIN NVARCHAR(50) = 'MA3JMTB1STCE56958';

PRINT 'Testing specific VIN: ' + @TestVIN;

-- Check if it exists in OEM with valid status
IF EXISTS (
    SELECT 1 
    FROM [dbo].[OEM_Pickup] 
    WHERE VIN_Number = @TestVIN
      AND Status IN ('Active', 'REACHED PLANT', 'ok')
)
BEGIN
    PRINT 'VIN exists in OEM with valid status';
    
    -- Check if it's in the available view
    IF EXISTS (SELECT 1 FROM [dbo].[Available_VINs_LastMile_View] WHERE VIN_Number = @TestVIN)
        PRINT 'VIN found in Available_VINs_LastMile_View';
    ELSE
        PRINT 'VIN NOT found in Available_VINs_LastMile_View - PROBLEM!';
END
ELSE
BEGIN
    PRINT 'VIN does NOT exist in OEM with valid status';
END

PRINT ''
PRINT '========================================'
PRINT 'Test completed!';
