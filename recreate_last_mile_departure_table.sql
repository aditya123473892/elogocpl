-- =====================================================
-- Recreate Last Mile Departure Table
-- =====================================================
-- This script will:
-- 1. Backup any existing data
-- 2. Drop old tables/views
-- 3. Create new tables with correct structure
-- 4. Verify creation

USE [fleet3]
GO

PRINT 'Starting Last Mile Departure table recreation...'
PRINT '================================================'

-- =====================================================
-- STEP 1: Backup existing data (if table exists)
-- =====================================================

IF OBJECT_ID('[dbo].[Last_Mile_Departure]', 'U') IS NOT NULL
BEGIN
    PRINT 'Step 1: Backing up existing Last Mile Departure data...'
    
    -- Create backup table if it doesn't exist
    IF OBJECT_ID('[dbo].[Last_Mile_Departure_Backup]', 'U') IS NULL
    BEGIN
        SELECT * INTO [dbo].[Last_Mile_Departure_Backup]
        FROM [dbo].[Last_Mile_Departure]
        WHERE 1=0; -- Create empty backup table with same structure
        
        PRINT 'Created backup table: Last_Mile_Departure_Backup'
    END
    
    -- Backup data if there's any data
    IF EXISTS (SELECT 1 FROM [dbo].[Last_Mile_Departure])
    BEGIN
        INSERT INTO [dbo].[Last_Mile_Departure_Backup]
        SELECT * FROM [dbo].[Last_Mile_Departure]
        
        PRINT 'Backed up ' + CAST(COUNT(*) AS VARCHAR(10)) + ' records from Last_Mile_Departure'
    END
    ELSE
    BEGIN
        PRINT 'No existing data to backup in Last_Mile_Departure'
    END
END
ELSE
BEGIN
    PRINT 'Step 1: No existing Last_Mile_Departure table found - skipping backup'
END

PRINT ''
GO

-- =====================================================
-- STEP 2: Drop old objects
-- =====================================================

PRINT 'Step 2: Dropping old objects...'

-- Drop views first
IF OBJECT_ID('[dbo].[Last_Mile_Departure_With_VINs_View]', 'V') IS NOT NULL
BEGIN
    DROP VIEW [dbo].[Last_Mile_Departure_With_VINs_View]
    PRINT 'Dropped view: Last_Mile_Departure_With_VINs_View'
END

IF OBJECT_ID('[dbo].[Available_VINs_LastMile_View]', 'V') IS NOT NULL
BEGIN
    DROP VIEW [dbo].[Available_VINs_LastMile_View]
    PRINT 'Dropped view: Available_VINs_LastMile_View'
END

-- Drop VINs table first (due to foreign key)
IF OBJECT_ID('[dbo].[Last_Mile_Departure_VINs]', 'U') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[Last_Mile_Departure_VINs]
    PRINT 'Dropped table: Last_Mile_Departure_VINs'
END

-- Drop main table
IF OBJECT_ID('[dbo].[Last_Mile_Departure]', 'U') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[Last_Mile_Departure]
    PRINT 'Dropped table: Last_Mile_Departure'
END

-- Drop any functions
IF OBJECT_ID('[dbo].[fn_GetLastMileVINs]', 'FN') IS NOT NULL
BEGIN
    DROP FUNCTION [dbo].[fn_GetLastMileVINs]
    PRINT 'Dropped function: fn_GetLastMileVINs'
END

