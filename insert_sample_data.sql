-- Insert sample data for testing
USE [fleet3]
GO

-- Insert sample drivers
INSERT INTO [dbo].[DRIVER_MASTER] (
    driver_name, driver_contact, driver_license, transporter_id, is_active
) VALUES 
('John Smith', '9876543210', 'DL-1234567890123', 1, 1),
('Raj Kumar', '9876543211', 'DL-1234567890124', 2, 1),
('Michael Johnson', '9876543212', 'DL-1234567890125', 1, 1),
('David Wilson', '9876543213', 'DL-1234567890126', 3, 1),
('James Brown', '9876543214', 'DL-1234567890127', 2, 1)
GO

-- Insert sample vehicles
INSERT INTO [dbo].[VEHICLE_MASTER] (
    vehicle_number, vehicle_type, transporter_id, is_active, capacity_tonnes, current_driver_id
) VALUES 
('MH-12-AB-1234', 'TRUCK', 1, 1, 10.5, 1),
('MH-12-XY-5678', 'TRAILER', 2, 1, 20.0, 2),
('MH-12-PQ-9012', 'TANKER', 1, 1, 15.5, 3),
('MH-12-RS-3456', 'FLATBED', 3, 1, 25.0, NULL),
('MH-12-TU-7890', 'REFRIGERATED', 2, 1, 8.0, 4)
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

-- Show sample vehicles with driver assignments
SELECT v.vehicle_id, v.vehicle_number, v.vehicle_type, v.current_driver_id, 
       d.driver_name as assigned_driver
FROM VEHICLE_MASTER v
LEFT JOIN DRIVER_MASTER d ON v.current_driver_id = d.driver_id
ORDER BY v.vehicle_number
GO

PRINT 'Sample data inserted successfully'
GO
