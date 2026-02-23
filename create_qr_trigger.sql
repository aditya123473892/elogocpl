-- Create QR Code Trigger for Driver Master
USE [fleet3]
GO

-- Drop existing trigger if it exists
IF OBJECT_ID('[dbo].[TR_DRIVER_MASTER_QR_UPDATE]', 'TR') IS NOT NULL
    DROP TRIGGER [dbo].[TR_DRIVER_MASTER_QR_UPDATE]
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

PRINT 'QR Code trigger created successfully'
GO

-- Test the trigger by inserting a sample driver
INSERT INTO [dbo].[DRIVER_MASTER] (
    driver_name, driver_contact, driver_license, is_active
) VALUES 
('Test Driver', '9999999999', 'DL-TEST123', 1)
GO

-- Check if QR code was generated
SELECT driver_id, driver_name, driver_contact, qr_code_data 
FROM DRIVER_MASTER 
WHERE driver_name = 'Test Driver'
GO

-- Clean up test data
DELETE FROM DRIVER_MASTER WHERE driver_name = 'Test Driver'
GO

PRINT 'QR Code trigger test completed successfully'
GO
