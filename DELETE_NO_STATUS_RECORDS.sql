-- Delete records from OEM_Pickup table that don't have any status
-- This will remove records where Status is NULL, empty, or whitespace

USE [fleet3]
GO

-- First, let's see the records that will be deleted
SELECT 
    ID,
    Plant,
    Truck_Number,
    Status,
    Pickup_Date,
    Created_At
FROM OEM_Pickup 
WHERE Status IS NULL 
   OR Status = '' 
   OR Status = ' ' 
   OR LTRIM(RTRIM(Status)) = ''
ORDER BY Created_At;
GO

-- Show count of records that will be deleted
SELECT 
    COUNT(*) as Records_To_Delete,
    'Records with no status' as Description
FROM OEM_Pickup 
WHERE Status IS NULL 
   OR Status = '' 
   OR Status = ' ' 
   OR LTRIM(RTRIM(Status)) = '';
GO

-- Delete records with no status
DELETE FROM OEM_Pickup 
WHERE Status IS NULL 
   OR Status = '' 
   OR Status = ' ' 
   OR LTRIM(RTRIM(Status)) = '';
GO

-- Verify deletion - should show 0 records
SELECT 
    COUNT(*) as Remaining_No_Status_Records,
    'Records with no status after deletion' as Description
FROM OEM_Pickup 
WHERE Status IS NULL 
   OR Status = '' 
   OR Status = ' ' 
   OR LTRIM(RTRIM(Status)) = '';
GO

-- Show remaining records with valid status
SELECT 
    Status,
    COUNT(*) as Record_Count
FROM OEM_Pickup 
WHERE Status IS NOT NULL 
   AND LTRIM(RTRIM(Status)) != ''
GROUP BY Status
ORDER BY Record_Count DESC;
GO

-- Show total remaining records
SELECT 
    COUNT(*) as Total_Remaining_Records,
    'Total records after cleanup' as Description
FROM OEM_Pickup;
GO

PRINT 'Records with no status deleted successfully!';
