-- Create Arrival_At_Plant table
CREATE TABLE Arrival_At_Plant (
    id INT IDENTITY(1,1) PRIMARY KEY,
    transport_mode NVARCHAR(50) NOT NULL, -- 'Truck' or 'Self-Driven'
    yard_location NVARCHAR(100) NOT NULL,
    arrival_date DATE NOT NULL,
    arrival_time TIME NOT NULL,
    remarks NVARCHAR(500) NULL,
    truck_number NVARCHAR(50) NULL, -- Only for Truck mode
    vin_details NVARCHAR(MAX) NULL, -- Comma-separated VINs
    vehicle_details NVARCHAR(MAX) NULL, -- JSON string of vehicle details from OEM Pickup
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE()
);

-- Create indexes for better performance
CREATE INDEX IX_Arrival_At_Plant_Truck_Number ON Arrival_At_Plant(truck_number);
CREATE INDEX IX_Arrival_At_Plant_Arrival_Date ON Arrival_At_Plant(arrival_date);
CREATE INDEX IX_Arrival_At_Plant_Transport_Mode ON Arrival_At_Plant(transport_mode);

-- Create view for arrival records with formatted data
CREATE VIEW Arrival_At_Plant_View AS
SELECT 
    id,
    transport_mode,
    yard_location,
    arrival_date,
    arrival_time,
    remarks,
    truck_number,
    vin_details,
    vehicle_details,
    created_at,
    updated_at,
    CASE 
        WHEN transport_mode = 'Truck' THEN 'Truck Arrival'
        WHEN transport_mode = 'Self-Driven' THEN 'Self-Driven Arrival'
        ELSE 'Other'
    END as arrival_type_description
FROM Arrival_At_Plant;

PRINT 'Arrival At Plant table created successfully';
