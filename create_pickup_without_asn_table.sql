-- Create table for Pickup Without ASN functionality
CREATE TABLE pickup_without_asn (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plant VARCHAR(100) NOT NULL,
    yard_location VARCHAR(100) NOT NULL,
    vendor_transporter VARCHAR(200) NOT NULL,
    truck_number VARCHAR(50) NOT NULL,
    vin_details JSON NOT NULL,
    pickup_date DATE NOT NULL,
    delivery_date DATE NOT NULL,
    arrival_time TIME NULL,
    departure_time TIME NULL,
    driver_name VARCHAR(200) NOT NULL,
    remarks TEXT,
    transportation_type VARCHAR(50) NOT NULL DEFAULT 'TRUCK',
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_plant (plant),
    INDEX idx_driver_name (driver_name),
    INDEX idx_pickup_date (pickup_date),
    INDEX idx_truck_number (truck_number),
    INDEX idx_created_at (created_at)
);

-- Add foreign key constraints if needed
-- ALTER TABLE pickup_without_asn 
-- ADD CONSTRAINT fk_pickup_driver FOREIGN KEY (driver_name) REFERENCES driver_master(driver_name);

-- Insert sample data (optional)
INSERT INTO pickup_without_asn (
    plant, yard_location, vendor_transporter, truck_number, 
    vin_details, pickup_date, delivery_date, arrival_time, 
    departure_time, driver_name, remarks, transportation_type, created_by
) VALUES (
    'Plant A', 'Yard 1', 'Transporter A Ltd.', 'DL6CV7887',
    JSON_ARRAY('VIN001', 'VIN002', 'VIN003'),
    '2024-01-15', '2024-01-16', '09:30:00', '14:45:00',
    'John Doe', 'Sample pickup without ASN', 'TRUCK', 'admin'
);
