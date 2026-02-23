-- Create Vehicle Master table in fleet3 database
USE [fleet3]
GO

-- Drop table if exists
IF OBJECT_ID('[dbo].[VEHICLE_MASTER]', 'U') IS NOT NULL
    DROP TABLE [dbo].[VEHICLE_MASTER]
GO

-- Create Vehicle Master table
CREATE TABLE [dbo].[VEHICLE_MASTER](
	[vehicle_id] [int] IDENTITY(1,1) NOT NULL,
	[vehicle_number] [varchar](20) NOT NULL,
	[vehicle_type] [varchar](50) NOT NULL,
	[transporter_id] [int] NULL,
	[is_active] [bit] NOT NULL,
	[created_at] [datetime] NOT NULL,
	[capacity_tonnes] [decimal](10, 2) NOT NULL,
	[default_driver_id] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[vehicle_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[vehicle_number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Add default constraints
ALTER TABLE [dbo].[VEHICLE_MASTER] ADD  DEFAULT ((1)) FOR [is_active]
GO

ALTER TABLE [dbo].[VEHICLE_MASTER] ADD  DEFAULT (getdate()) FOR [created_at]
GO

-- Insert sample data
INSERT INTO [dbo].[VEHICLE_MASTER] (
    vehicle_number, vehicle_type, transporter_id, is_active, capacity_tonnes, default_driver_id
) VALUES 
('MH-12-AB-1234', 'TRUCK', 1, 1, 10.5, 1),
('MH-12-XY-5678', 'TRAILER', 2, 1, 20.0, 2),
('MH-12-PQ-9012', 'TANKER', 1, 1, 15.5, 3),
('MH-12-RS-3456', 'FLATBED', 3, 1, 25.0, NULL),
('MH-12-TU-7890', 'REFRIGERATED', 2, 1, 8.0, 4)
GO

PRINT 'Vehicle Master table created successfully in fleet3 database'
GO
