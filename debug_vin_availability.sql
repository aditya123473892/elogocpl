-- Debug VIN Availability for Last Mile Departure
USE [fleet3]
GO

PRINT 'Debugging VIN Availability for Last Mile Departure...'
PRINT '=================================================='

-- Check if OEM_Pickup table exists and has data
PRINT '1. Checking OEM_Pickup table...'
IF OBJECT_ID('[dbo].[OEM_Pickup]', 'U') IS NOT NULL
BEGIN
    DECLARE @OEMCount INT;
    SELECT @OEMCount = COUNT(*) FROM [dbo].[OEM_Pickup];
    PRINT '   OEM_Pickup table exists with ' + CAST(@OEMCount AS VARCHAR(10)) + ' records'
    
    -- Check VIN_Number column
    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'OEM_Pickup' AND COLUMN_NAME = 'VIN_Number')
        PRINT '   VIN_Number column exists'
    ELSE
        PRINT '   VIN_Number column MISSING!'
        
    -- Check Status column
    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'OEM_Pickup' AND COLUMN_NAME = 'Status')
        PRINT '   Status column exists'
    ELSE
        PRINT '   Status column MISSING!'
        
    -- Show sample data
    PRINT '   Sample OEM_Pickup records:'
    SELECT TOP 5 
        ID, 
        VIN_Number, 
        Status,
        Created_At
    FROM [dbo].[OEM_Pickup]
    ORDER BY Created_At DESC;
END
ELSE
BEGIN
    PRINT '   OEM_Pickup table does NOT exist!'
END

PRINT ''
GO

-- Check if Last_Mile_Departure_VINs table exists
PRINT '2. Checking Last_Mile_Departure_VINs table...'
IF OBJECT_ID('[dbo].[Last_Mile_Departure_VINs]', 'U') IS NOT NULL
BEGIN
    DECLARE @LMDCount INT;
    SELECT @LMDCount = COUNT(*) FROM [dbo].[Last_Mile_Departure_VINs];
    PRINT '   Last_Mile_Departure_VINs table exists with ' + CAST(@LMDCount AS VARCHAR(10)) + ' records'
    
    -- Show sample data
    IF @LMDCount > 0
    BEGIN
        PRINT '   Sample Last_Mile_Departure_VINs records:'
        SELECT TOP 5 
            Departure_ID, 
            VIN_Number, 
            VIN_Position
        FROM [dbo].[Last_Mile_Departure_VINs]
        ORDER BY Created_At DESC;
    END
END
ELSE
BEGIN
    PRINT '   Last_Mile_Departure_VINs table does NOT exist!'
END

PRINT ''
GO

-- Test the Available_VINs_LastMile_View query directly
PRINT '3. Testing Available_VINs_LastMile_View query...'
IF OBJECT_ID('[dbo].[Available_VINs_LastMile_View]', 'V') IS NOT NULL
BEGIN
    DECLARE @AvailableCount INT;
    SELECT @AvailableCount = COUNT(*) FROM [dbo].[Available_VINs_LastMile_View];
    PRINT '   Available_VINs_LastMile_View exists'
    PRINT '   Available VINs count: ' + CAST(@AvailableCount AS VARCHAR(10))
    
    -- Show available VINs
    IF @AvailableCount > 0
    BEGIN
        PRINT '   Available VINs:'
        SELECT TOP 10 VIN_Number FROM [dbo].[Available_VINs_LastMile_View] ORDER BY VIN_Number;
    END
    ELSE
    BEGIN
        PRINT '   NO available VINs found!'
        
        -- Debug: Check why no VINs are available
        PRINT '   Debugging: Checking OEM VINs that should be available...'
        
        -- Check OEM VINs that are NOT NULL and NOT empty
        SELECT 
            COUNT(*) AS Total_OEM_VINs,
            COUNT(CASE WHEN Status = 'Active' THEN 1 END) AS Active_OEM_VINs,
            COUNT(CASE WHEN Status != 'Active' THEN 1 END) AS Inactive_OEM_VINs
        FROM [dbo].[OEM_Pickup]
        WHERE VIN_Number IS NOT NULL AND VIN_Number != '';
        
        PRINT '   Debugging: Checking OEM VINs already used in Last Mile Departure...'
        
        -- Check if any OEM VINs are already used
        SELECT 
            COUNT(*) AS Used_VINs_Count
        FROM [dbo].[OEM_Pickup] o
        WHERE o.VIN_Number IS NOT NULL 
          AND o.VIN_Number != ''
          AND EXISTS (
            SELECT 1 FROM [dbo].[Last_Mile_Departure_VINs] lmdv
            WHERE lmdv.VIN_Number = o.VIN_Number
          );
    END
END
ELSE
BEGIN
    PRINT '   Available_VINs_LastMile_View does NOT exist!'
END

PRINT ''
PRINT '=================================================='
PRINT 'Debug completed!'
