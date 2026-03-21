-- Create TERMINAL_MASTER table for managing railway terminals
-- This table will store terminal information used in rake planning and visit management

USE [fleet3]
GO

-- Drop table if it exists to recreate
IF OBJECT_ID('dbo.TERMINAL_MASTER', 'U') IS NOT NULL
    DROP TABLE dbo.TERMINAL_MASTER
GO

-- Create TERMINAL_MASTER table
CREATE TABLE [dbo].[TERMINAL_MASTER](
    [TerminalId] [int] IDENTITY(1,1) NOT NULL,
    [TerminalCode] [varchar](10) NOT NULL,
    [TerminalName] [varchar](100) NOT NULL,
    [TerminalType] [varchar](20) NULL,
    [Location] [varchar](200) NULL,
    [State] [varchar](50) NULL,
    [Country] [varchar](50) NULL,
    [Pincode] [varchar](10) NULL,
    [ContactPerson] [varchar](100) NULL,
    [ContactNumber] [varchar](20) NULL,
    [Email] [varchar](100) NULL,
    [IsActive] [bit] NOT NULL DEFAULT 1,
    [Capacity] [int] NULL,
    [OperatingHours] [varchar](100) NULL,
    [RailwayZone] [varchar](50) NULL,
    [Division] [varchar](50) NULL,
    [Latitude] [decimal](10, 8) NULL,
    [Longitude] [decimal](11, 8) NULL,
    [CreatedBy] [varchar](100) NULL,
    [CreatedOn] [datetime] NOT NULL DEFAULT GETDATE(),
    [UpdatedBy] [varchar](100) NULL,
    [UpdatedOn] [datetime] NULL,
 CONSTRAINT [PK_TERMINAL_MASTER] PRIMARY KEY CLUSTERED 
(
    [TerminalId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Add unique constraint on TerminalCode
ALTER TABLE [dbo].[TERMINAL_MASTER] ADD CONSTRAINT [UQ_TERMINAL_MASTER_TerminalCode] UNIQUE NONCLUSTERED 
(
    [TerminalCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

-- Add index on TerminalCode for faster lookups
CREATE NONCLUSTERED INDEX [IX_TERMINAL_MASTER_TerminalCode] ON [dbo].[TERMINAL_MASTER] 
(
    [TerminalCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

-- Add index on IsActive for filtering active terminals
CREATE NONCLUSTERED INDEX [IX_TERMINAL_MASTER_IsActive] ON [dbo].[TERMINAL_MASTER] 
(
    [IsActive] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

-- Insert initial terminal data based on the TERMINAL_OPTIONS from frontend
INSERT INTO [dbo].[TERMINAL_MASTER] 
(
    [TerminalCode], 
    [TerminalName], 
    [TerminalType], 
    [Location], 
    [State], 
    [Country],
    [IsActive],
    [CreatedBy]
)
VALUES 
    ('CCH', 'Kolkata CCH', 'Inbound Terminal', 'Kolkata', 'West Bengal', 'India', 1, 'System'),
    ('ICOD', 'ICOD Terminal', 'Inbound Terminal', 'Kolkata', 'West Bengal', 'India', 1, 'System'),
    ('PLHW', 'Palaswade HW', 'Outbound Terminal', 'Palaswade', 'Maharashtra', 'India', 1, 'System'),
    ('PLPC', 'Palaswade PC', 'Outbound Terminal', 'Palaswade', 'Maharashtra', 'India', 1, 'System'),
    ('CE', 'Central Terminal', 'Hub Terminal', 'Mumbai', 'Maharashtra', 'India', 1, 'System'),
    ('FN', 'Final Terminal', 'Destination Terminal', 'Delhi', 'Delhi', 'India', 1, 'System'),
    ('DETR', 'Detraining Terminal', 'Processing Terminal', 'Chennai', 'Tamil Nadu', 'India', 1, 'System'),
    ('GDGH', 'Ghod Dodhi', 'Yard Terminal', 'Ghod Dodhi', 'Jharkhand', 'India', 1, 'System'),
    ('HYDE', 'Hyderabad Terminal', 'Hub Terminal', 'Hyderabad', 'Telangana', 'India', 1, 'System'),
    ('NDV', 'Nandivaram', 'Yard Terminal', 'Nandivaram', 'Tamil Nadu', 'India', 1, 'System'),
    ('SVMS', 'Savarmavadi', 'Yard Terminal', 'Savarmavadi', 'Maharashtra', 'India', 1, 'System'),
    ('DLIB', 'Delhi IB', 'Inbound Terminal', 'Delhi', 'Delhi', 'India', 1, 'System'),
    ('BRC', 'Vadodara BRC', 'Hub Terminal', 'Vadodara', 'Gujarat', 'India', 1, 'System'),
    ('BCT', 'Vadodara BCT', 'Hub Terminal', 'Vadodara', 'Gujarat', 'India', 1, 'System'),
    ('NDLS', 'New Delhi Station', 'Major Terminal', 'New Delhi', 'Delhi', 'India', 1, 'System'),
    ('MAS', 'Chennai MAS', 'Major Terminal', 'Chennai', 'Tamil Nadu', 'India', 1, 'System')
GO

-- Create trigger to automatically update UpdatedOn timestamp
CREATE TRIGGER [TR_TERMINAL_MASTER_UPDATE]
ON [dbo].[TERMINAL_MASTER]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE [dbo].[TERMINAL_MASTER]
    SET [UpdatedOn] = GETDATE()
    FROM inserted i
    WHERE [TerminalId] = i.[TerminalId];
END
GO

-- Grant permissions (adjust as needed for your environment)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.TERMINAL_MASTER TO [your_user_role]
-- GO

PRINT 'TERMINAL_MASTER table created successfully with initial data!'
GO
