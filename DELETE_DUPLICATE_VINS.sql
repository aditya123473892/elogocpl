-- Delete duplicate VIN entries from Dealer_Trip_Details table
-- Keep only one record per VIN (the first occurrence based on Load_No and Trip_No)

USE [fleet3]
GO

-- First, let's see the duplicates before deleting
SELECT 
    VIN_Number,
    COUNT(*) as DuplicateCount,
    MIN(Load_No) as First_Load_No,
    MIN(Trip_No) as First_Trip_No
FROM Dealer_Trip_Details 
WHERE VIN_Number IS NOT NULL AND VIN_Number != ''
GROUP BY VIN_Number
HAVING COUNT(*) > 1
ORDER BY DuplicateCount DESC;
GO

-- Method 1: Using CTE and ROW_NUMBER() to keep the first occurrence
WITH CTE_Duplicates AS (
    SELECT 
        *,
        ROW_NUMBER() OVER (PARTITION BY VIN_Number ORDER BY Load_No, Trip_No) as RowNum
    FROM Dealer_Trip_Details 
    WHERE VIN_Number IS NOT NULL AND VIN_Number != ''
)
DELETE FROM Dealer_Trip_Details
WHERE [VIN_Number] IN (
    SELECT VIN_Number 
    FROM CTE_Duplicates 
    WHERE RowNum > 1
);
GO

-- Alternative Method 2: Using DELETE with JOIN (if Method 1 doesn't work)
-- DELETE dtd1
-- FROM Dealer_Trip_Details dtd1
-- INNER JOIN (
--     SELECT VIN_Number, MIN(Load_No) as Min_Load_No, MIN(Trip_No) as Min_Trip_No
--     FROM Dealer_Trip_Details 
--     WHERE VIN_Number IS NOT NULL AND VIN_Number != ''
--     GROUP BY VIN_Number
-- ) dtd2 ON dtd1.VIN_Number = dtd2.VIN_Number
-- WHERE dtd1.Load_No > dtd2.Min_Load_No 
--    OR (dtd1.Load_No = dtd2.Min_Load_No AND dtd1.Trip_No > dtd2.Min_Trip_No);
-- GO

-- Verify the results - should show no duplicates
SELECT 
    VIN_Number,
    COUNT(*) as RecordCount
FROM Dealer_Trip_Details 
WHERE VIN_Number IS NOT NULL AND VIN_Number != ''
GROUP BY VIN_Number
HAVING COUNT(*) > 1;
GO

-- Show final count of distinct VINs
SELECT 
    COUNT(DISTINCT VIN_Number) as Distinct_VIN_Count,
    COUNT(*) as Total_Records
FROM Dealer_Trip_Details 
WHERE VIN_Number IS NOT NULL AND VIN_Number != '';
GO

PRINT 'Duplicate VIN deletion completed successfully!';
