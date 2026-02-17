-- Create Location Master table in fleet3 database
USE [fleet3]
GO

-- Drop table if exists
IF OBJECT_ID('[dbo].[LOCATION_MASTER2]', 'U') IS NOT NULL
    DROP TABLE [dbo].[LOCATION_MASTER2]
GO

-- Create Location Master table
CREATE TABLE [dbo].[LOCATION_MASTER2](
	[LocationId] [int] IDENTITY(1,1) NOT NULL,
	[LocationName] [varchar](100) NOT NULL,
	[LocationType] [varchar](30) NOT NULL,
	[Address] [varchar](500) NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[Image] [varchar](255) NULL,
	[Latitude] [decimal](9, 6) NULL,
	[Longitude] [decimal](9, 6) NULL,
PRIMARY KEY CLUSTERED 
(
	[LocationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Add default constraints
ALTER TABLE [dbo].[LOCATION_MASTER2] ADD  DEFAULT ((1)) FOR [IsActive]
GO

ALTER TABLE [dbo].[LOCATION_MASTER2] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO

-- Insert sample data
INSERT INTO [dbo].[LOCATION_MASTER2] (
    LocationName, LocationType, Address, IsActive, Image, Latitude, Longitude
) VALUES 
('Main Warehouse', 'WAREHOUSE', '123 Industrial Area, Mumbai, Maharashtra', 1, 'https://example.com/warehouse1.jpg', 19.0760, 72.8777),
('Factory Unit 1', 'FACTORY', '456 Factory Road, Pune, Maharashtra', 1, 'https://example.com/factory1.jpg', 18.5204, 73.8567),
('Regional Office', 'OFFICE', '789 Business Park, Bangalore, Karnataka', 1, 'https://example.com/office1.jpg', 12.9716, 77.5946),
('Transport Depot', 'DEPOT', '345 Transport Hub, Chennai, Tamil Nadu', 1, NULL, 13.0827, 80.2707),
('Railway Station', 'STATION', '567 Station Road, Delhi, NCR', 1, 'https://example.com/station1.jpg', 28.6139, 77.2090)
GO

PRINT 'Location Master table created successfully in fleet3 database'
GO
