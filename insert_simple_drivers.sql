-- Insert sample drivers without transporter dependencies
USE [fleet3]
GO

-- Insert sample drivers
INSERT INTO [dbo].[DRIVER_MASTER] (
    driver_name, driver_contact, driver_license, is_active
) VALUES 
('John Smith', '9876543210', 'DL-1234567890123', 1),
('Raj Kumar', '9876543211', 'DL-1234567890124', 1),
('Michael Johnson', '9876543212', 'DL-1234567890125', 1),
('David Wilson', '9876543213', 'DL-1234567890126', 1),
('James Brown', '9876543214', 'DL-1234567890127', 1)
GO

-- Insert sample vehicles without driver assignment
INSERT INTO [dbo].[VEHICLE_MASTER] (
    vehicle_number, vehicle_type, transporter_id, is_active, capacity_tonnes, current_driver_id
) VALUES 
('MH-12-AB-1234', 'TRUCK', NULL, 1, 10.5, NULL),
('MH-12-XY-5678', 'TRAILER', NULL, 1, 20.0, NULL),
('MH-12-PQ-9012', 'TANKER', NULL, 1, 15.5, NULL),
('MH-12-RS-3456', 'FLATBED', NULL, 1, 25.0, NULL),
('MH-12-TU-7890', 'REFRIGERATED', NULL, 1, 8.0, NULL)
GO

-- Verify the data
SELECT 'DRIVER_MASTER' as table_name, COUNT(*) as record_count FROM DRIVER_MASTER
UNION ALL
SELECT 'VEHICLE_MASTER' as table_name, COUNT(*) as record_count FROM VEHICLE_MASTER
GO

-- Show sample drivers with QR codes
SELECT driver_id, driver_name, driver_contact, qr_code_data, is_active
FROM DRIVER_MASTER
ORDER BY driver_name
GO

PRINT 'Sample drivers inserted successfully (no transporter dependencies)'
GO
