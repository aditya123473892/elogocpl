-- Fix Available_VINs_LastMile_View
USE [fleet3]
GO

PRINT 'Fixing Available_VINs_LastMile_View...'
PRINT '=========================================='

-- Drop existing view
IF OBJECT_ID('[dbo].[Available_VINs_LastMile_View]', 'V') IS NOT NULL
BEGIN
    DROP VIEW [dbo].[Available_VINs_LastMile_View];
    PRINT 'Dropped existing Available_VINs_LastMile_View';
END
GO

-- Recreate view with better logic
PRINT 'Creating new Available_VINs_LastMile_View...';

EXEC('
CREATE VIEW [dbo].[Available_VINs_LastMile_View] AS
SELECT DISTINCT 
    o.VIN_Number
FROM [dbo].[OEM_Pickup] o
WHERE o.VIN_Number IS NOT NULL 
    AND LTRIM(RTRIM(o.VIN_Number)) != ''''
    AND o.Status = ''Active''
    AND NOT EXISTS (
        SELECT 1 
        FROM [dbo].[Last_Mile_Departure_VINs] lmdv
        WHERE lmdv.VIN_Number = o.VIN_Number
    )
');

PRINT 'Available_VINs_LastMile_View created successfully';
GO

-- Test the view
PRINT 'Testing the new view...';

DECLARE @TestCount INT;
SELECT @TestCount = COUNT(*) FROM [dbo].[Available_VINs_LastMile_View];
PRINT 'Total available VINs: ' + CAST(@TestCount AS VARCHAR(10));

-- Show sample available VINs
IF @TestCount > 0
BEGIN
    PRINT 'Sample available VINs:';
    SELECT TOP 5 VIN_Number FROM [dbo].[Available_VINs_LastMile_View] ORDER BY VIN_Number;
END
ELSE
BEGIN
    PRINT 'No available VINs found. Debugging...';
    
    -- Check OEM VINs
    DECLARE @OEMActiveCount INT;
    SELECT @OEMActiveCount = COUNT(*) 
    FROM [dbo].[OEM_Pickup] 
    WHERE Status = ''Active'' 
      AND VIN_Number IS NOT NULL 
      AND LTRIM(RTRIM(VIN_Number)) != '''';
      
    PRINT 'Active OEM VINs with valid VIN_Number: ' + CAST(@OEMActiveCount AS VARCHAR(10));
    
    -- Check used VINs
    DECLARE @UsedCount INT;
    SELECT @UsedCount = COUNT(*) 
    FROM [dbo].[Last_Mile_Departure_VINs];
    
    PRINT 'Total VINs used in Last Mile Departure: ' + CAST(@UsedCount AS VARCHAR(10));
    
    -- Show OEM VINs that should be available
    PRINT 'Active OEM VINs that should be available:';
    SELECT TOP 10 
        VIN_Number,
        Status,
        Created_At
    FROM [dbo].[OEM_Pickup] 
    WHERE Status = ''Active'' 
      AND VIN_Number IS NOT NULL 
      AND LTRIM(RTRIM(VIN_Number)) != ''''
      AND NOT EXISTS (
          SELECT 1 
          FROM [dbo].[Last_Mile_Departure_VINs] lmdv
          WHERE lmdv.VIN_Number = [dbo].[OEM_Pickup].VIN_Number
      )
    ORDER BY VIN_Number;
END

PRINT ''
PRINT '=========================================='
PRINT 'View fix completed!';
