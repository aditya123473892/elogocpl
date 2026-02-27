-- Create Rake Planning table
CREATE TABLE RAKE_PLANNING (
    PlanId INT IDENTITY(1,1) PRIMARY KEY,
    Rake_Name NVARCHAR(100) NOT NULL,
    Base_Depot NVARCHAR(50) NOT NULL,
    Rake_Operator NVARCHAR(100) NOT NULL,
    Haulage_Paid_By NVARCHAR(50) NOT NULL,
    Trip_No NVARCHAR(50) NOT NULL UNIQUE,
    Sub_Route NVARCHAR(100) DEFAULT 'Main Route',
    Journey_Id NVARCHAR(100),
    IB_Train_No NVARCHAR(100),
    Rake_Owner NVARCHAR(100) NOT NULL,
    Plan_Type NVARCHAR(50) NOT NULL,
    Device_ID NVARCHAR(50),
    Route NVARCHAR(100) NOT NULL,
    Train_No NVARCHAR(100),
    Plan_Date NVARCHAR(50),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME
);

-- Create index for faster searches
CREATE INDEX IX_RAKE_PLANNING_RAKE_NAME ON RAKE_PLANNING(Rake_Name);
CREATE INDEX IX_RAKE_PLANNING_ROUTE ON RAKE_PLANNING(Route);
CREATE INDEX IX_RAKE_PLANNING_PLAN_TYPE ON RAKE_PLANNING(Plan_Type);
CREATE INDEX IX_RAKE_PLANNING_TRIP_NO ON RAKE_PLANNING(Trip_No);
GO

-- Drop existing trigger if it exists
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_RAKE_PLANNING_UPDATE')
BEGIN
    DROP TRIGGER TR_RAKE_PLANNING_UPDATE;
END
GO

-- Create trigger to automatically update UpdatedAt
CREATE TRIGGER TR_RAKE_PLANNING_UPDATE
ON RAKE_PLANNING
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    -- Update the UpdatedAt column for the modified rows
    UPDATE RAKE_PLANNING
    SET UpdatedAt = GETDATE()
    WHERE PlanId IN (SELECT PlanId FROM inserted);
END;
GO

-- Insert sample data
INSERT INTO RAKE_PLANNING (
    Rake_Name, Base_Depot, Rake_Operator, Haulage_Paid_By, 
    Trip_No, Sub_Route, Journey_Id, IB_Train_No, Rake_Owner, 
    Plan_Type, Device_ID, Route, Train_No, Plan_Date
) VALUES 
(
    'NMG49WJ-FN5', 'CCH', 'INDIAN RAILWAY', 'Owner', 
    'T001', 'Main Route', 'CCH-ICOD17', 'NMG49WJ-FN5', 'INDIAN RAILWAY', 
    'Back Loading', 'Device-001', 'CCH-ICOD', 'CCH-ICOD17', '23/02/2026 19:09'
),
(
    'NMG49WJ-FN4', 'ICOD', 'CONCOR', 'Owner', 
    'T002', 'Main Route', 'CCH-PLHW09', 'NMG49WJ-FN4', 'CONCOR', 
    'Forward Loading', 'Device-002', 'CCH-PLHW', 'CCH-PLHW09', '24/02/2026 10:00'
),
(
    'RAKE-001', 'FN', 'INDIAN RAILWAY', 'Owner', 
    'T003', 'Main Route', 'CE-FN04', 'RAKE-001', 'INDIAN RAILWAY', 
    'Empty Return', 'Device-003', 'CE-FN', 'CE-FN04', '25/02/2026 08:30'
);

-- Create Rake Master table for available rakes
CREATE TABLE RAKE_MASTER (
    RakeId INT IDENTITY(1,1) PRIMARY KEY,
    Rake_Name NVARCHAR(100) NOT NULL UNIQUE,
    Rake_Type NVARCHAR(50),
    Capacity INT,
    Rake_Owner NVARCHAR(100),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME
);

-- Insert sample rakes
INSERT INTO RAKE_MASTER (Rake_Name, Rake_Type, Capacity, Rake_Owner) VALUES
('NMG49WJ-FN5', 'BOX', 58, 'INDIAN RAILWAY'),
('NMG49WJ-FN4', 'BOX', 58, 'INDIAN RAILWAY'),
('RAKE-001', 'FLAT', 45, 'INDIAN RAILWAY'),
('RAKE-002', 'BOX', 58, 'CONCOR'),
('RAKE-003', 'FLAT', 45, 'PRIVATE OPERATOR');
GO

-- Drop existing trigger if it exists
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_RAKE_MASTER_UPDATE')
BEGIN
    DROP TRIGGER TR_RAKE_MASTER_UPDATE;
END
GO

-- Create trigger for RAKE_MASTER UpdatedAt
CREATE TRIGGER TR_RAKE_MASTER_UPDATE
ON RAKE_MASTER
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    -- Update the UpdatedAt column for the modified rows
    UPDATE RAKE_MASTER
    SET UpdatedAt = GETDATE()
    WHERE RakeId IN (SELECT RakeId FROM inserted);
END;
