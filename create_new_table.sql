-- Create new simplified Dealer_Trip_Details table
USE [fleet3]
GO

-- Drop old table if exists
IF OBJECT_ID('[dbo].[Dealer_Trip_Details]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Dealer_Trip_Details]
GO

-- Create new table with simplified structure
CREATE TABLE [dbo].[Dealer_Trip_Details](
	[Rake_NO] [nvarchar](50) NULL,
	[Load_No] [nvarchar](50) NULL,
	[Trip_No] [nvarchar](50) NULL,
	[INVOICE_NO] [nvarchar](50) NULL,
	[Invoice_Date] [datetime] NULL,
	[Destination_City] [nvarchar](100) NULL,
	[Production_Model] [nvarchar](50) NULL,
	[GR_Number] [nvarchar](50) NULL,
	[Engine_No] [nvarchar](50) NULL,
	[VIN_Number] [nvarchar](50) NULL,
	[Sales_Model] [nvarchar](50) NULL,
	[Dealer_Name] [nvarchar](100) NULL,
	[LOCATION] [nvarchar](100) NULL,
	[EWAY_BILL] [nvarchar](50) NULL,
	[VALID_TILL] [datetime] NULL
) ON [PRIMARY]
GO

-- Insert sample data
INSERT INTO [dbo].[Dealer_Trip_Details] (
    [Rake_NO], [Load_No], [Trip_No], [INVOICE_NO], [Invoice_Date], 
    [Destination_City], [Production_Model], [GR_Number], [Engine_No], 
    [VIN_Number], [Sales_Model], [Dealer_Name], [LOCATION], 
    [EWAY_BILL], [VALID_TILL]
) VALUES (
    'R001', 'L1001', 'T5001', 'INV-001', '2024-01-10', 
    'Mumbai', 'PM-AX1', 'GR78901', 'ENG001', 
    'VIN0001', 'SM-X', 'ABC Motors', 'Mumbai', 
    'EB12345', '2024-02-10'
)
GO
