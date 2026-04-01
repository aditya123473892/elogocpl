-- =====================================================
-- Last Mile Departure Table Queries
-- =====================================================

USE [fleet3]
GO

-- =====================================================
-- 1. INSERT NEW LAST MILE DEPARTURE WITH VINs
-- =====================================================

-- Example: Insert a new Last Mile Departure with multiple VINs
DECLARE @NewDepartureID INT;

-- Step 1: Insert the main departure record
INSERT INTO [dbo].[Last_Mile_Departure] (
    Plant,
    Yard_Location,
    Vendor_Transporter,
    Truck_Number,
    Departure_Date,
    Delivery_Date,
    Arrival_Time,
    Departure_Time,
    Driver_Name,
    Remarks,
    Transportation_Type,
    Status
)
VALUES (
    'Mumbai Sideing',
    'Yard A',
    'Transporter A Ltd.',
    'DL6CV7887',
    '2026-03-31',
    '2026-04-02',
    '09:30:00',
    '14:45:00',
    'Ramesh Kumar',
    'Final delivery to customer location',
    'TRUCK',
    'Active'
);

-- Get the ID of the newly inserted departure
SET @NewDepartureID = SCOPE_IDENTITY();

-- Step 2: Insert VINs for this departure
INSERT INTO [dbo].[Last_Mile_Departure_VINs] (
    Departure_ID,
    VIN_Number,
    VIN_Position
)
VALUES 
    (@NewDepartureID, 'VIN1234567890', 1),
    (@NewDepartureID, 'VIN1234567891', 2),
    (@NewDepartureID, 'VIN1234567892', 3),
    (@NewDepartureID, 'VIN1234567893', 4),
    (@NewDepartureID, 'VIN1234567894', 5);

PRINT 'Last Mile Departure created with ID: ' + CAST(@NewDepartureID AS VARCHAR(10));
GO

-- =====================================================
-- 2. SELECT ALL LAST MILE DEPARTURES WITH VINs
-- =====================================================

-- Method 1: Using the view (recommended for display)
SELECT 
    ID,
    Plant,
    Yard_Location,
    Vendor_Transporter,
    Truck_Number,
    Departure_Date,
    Delivery_Date,
    Arrival_Time,
    Departure_Time,
    Driver_Name,
    Remarks,
    Transportation_Type,
    Status,
    VIN_Count,
    VIN_Details,
    Created_At,
    Updated_At
FROM [dbo].[Last_Mile_Departure_With_VINs_View]
ORDER BY Created_At DESC;

