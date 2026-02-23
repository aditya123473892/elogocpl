-- Create Driver Master table in fleet3 database
USE [fleet3]
GO

-- Drop existing tables and constraints if they exist
-- Drop foreign key constraints first
DECLARE @sql NVARCHAR(MAX) = '';
SELECT @sql = @sql + 'ALTER TABLE ' + OBJECT_SCHEMA_NAME(parent_object_id) + '.' + OBJECT_NAME(parent_object_id) + ' DROP CONSTRAINT ' + name + ';' + CHAR(13)
FROM sys.foreign_keys
WHERE referenced_object_id IN (OBJECT_ID('[dbo].[VEHICLE_MASTER]'), OBJECT_ID('[dbo].[VEHICLE_MASTER]'), OBJECT_ID('[dbo].[DRIVER_MASTER]'));

IF @sql <> ''
    EXEC sp_executesql @sql;
GO

-- Drop the existing tables
IF OBJECT_ID('[dbo].[VEHICLE_MASTER]', 'U') IS NOT NULL
    DROP TABLE [dbo].[VEHICLE_MASTER]
GO

IF OBJECT_ID('[dbo].[VEHICLE_MASTER]', 'U') IS NOT NULL
    DROP TABLE [dbo].[VEHICLE_MASTER]
GO

IF OBJECT_ID('[dbo].[DRIVER_MASTER]', 'U') IS NOT NULL
    DROP TABLE [dbo].[DRIVER_MASTER]
GO

PRINT 'Old tables dropped successfully'
GO

-- Create Driver Master table
CREATE TABLE [dbo].[DRIVER_MASTER](
    [driver_id] [int] IDENTITY(1,1) NOT NULL,
    [driver_name] [varchar](100) NOT NULL,
    [driver_contact] [varchar](20) NOT NULL,
    [driver_license] [varchar](50) NULL,
    [transporter_id] [int] NULL,
    [is_active] [bit] NOT NULL DEFAULT 1,
    [created_at] [datetime] NOT NULL DEFAULT GETDATE(),
    [updated_at] [datetime] NULL,
    [qr_code_data] [varchar](255) NULL,
    PRIMARY KEY CLUSTERED ([driver_id] ASC),
    UNIQUE NONCLUSTERED ([driver_contact] ASC)
) ON [PRIMARY]
GO

-- Create Vehicle Master table with driver mapping
CREATE TABLE [dbo].[VEHICLE_MASTER](
    [vehicle_id] [int] IDENTITY(1,1) NOT NULL,
    [vehicle_number] [varchar](20) NOT NULL,
    [vehicle_type] [varchar](50) NOT NULL,
    [transporter_id] [int] NULL,
    [is_active] [bit] NOT NULL DEFAULT 1,
    [created_at] [datetime] NOT NULL DEFAULT GETDATE(),
    [capacity_tonnes] [decimal](10, 2) NOT NULL,
    [current_driver_id] [int] NULL,
    PRIMARY KEY CLUSTERED ([vehicle_id] ASC),
    UNIQUE NONCLUSTERED ([vehicle_number] ASC)
) ON [PRIMARY]
GO

-- Add foreign key constraint for driver mapping
ALTER TABLE [dbo].[VEHICLE_MASTER] WITH CHECK ADD CONSTRAINT [FK_VEHICLE_MASTER_DRIVER] 
FOREIGN KEY([current_driver_id]) REFERENCES [dbo].[DRIVER_MASTER] ([driver_id])
GO

-- Create trigger to update QR code data
CREATE TRIGGER [dbo].[TR_DRIVER_MASTER_QR_UPDATE]
ON [dbo].[DRIVER_MASTER]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE [dbo].[DRIVER_MASTER]
    SET qr_code_data = 'DRIVER-' + CAST(driver_id AS VARCHAR(10)) + '-' + REPLACE(driver_contact, '-', '')
    WHERE driver_id IN (SELECT driver_id FROM inserted)
END
GO

-- Insert sample data into DRIVER_MASTER
INSERT INTO [dbo].[DRIVER_MASTER] (
    driver_name, driver_contact, driver_license, transporter_id, is_active
) VALUES 
('John Smith', '9876543210', 'DL-1234567890123', 1, 1),
('Raj Kumar', '9876543211', 'DL-1234567890124', 2, 1),
('Michael Johnson', '9876543212', 'DL-1234567890125', 1, 1),
('David Wilson', '9876543213', 'DL-1234567890126', 3, 1),
('James Brown', '9876543214', 'DL-1234567890127', 2, 1)
GO

-- Insert sample data into VEHICLE_MASTER
INSERT INTO [dbo].[VEHICLE_MASTER] (
    vehicle_number, vehicle_type, transporter_id, is_active, capacity_tonnes, current_driver_id
) VALUES 
('MH-12-AB-1234', 'TRUCK', 1, 1, 10.5, 1),
('MH-12-XY-5678', 'TRAILER', 2, 1, 20.0, 2),
('MH-12-PQ-9012', 'TANKER', 1, 1, 15.5, 3),
('MH-12-RS-3456', 'FLATBED', 3, 1, 25.0, NULL),
('MH-12-TU-7890', 'REFRIGERATED', 2, 1, 8.0, 4)
GO

-- Create indexes for better performance
CREATE INDEX IX_DRIVER_MASTER_TRANSPORTER_ID ON DRIVER_MASTER(transporter_id);
CREATE INDEX IX_DRIVER_MASTER_IS_ACTIVE ON DRIVER_MASTER(is_active);
CREATE INDEX IX_VEHICLE_MASTER_TRANSPORTER_ID ON VEHICLE_MASTER(transporter_id);
CREATE INDEX IX_VEHICLE_MASTER_CURRENT_DRIVER_ID ON VEHICLE_MASTER(current_driver_id);
CREATE INDEX IX_VEHICLE_MASTER_IS_ACTIVE ON VEHICLE_MASTER(is_active);
GO

PRINT 'Driver Master and Vehicle Master tables created successfully'
GO

-- Create a sample TRANSPORTER_MASTER table if it doesn't exist
IF OBJECT_ID('[dbo].[TRANSPORTER_MASTER]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[TRANSPORTER_MASTER](
        [transporter_id] [int] IDENTITY(1,1) NOT NULL,
        [transporter_name] [varchar](100) NOT NULL,
        [transporter_code] [varchar](20) NULL,
        [is_active] [bit] NOT NULL DEFAULT 1,
        [created_at] [datetime] NOT NULL DEFAULT GETDATE(),
        PRIMARY KEY CLUSTERED ([transporter_id] ASC)
    ) ON [PRIMARY]
    
    -- Insert sample transporter data
    INSERT INTO [dbo].[TRANSPORTER_MASTER] (transporter_name, transporter_code, is_active)
    VALUES 
    ('ABC Transporters', 'ABC001', 1),
    ('XYZ Logistics', 'XYZ002', 1),
    ('PQR Carriers', 'PQR003', 1)
    
    PRINT 'Transporter Master table created with sample data'
END
GO

-- Verify the data
SELECT 'DRIVER_MASTER' as table_name, COUNT(*) as record_count FROM DRIVER_MASTER
UNION ALL
SELECT 'VEHICLE_MASTER' as table_name, COUNT(*) as record_count FROM VEHICLE_MASTER
UNION ALL
SELECT 'TRANSPORTER_MASTER' as table_name, COUNT(*) as record_count FROM TRANSPORTER_MASTER
GO

PRINT 'Database setup completed successfully'
GO
