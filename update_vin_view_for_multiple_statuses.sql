-- Update Available VINs View to Include Multiple Statuses
USE [fleet3]
GO

PRINT 'Updating Available_VINs_LastMile_View to include multiple statuses...'
PRINT '================================================================'

-- Drop existing view
IF OBJECT_ID('[dbo].[Available_VINs_LastMile_View]', 'V') IS NOT NULL
BEGIN
    DROP VIEW [dbo].[Available_VINs_LastMile_View];
    PRINT 'Dropped existing Available_VINs_LastMile_View';
END
GO

-- Create updated view with multiple valid statuses
PRINT 'Creating new view with multiple statuses...';

EXEC('
CREATE VIEW [dbo].[Available_VINs_LastMile_View] AS
SELECT DISTINCT 
    o.VIN_Number,
    o.Status as OEM_Status
FROM [dbo].[OEM_Pickup] o
WHERE o.VIN_Number IS NOT NULL 
    AND LTRIM(RTRIM(o.VIN_Number)) != ''''
    AND o.Status IN (''Active'', ''REACHED PLANT'', ''ok'') -- Include multiple statuses
    AND NOT EXISTS (
        SELECT 1 
        FROM [dbo].[Last_Mile_Departure_VINs] lmdv
        WHERE lmdv.VIN_Number = o.VIN_Number
    )
');

PRINT 'Available_VINs_LastMile_View created with multiple statuses';
GO

-- Test the updated view
PRINT 'Testing the updated view...';

DECLARE @AvailableCount INT;
SELECT @AvailableCount = COUNT(*) FROM [dbo].[Available_VINs_LastMile_View];
PRINT 'Total available VINs: ' + CAST(@AvailableCount AS VARCHAR(10));

-- Show all available VINs with their statuses
IF @AvailableCount > 0
BEGIN
    PRINT 'Available VINs with their OEM statuses:';
    SELECT 
        VIN_Number,
        OEM_Status
    FROM [dbo].[Available_VINs_LastMile_View]
    ORDER BY VIN_Number;
END
ELSE
BEGIN
    PRINT 'No available VINs found. Checking all OEM statuses...';
    
    -- Show all unique statuses in OEM_Pickup
    SELECT DISTINCT 
        Status,
        COUNT(*) as Count
    FROM [dbo].[OEM_Pickup] 
    WHERE VIN_Number IS NOT NULL 
      AND LTRIM(RTRIM(VIN_Number)) != ''''
    GROUP BY Status
    ORDER BY Status;
END

PRINT ''
GO

-- Also create a view to see all OEM VINs that could be used
PRINT 'Creating comprehensive OEM VIN view...';

EXEC('
CREATE VIEW [dbo].[All_OEM_VINs_View] AS
SELECT 
    o.VIN_Number,
    o.Status as OEM_Status,
    o.Plant,
    o.Truck_Number,
    o.Driver_Name,
    o.Created_At,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM [dbo].[Last_Mile_Departure_VINs] lmdv
            WHERE lmdv.VIN_Number = o.VIN_Number
        ) THEN ''Already Used in Last Mile Departure''
        ELSE ''Available for Last Mile Departure''
    END as Availability_Status
FROM [dbo].[OEM_Pickup] o
WHERE o.VIN_Number IS NOT NULL 
    AND LTRIM(RTRIM(o.VIN_Number)) != ''''
');

PRINT 'All_OEM_VINs_View created';
GO

-- Show comprehensive view
PRINT 'Comprehensive OEM VIN status:';
SELECT TOP 20 
    VIN_Number,
    OEM_Status,
    Availability_Status,
    Plant,
    Truck_Number,
    Driver_Name
FROM [dbo].[All_OEM_VINs_View]
ORDER BY 
    CASE WHEN Availability_Status = ''Available for Last Mile Departure'' THEN 1 ELSE 2 END,
    VIN_Number;

PRINT ''
PRINT '================================================================'
PRINT 'View update completed!';