-- Drop any triggers
IF OBJECT_ID('[dbo].[TR_Last_Mile_Departure_Update]', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER [dbo].[TR_Last_Mile_Departure_Update]
    PRINT 'Dropped trigger: TR_Last_Mile_Departure_Update'
END

IF OBJECT_ID('[dbo].[TR_Last_Mile_Departure_VIN_Count]', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER [dbo].[TR_Last_Mile_Departure_VIN_Count]
    PRINT 'Dropped trigger: TR_Last_Mile_Departure_VIN_Count'
END

PRINT 'All old objects dropped successfully'
PRINT ''
GO

-- =====================================================
-- STEP 3: Create new tables with correct structure
-- =====================================================

PRINT 'Step 3: Creating new Last Mile Departure tables...'

-- Create Last_Mile_Departure master table (one record per departure - MASTER RECORD)
CREATE TABLE [dbo].[Last_Mile_Departure](
    [ID] [int] IDENTITY(1,1) PRIMARY KEY,
    [Plant] [nvarchar](100) NOT NULL,
    [Yard_Location] [nvarchar](100) NOT NULL,
    [Vendor_Transporter] [nvarchar](100) NOT NULL,
    [Truck_Number] [nvarchar](50) NOT NULL,
    [Departure_Date] [date] NOT NULL,
    [Delivery_Date] [date] NOT NULL,
    [Arrival_Time] [time](7) NULL,
    [Departure_Time] [time](7) NULL,
    [Driver_Name] [nvarchar](100) NOT NULL,
    [Remarks] [nvarchar](500) NULL,
    [Transportation_Type] [nvarchar](20) DEFAULT 'TRUCK',
    [Status] [nvarchar](20) DEFAULT 'Active',
    [VIN_Count] [int] DEFAULT 0, -- Track number of VINs for performance
    [Created_At] [datetime] DEFAULT GETDATE(),
    [Updated_At] [datetime] DEFAULT GETDATE()
);
PRINT 'Created table: Last_Mile_Departure'

-- Create Last_Mile_Departure VINs table (each VIN in separate row - UNLIMITED SCALABILITY)
CREATE TABLE [dbo].[Last_Mile_Departure_VINs](
    [ID] [int] IDENTITY(1,1) PRIMARY KEY,
    [Departure_ID] [int] NOT NULL,
    [VIN_Number] [nvarchar](50) NOT NULL,
    [VIN_Position] [int] NOT NULL, -- Position for ordering (1, 2, 3...)
    [Created_At] [datetime] DEFAULT GETDATE(),
    -- Foreign key relationship with cascade delete
    CONSTRAINT [FK_Last_Mile_Departure_VINs_Departure] FOREIGN KEY ([Departure_ID]) REFERENCES [dbo].[Last_Mile_Departure]([ID]) ON DELETE CASCADE
);
PRINT 'Created table: Last_Mile_Departure_VINs'
GO

-- Create indexes for better performance
CREATE INDEX [IX_Last_Mile_Departure_Created_At] ON [dbo].[Last_Mile_Departure]([Created_At]);
CREATE INDEX [IX_Last_Mile_Departure_Truck_Number] ON [dbo].[Last_Mile_Departure]([Truck_Number]);
CREATE INDEX [IX_Last_Mile_Departure_Departure_Date] ON [dbo].[Last_Mile_Departure]([Departure_Date]);
CREATE INDEX [IX_Last_Mile_Departure_VINs_Departure_ID] ON [dbo].[Last_Mile_Departure_VINs]([Departure_ID]);
CREATE INDEX [IX_Last_Mile_Departure_VINs_VIN_Number] ON [dbo].[Last_Mile_Departure_VINs]([VIN_Number]);
PRINT 'Created indexes'

-- Create unique constraints to prevent duplicate VINs per departure
ALTER TABLE [dbo].[Last_Mile_Departure_VINs] 
ADD CONSTRAINT [UQ_Last_Mile_Departure_VINs_Departure_VIN] 
UNIQUE ([Departure_ID], [VIN_Number]);

-- Prevent same VIN from being used in multiple last mile departures
ALTER TABLE [dbo].[Last_Mile_Departure_VINs] 
ADD CONSTRAINT [UQ_Last_Mile_Departure_VINs_VIN] 
UNIQUE ([VIN_Number]);
PRINT 'Created unique constraints'
GO

-- Create view for available VINs (VINs from OEM_Pickup that haven't been used in Last Mile Departure)
CREATE VIEW [dbo].[Available_VINs_LastMile_View] AS
SELECT DISTINCT 
    o.VIN_Number
FROM [dbo].[OEM_Pickup] o
WHERE o.VIN_Number IS NOT NULL 
    AND o.VIN_Number != ''
    AND o.Status = 'Active' -- Only from active OEM pickups
    AND NOT EXISTS (
        SELECT 1 FROM [dbo].[Last_Mile_Departure_VINs] lmdv
        WHERE lmdv.VIN_Number = o.VIN_Number
    );
PRINT 'Created view: Available_VINs_LastMile_View'

-- Create view with VINs as comma-separated string for easy display
CREATE VIEW [dbo].[Last_Mile_Departure_With_VINs_View] AS
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
    lmd.Created_At,
    lmd.Updated_At,
    lmd.VIN_Count,
    -- Get VINs as comma-separated string using STRING_AGG (SQL Server 2017+)
    STUFF((
        SELECT ', ' + VIN_Number 
        FROM [dbo].[Last_Mile_Departure_VINs] lmdv 
        WHERE lmdv.Departure_ID = lmd.ID 
        ORDER BY lmdv.VIN_Position
        FOR XML PATH(''), TYPE
    ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS VIN_Details
FROM [dbo].[Last_Mile_Departure] lmd;
PRINT 'Created view: Last_Mile_Departure_With_VINs_View'
GO

-- Create trigger to automatically update Updated_At column
CREATE TRIGGER [dbo].[TR_Last_Mile_Departure_Update]
ON [dbo].[Last_Mile_Departure]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE [dbo].[Last_Mile_Departure]
    SET Updated_At = GETDATE()
    FROM [dbo].[Last_Mile_Departure] lmd
    INNER JOIN inserted i ON lmd.ID = i.ID;
END
PRINT 'Created trigger: TR_Last_Mile_Departure_Update'

-- Create trigger to update VIN_Count when VINs are added/removed
CREATE TRIGGER [dbo].[TR_Last_Mile_Departure_VIN_Count]
ON [dbo].[Last_Mile_Departure_VINs]
AFTER INSERT, DELETE, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update VIN_Count for all affected departures
    UPDATE lmd
    SET lmd.VIN_Count = (
        SELECT COUNT(*) 
        FROM [dbo].[Last_Mile_Departure_VINs] lmdv 
        WHERE lmdv.Departure_ID = lmd.ID
    )
    FROM [dbo].[Last_Mile_Departure] lmd
    WHERE lmd.ID IN (
        SELECT Departure_ID FROM inserted
        UNION
        SELECT Departure_ID FROM deleted
    );
END
PRINT 'Created trigger: TR_Last_Mile_Departure_VIN_Count'
GO

-- =====================================================
-- STEP 4: Verify creation
-- =====================================================

PRINT 'Step 4: Verifying table creation...'
PRINT ''

-- Check if all objects were created successfully
IF OBJECT_ID('[dbo].[Last_Mile_Departure]', 'U') IS NOT NULL
    PRINT '✅ Last_Mile_Departure table created successfully'
ELSE
    PRINT '❌ Last_Mile_Departure table creation failed'

IF OBJECT_ID('[dbo].[Last_Mile_Departure_VINs]', 'U') IS NOT NULL
    PRINT '✅ Last_Mile_Departure_VINs table created successfully'
ELSE
    PRINT '❌ Last_Mile_Departure_VINs table creation failed'

IF OBJECT_ID('[dbo].[Available_VINs_LastMile_View]', 'V') IS NOT NULL
    PRINT '✅ Available_VINs_LastMile_View view created successfully'
ELSE
    PRINT '❌ Available_VINs_LastMile_View view creation failed'

IF OBJECT_ID('[dbo].[Last_Mile_Departure_With_VINs_View]', 'V') IS NOT NULL
    PRINT '✅ Last_Mile_Departure_With_VINs_View view created successfully'
ELSE
    PRINT '❌ Last_Mile_Departure_With_VINs_View view creation failed'

-- Show table information
PRINT ''
PRINT 'Table Information:'
PRINT '=================='

SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME LIKE '%Last_Mile_Departure%'
ORDER BY TABLE_NAME;

PRINT ''
PRINT 'View Information:'
PRINT '================='

SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.VIEWS 
WHERE TABLE_NAME LIKE '%Last_Mile_Departure%'
ORDER BY TABLE_NAME;

PRINT ''
PRINT '================================================'
PRINT '✅ Last Mile Departure table recreation completed successfully!'
PRINT '================================================'

-- Test query to verify available VINs view works
PRINT 'Testing Available VINs View:'
DECLARE @AvailableVINs INT;
SELECT @AvailableVINs = COUNT(*) FROM [dbo].[Available_VINs_LastMile_View];
PRINT 'Found ' + CAST(@AvailableVINs AS VARCHAR(10)) + ' available VINs from OEM Pickup'

PRINT ''
PRINT 'Ready for backend API integration!'
