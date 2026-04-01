-- Create Sample OEM Pickup Data for Testing Last Mile Departure
USE [fleet3]
GO

PRINT 'Creating sample OEM Pickup data for Last Mile Departure testing...'
PRINT '================================================================'

-- Check if OEM_Pickup table has any data
DECLARE @RecordCount INT;
SELECT @RecordCount = COUNT(*) FROM [dbo].[OEM_Pickup];

IF @RecordCount = 0
BEGIN
    PRINT 'No OEM Pickup data found. Creating sample records...'
    
    -- Insert sample OEM Pickup records with VINs
    INSERT INTO [dbo].[OEM_Pickup] (
        Plant,
        Yard_Location,
        Vendor_Transporter,
        Truck_Number,
        Arrival_Date,
        Dispatch_Date,
        Driver_Name,
        Remarks,
        Status,
        VIN_Number,
        Created_At,
        Updated_At,
        Pickup_Date,
        Delivery_Date,
        Transportation_Type,
        Arrival_Time,
        Departure_Time
    )
    VALUES 
    (
        'Mumbai Sideing',
        'Yard A',
        'Transporter A Ltd.',
        'DL6CV7887',
        '2026-03-25',
        '2026-03-26',
        'Ramesh Kumar',
        'Sample OEM pickup 1',
        'Active',
        'MA1AB1234',
        GETDATE(),
        GETDATE(),
        '2026-03-26',
        '2026-03-27',
        'TRUCK',
        '09:30:00',
        '14:30:00'
    ),
    (
        'Mumbai Sideing',
        'Yard B',
        'Transporter B Ltd.',
        'DL6CV7888',
        '2026-03-24',
        '2026-03-25',
        'Suresh Sharma',
        'Sample OEM pickup 2',
        'Active',
        'MA2AB5678',
        GETDATE(),
        GETDATE(),
        '2026-03-25',
        '2026-03-26',
        'TRUCK',
        '10:15:00',
        '15:45:00'
    ),
    (
        'Pune Sideing',
        'Yard C',
        'Transporter C Ltd.',
        'DL6CV7889',
        '2026-03-23',
        '2026-03-24',
        'Amit Patel',
        'Sample OEM pickup 3',
        'Active',
        'MA3AB9012',
        GETDATE(),
        GETDATE(),
        '2026-03-24',
        '2026-03-25',
        'TRUCK',
        '08:00:00',
        '13:30:00'
    ),
    (
        'Nagpur Sideing',
        'Yard D',
        'Transporter D Ltd.',
        'DL6CV7890',
        '2026-03-22',
        '2026-03-23',
        'Vikram Singh',
        'Sample OEM pickup 4',
        'Active',
        'MA4AB3456',
        GETDATE(),
        GETDATE(),
        '2026-03-23',
        '2026-03-24',
        'TRUCK',
        '11:20:00',
        '16:50:00'
    ),
    (
        'Delhi Sideing',
        'Yard E',
        'Transporter E Ltd.',
        'DL6CV7891',
        '2026-03-21',
        '2026-03-22',
        'Rahul Kumar',
        'Sample OEM pickup 5',
        'Active',
        'MA5AB7890',
        GETDATE(),
        GETDATE(),
        '2026-03-22',
        '2026-03-23',
        'TRUCK',
        '07:45:00',
        '12:15:00'
    );
    
    PRINT 'Created 5 sample OEM Pickup records with VINs'
END
ELSE
BEGIN
    PRINT 'OEM Pickup table already has ' + CAST(@RecordCount AS VARCHAR(10)) + ' records'
    
    -- Show current VINs
    PRINT 'Current OEM Pickup VINs:'
    SELECT TOP 10 
        ID,
        VIN_Number,
        Status,
        Created_At
    FROM [dbo].[OEM_Pickup]
    WHERE VIN_Number IS NOT NULL AND VIN_Number != ''
    ORDER BY Created_At DESC;
END

PRINT ''
PRINT 'Checking available VINs for Last Mile Departure...'

-- Test the available VINs view
IF OBJECT_ID('[dbo].[Available_VINs_LastMile_View]', 'V') IS NOT NULL
BEGIN
    DECLARE @AvailableCount INT;
    SELECT @AvailableCount = COUNT(*) FROM [dbo].[Available_VINs_LastMile_View];
    
    PRINT 'Available VINs for Last Mile Departure: ' + CAST(@AvailableCount AS VARCHAR(10))
    
    IF @AvailableCount > 0
    BEGIN
        PRINT 'Available VINs:'
        SELECT VIN_Number FROM [dbo].[Available_VINs_LastMile_View] ORDER BY VIN_Number;
    END
    ELSE
    BEGIN
        PRINT 'No available VINs. Checking why...'
        
        -- Check active OEM VINs
        DECLARE @ActiveOEMCount INT;
        SELECT @ActiveOEMCount = COUNT(*) 
        FROM [dbo].[OEM_Pickup] 
        WHERE Status = 'Active' 
          AND VIN_Number IS NOT NULL 
          AND VIN_Number != '';
          
        PRINT 'Active OEM VINs: ' + CAST(@ActiveOEMCount AS VARCHAR(10))
        
        -- Check used VINs
        DECLARE @UsedCount INT;
        SELECT @UsedCount = COUNT(*) 
        FROM [dbo].[Last_Mile_Departure_VINs];
        
        PRINT 'VINs already used in Last Mile Departure: ' + CAST(@UsedCount AS VARCHAR(10))
    END
END
ELSE
BEGIN
    PRINT 'Available_VINs_LastMile_View does not exist!'
END

PRINT ''
PRINT '================================================================'
PRINT 'Sample data creation completed!'