-- Method 2: Manual join (for more control)
SELECT 
    lmd.ID,
    lmd.Plant,
    lmd.Yard_Location,
    lmd.Vendor_Transporter,
    lmd.Truck_Number,
    lmd.Departure_Date,
    lmd.Delivery_Date,
    lmd.Arrival_Time,
    lmd.Departure_Time,
    lmd.Driver_Name,
    lmd.Remarks,
    lmd.Transportation_Type,
    lmd.Status,
    lmd.VIN_Count,
    lmd.Created_At,
    lmd.Updated_At,
    STUFF((
        SELECT ', ' + VIN_Number 
        FROM [dbo].[Last_Mile_Departure_VINs] lmdv 
        WHERE lmdv.Departure_ID = lmd.ID 
        ORDER BY lmdv.VIN_Position
        FOR XML PATH(''), TYPE
    ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS VIN_Details
FROM [dbo].[Last_Mile_Departure] lmd
ORDER BY lmd.Created_At DESC;
GO

-- =====================================================
-- 3. GET AVAILABLE VINs FOR LAST MILE DEPARTURE
-- =====================================================

-- Get VINs from OEM Pickup that are available for Last Mile Departure
SELECT 
    VIN_Number,
    'Available' AS Status
FROM [dbo].[Available_VINs_LastMile_View]
ORDER BY VIN_Number;

-- Get count of available VINs
SELECT 
    COUNT(*) AS Total_Available_VINs
FROM [dbo].[Available_VINs_LastMile_View];
GO

-- =====================================================
-- 4. SEARCH LAST MILE DEPARTURES
-- =====================================================

-- Search by Truck Number
SELECT 
    lmd.ID,
    lmd.Truck_Number,
    lmd.Driver_Name,
    lmd.Departure_Date,
    lmd.Status,
    lmdv.VIN_Number,
    lmdv.VIN_Position
FROM [dbo].[Last_Mile_Departure] lmd
INNER JOIN [dbo].[Last_Mile_Departure_VINs] lmdv ON lmd.ID = lmdv.Departure_ID
WHERE lmd.Truck_Number LIKE '%DL6CV7887%'
ORDER BY lmd.Created_At DESC;

-- Search by VIN Number
SELECT 
    lmd.ID,
    lmd.Truck_Number,
    lmd.Driver_Name,
    lmd.Departure_Date,
    lmd.Status,
    lmdv.VIN_Number,
    lmdv.VIN_Position
FROM [dbo].[Last_Mile_Departure] lmd
INNER JOIN [dbo].[Last_Mile_Departure_VINs] lmdv ON lmd.ID = lmdv.Departure_ID
WHERE lmdv.VIN_Number = 'VIN1234567890';

-- Search by Date Range
SELECT 
    lmd.ID,
    lmd.Truck_Number,
    lmd.Driver_Name,
    lmd.Departure_Date,
    lmd.Delivery_Date,
    lmd.Status,
    lmd.VIN_Count
FROM [dbo].[Last_Mile_Departure] lmd
WHERE lmd.Departure_Date BETWEEN '2026-03-01' AND '2026-03-31'
ORDER BY lmd.Departure_Date DESC;
GO

-- =====================================================
-- 5. UPDATE LAST MILE DEPARTURE
-- =====================================================

-- Update main departure record
UPDATE [dbo].[Last_Mile_Departure]
SET 
    Driver_Name = 'Updated Driver Name',
    Departure_Time = '15:30:00',
    Remarks = 'Updated remarks',
    Status = 'Completed',
    Updated_At = GETDATE()
WHERE ID = 1;

-- Add/Update VINs for a departure
-- First remove existing VINs if needed
DELETE FROM [dbo].[Last_Mile_Departure_VINs] 
WHERE Departure_ID = 1;

-- Then insert new VINs
INSERT INTO [dbo].[Last_Mile_Departure_VINs] (
    Departure_ID,
    VIN_Number,
    VIN_Position
)
VALUES 
    (1, 'VIN1234567890', 1),
    (1, 'VIN1234567891', 2),
    (1, 'VIN9999999999', 3); -- New VIN added
GO

-- =====================================================
-- 6. DELETE LAST MILE DEPARTURE
-- =====================================================

-- Delete a specific departure (VINs will be automatically deleted due to CASCADE)
DELETE FROM [dbo].[Last_Mile_Departure]
WHERE ID = 1;

-- Delete multiple departures
DELETE FROM [dbo].[Last_Mile_Departure]
WHERE Created_At < '2026-01-01'; -- Delete old records
GO

-- =====================================================
-- 7. REPORTING QUERIES
-- =====================================================

-- Summary by Transporter
SELECT 
    lmd.Vendor_Transporter,
    COUNT(*) AS Total_Departures,
    COUNT(DISTINCT lmd.Truck_Number) AS Unique_Trucks,
    SUM(lmd.VIN_Count) AS Total_VINs,
    MIN(lmd.Departure_Date) AS First_Departure,
    MAX(lmd.Departure_Date) AS Last_Departure
FROM [dbo].[Last_Mile_Departure] lmd
GROUP BY lmd.Vendor_Transporter
ORDER BY Total_Departures DESC;

-- Summary by Plant
SELECT 
    lmd.Plant,
    COUNT(*) AS Total_Departures,
    SUM(lmd.VIN_Count) AS Total_VINs,
    AVG(CAST(lmd.VIN_Count AS FLOAT)) AS Avg_VINs_Per_Departure
FROM [dbo].[Last_Mile_Departure] lmd
GROUP BY lmd.Plant
ORDER BY Total_Departures DESC;

-- Monthly Summary
SELECT 
    FORMAT(lmd.Departure_Date, 'yyyy-MM') AS Month,
    COUNT(*) AS Total_Departures,
    SUM(lmd.VIN_Count) AS Total_VINs,
    COUNT(DISTINCT lmd.Driver_Name) AS Unique_Drivers
FROM [dbo].[Last_Mile_Departure] lmd
GROUP BY FORMAT(lmd.Departure_Date, 'yyyy-MM')
ORDER BY Month DESC;

-- Driver Performance
SELECT 
    lmd.Driver_Name,
    COUNT(*) AS Total_Departures,
    SUM(lmd.VIN_Count) AS Total_VINs_Delivered,
    AVG(CAST(lmd.VIN_Count AS FLOAT)) AS Avg_VINs_Per_Trip
FROM [dbo].[Last_Mile_Departure] lmd
GROUP BY lmd.Driver_Name
ORDER BY Total_Departures DESC;
GO

-- =====================================================
-- 8. VALIDATION QUERIES
-- =====================================================

-- Check for duplicate VINs (should return none due to unique constraint)
SELECT 
    VIN_Number,
    COUNT(*) AS Count
FROM [dbo].[Last_Mile_Departure_VINs]
GROUP BY VIN_Number
HAVING COUNT(*) > 1;

-- Check departures without VINs
SELECT 
    lmd.ID,
    lmd.Truck_Number,
    lmd.Driver_Name,
    lmd.Departure_Date
FROM [dbo].[Last_Mile_Departure] lmd
LEFT JOIN [dbo].[Last_Mile_Departure_VINs] lmdv ON lmd.ID = lmdv.Departure_ID
WHERE lmdv.Departure_ID IS NULL;

-- Check VINs that exist in both OEM and Last Mile Departure
SELECT 
    o.VIN_Number,
    'Used in Both' AS Status
FROM [dbo].[OEM_Pickup] o
INNER JOIN [dbo].[Last_Mile_Departure_VINs] lmdv ON o.VIN_Number = lmdv.VIN_Number
WHERE o.Status = 'Active'
ORDER BY o.VIN_Number;
GO

-- =====================================================
-- 9. UTILITY QUERIES
-- =====================================================

-- Get VINs for a specific departure
SELECT 
    lmdv.VIN_Number,
    lmdv.VIN_Position,
    lmdv.Created_At
FROM [dbo].[Last_Mile_Departure_VINs] lmdv
WHERE lmdv.Departure_ID = 1
ORDER BY lmdv.VIN_Position;

-- Get departure details for a specific VIN
SELECT 
    lmd.ID,
    lmd.Truck_Number,
    lmd.Driver_Name,
    lmd.Departure_Date,
    lmd.Delivery_Date,
    lmd.Status,
    lmdv.VIN_Number,
    lmdv.VIN_Position
FROM [dbo].[Last_Mile_Departure] lmd
INNER JOIN [dbo].[Last_Mile_Departure_VINs] lmdv ON lmd.ID = lmdv.Departure_ID
WHERE lmdv.VIN_Number = 'VIN1234567890';

-- Get recent departures (last 7 days)
SELECT 
    lmd.ID,
    lmd.Truck_Number,
    lmd.Driver_Name,
    lmd.Departure_Date,
    lmd.Status,
    lmd.VIN_Count,
    lmdv.VIN_Number
FROM [dbo].[Last_Mile_Departure] lmd
INNER JOIN [dbo].[Last_Mile_Departure_VINs] lmdv ON lmd.ID = lmdv.Departure_ID
WHERE lmd.Created_At >= DATEADD(DAY, -7, GETDATE())
ORDER BY lmd.Created_At DESC;
GO

PRINT 'All Last Mile Departure queries executed successfully!';
