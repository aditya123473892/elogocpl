-- Add test drivers to fix the empty array issue
USE [fleet3]
GO

-- Insert sample drivers
INSERT INTO DRIVER_MASTER (driver_name, driver_contact, driver_license, is_active)
VALUES 
('John Smith', '9876543210', 'DL-1234567890123', 1),
('Raj Kumar', '9876543211', 'DL-1234567890124', 1),
('Michael Johnson', '9876543212', 'DL-1234567890125', 1),
('David Wilson', '9876543213', 'DL-1234567890126', 1),
('James Brown', '9876543214', 'DL-1234567890127', 1)
GO

-- Verify the data
SELECT driver_id, driver_name, driver_contact, driver_license, is_active
FROM DRIVER_MASTER
ORDER BY driver_name
GO

PRINT 'Test drivers added successfully!'
GO
