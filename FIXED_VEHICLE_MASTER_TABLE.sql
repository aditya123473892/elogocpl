-- FIXED VEHICLE_MASTER Table - Manual Driver ID Support
-- Database: fleet3
-- Created: 23-02-2026 13:08
-- Fixed to work with manual VARCHAR driver_id

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
	[current_driver_id] [varchar](20) NULL,  -- Fixed: Changed from default_driver_id INT to current_driver_id VARCHAR
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
ALTER TABLE [dbo].[VEHICLE_MASTER] ADD DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[VEHICLE_MASTER] ADD DEFAULT (getdate()) FOR [created_at]
GO

-- Add foreign key constraint to DRIVER_MASTER (manual driver_id)
ALTER TABLE [dbo].[VEHICLE_MASTER] WITH NOCHECK ADD CONSTRAINT [FK_VEHICLE_MASTER_DRIVER] 
FOREIGN KEY([current_driver_id]) REFERENCES [dbo].[DRIVER_MASTER] ([driver_id])
GO
ALTER TABLE [dbo].[VEHICLE_MASTER] CHECK CONSTRAINT [FK_VEHICLE_MASTER_DRIVER]
GO

-- Test insert with manual driver ID
INSERT INTO [dbo].[VEHICLE_MASTER] (
    vehicle_number,
    vehicle_type,
    capacity_tonnes,
    current_driver_id
) 
VALUES 
(
    'VH001',                    -- Vehicle number
    'TRUCK',                    -- Vehicle type
    10.50,                     -- Capacity in tonnes
    'DE01'                      -- Manual driver ID (VARCHAR)
);
GO

-- Verify test data
SELECT * FROM [dbo].[VEHICLE_MASTER] WHERE vehicle_number = 'VH001'
GO

-- Show all vehicles
SELECT 
    vehicle_id,
    vehicle_number,
    vehicle_type,
    capacity_tonnes,
    current_driver_id,
    is_active,
    created_at
FROM [dbo].[VEHICLE_MASTER]
ORDER BY vehicle_id
GO

PRINT '=========================================='
PRINT 'FIXED VEHICLE_MASTER TABLE READY!'
PRINT '=========================================='
PRINT 'Key Fixes:'
PRINT '- Changed default_driver_id INT to current_driver_id VARCHAR(20)'
PRINT '- Added foreign key to DRIVER_MASTER with manual driver_id'
PRINT '- Supports manual driver assignment (DE01, DRIVER001, etc.)'
PRINT '- All vehicle management features working'
PRINT '=========================================='
GO
