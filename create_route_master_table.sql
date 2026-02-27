-- Create Route Master Table
CREATE TABLE ROUTE_MASTER (
    RouteId INT IDENTITY(1,1) PRIMARY KEY,
    From_Terminal VARCHAR(10) NOT NULL,
    To_Terminal VARCHAR(10) NOT NULL,
    Route_Type VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
    Billable_Distance VARCHAR(20) NOT NULL,
    Actual_Distance VARCHAR(20) NOT NULL,
    Route_Name VARCHAR(100) NOT NULL UNIQUE,
    Train_No_Prefix VARCHAR(50) NOT NULL,
    Beginning_Number VARCHAR(20) DEFAULT '0',
    AverageTime VARCHAR(20) NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create index for faster searches
CREATE INDEX IX_ROUTE_MASTER_ROUTE_NAME ON ROUTE_MASTER(Route_Name);
CREATE INDEX IX_ROUTE_MASTER_TERMINALS ON ROUTE_MASTER(From_Terminal, To_Terminal);
CREATE INDEX IX_ROUTE_MASTER_ROUTE_TYPE ON ROUTE_MASTER(Route_Type);

-- Create Sub Route Mapping Table
CREATE TABLE ROUTE_SUB_MAPPING (
    SubMappingId INT IDENTITY(1,1) PRIMARY KEY,
    RouteId INT NOT NULL,
    Sub_Route_Name VARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (RouteId) REFERENCES ROUTE_MASTER(RouteId) ON DELETE CASCADE
);

-- Create index for sub route mapping
CREATE INDEX IX_ROUTE_SUB_MAPPING_ROUTE_ID ON ROUTE_SUB_MAPPING(RouteId);

-- Insert sample data
INSERT INTO ROUTE_MASTER (From_Terminal, To_Terminal, Route_Type, Billable_Distance, Actual_Distance, Route_Name, Train_No_Prefix, Beginning_Number, AverageTime)
VALUES 
('CCH', 'ICOD', 'GENERAL', '1409', '1409', 'CCH-ICOD', 'CCH-ICOD', '0', '25'),
('CCH', 'PLHW', 'GENERAL', '1200', '1200', 'CCH-PLHW', 'CCH-PLHW', '0', '22'),
('CCH', 'PLPC', 'GENERAL', '980', '980', 'CCH-PLPC', 'CCH-PLPC', '0', '18'),
('CE', 'FN', 'GENERAL', '850', '850', 'CE-FN', 'CE-FN', '0', '16'),
('CE', 'ICOD', 'GENERAL', '1150', '1150', 'CE-ICOD', 'CE-ICOD', '0', '20'),
('CE', 'PLHW', 'GENERAL', '1050', '1050', 'CE-PLHW', 'CE-PLHW', '0', '19'),
('DETR', 'FN', 'GENERAL', '720', '720', 'DETR-FN', 'DETR-FN', '0', '14'),
('DETR', 'GDGH', 'GENERAL', '890', '890', 'DETR-GDGH', 'DETR-GDGH', '0', '17'),
('DETR', 'HYDE', 'GENERAL', '950', '950', 'DETR-HYDE', 'DETR-HYDE', '0', '18'),
('DETR', 'NDV', 'GENERAL', '1100', '1100', 'DETR-NDV', 'DETR-NDV', '0', '21'),
('DETR', 'SVMS', 'GENERAL', '820', '820', 'DETR-SVMS', 'DETR-SVMS', '0', '15'),
('DLIB', 'FN', 'GENERAL', '680', '680', 'DLIB-FN', 'DLIB-FN', '0', '13'),
('FN', 'DETR', 'GENERAL', '720', '720', 'FN-DETR', 'FN-DETR', '0', '14');

-- Create trigger to automatically update UpdatedAt timestamp
CREATE TRIGGER TR_ROUTE_MASTER_UPDATE
ON ROUTE_MASTER
AFTER UPDATE
AS
BEGIN
    UPDATE ROUTE_MASTER
    SET UpdatedAt = GETDATE()
    WHERE RouteId IN (SELECT RouteId FROM inserted)
END;
