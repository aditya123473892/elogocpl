-- Last_Mile_Departure Table with Single VIN Per Row - Scalable Approach
USE [fleet3]
GO

-- Drop existing objects
IF OBJECT_ID('[dbo].[Last_Mile_Departure]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Last_Mile_Departure]
GO

IF OBJECT_ID('[dbo].[Last_Mile_Departure_VINs]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Last_Mile_Departure_VINs]
GO

IF OBJECT_ID('[dbo].[Available_VINs_LastMile_View]', 'V') IS NOT NULL
    DROP VIEW [dbo].[Available_VINs_LastMile_View]
GO

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
GO

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
GO

-- Create indexes for better performance
CREATE INDEX [IX_Last_Mile_Departure_Created_At] ON [dbo].[Last_Mile_Departure]([Created_At]);
CREATE INDEX [IX_Last_Mile_Departure_Truck_Number] ON [dbo].[Last_Mile_Departure]([Truck_Number]);
CREATE INDEX [IX_Last_Mile_Departure_Departure_Date] ON [dbo].[Last_Mile_Departure]([Departure_Date]);
CREATE INDEX [IX_Last_Mile_Departure_VINs_Departure_ID] ON [dbo].[Last_Mile_Departure_VINs]([Departure_ID]);
CREATE INDEX [IX_Last_Mile_Departure_VINs_VIN_Number] ON [dbo].[Last_Mile_Departure_VINs]([VIN_Number]);
GO

-- Create unique constraints to prevent duplicate VINs per departure
ALTER TABLE [dbo].[Last_Mile_Departure_VINs] 
ADD CONSTRAINT [UQ_Last_Mile_Departure_VINs_Departure_VIN] 
UNIQUE ([Departure_ID], [VIN_Number]);

-- Prevent same VIN from being used in multiple last mile departures
ALTER TABLE [dbo].[Last_Mile_Departure_VINs] 
ADD CONSTRAINT [UQ_Last_Mile_Departure_VINs_VIN] 
UNIQUE ([VIN_Number]);
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
    )
GO

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
GO

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
GO

SELECT 'Last_Mile_Departure table created successfully - Single table with VIN columns approach' as Status;
