-- Create Loading Stage table for SQL Server
-- This table will store loading stage operations (Yard In/Yard Out) with multiple VINs

-- Main Loading Stage table
CREATE TABLE [dbo].[Loading_Stage] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [Loading_Station_ID] INT NOT NULL,
    [Operation_Type] NVARCHAR(20) NOT NULL CHECK ([Operation_Type] IN ('Yard In', 'Yard Out')),
    [FNR_No] NVARCHAR(50) NULL,
    [Rake_No] NVARCHAR(50) NULL,
    [Deck_Position] NVARCHAR(50) NULL,
    [Wagon_No] NVARCHAR(50) NULL,
    [VIN_Count] INT NOT NULL DEFAULT 0,
    [Status] NVARCHAR(20) NOT NULL DEFAULT 'Active',
    [Created_At] DATETIME NOT NULL DEFAULT GETDATE(),
    [Updated_At] DATETIME NULL,
    [Created_By] NVARCHAR(100) NULL,
    -- Foreign key constraint to Terminal Master
    CONSTRAINT [FK_Loading_Stage_Terminal_Master] 
        FOREIGN KEY ([Loading_Station_ID]) 
        REFERENCES [dbo].[Terminal_Master]([TerminalId])
        ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX [IX_Loading_Stage_Loading_Station_ID] ON [dbo].[Loading_Stage]([Loading_Station_ID]);
CREATE INDEX [IX_Loading_Stage_Operation_Type] ON [dbo].[Loading_Stage]([Operation_Type]);
CREATE INDEX [IX_Loading_Stage_Created_At] ON [dbo].[Loading_Stage]([Created_At]);

-- Loading Stage VINs table (to store multiple VINs per loading stage)
CREATE TABLE [dbo].[Loading_Stage_VINs] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [Loading_Stage_ID] INT NOT NULL,
    [VIN_Number] NVARCHAR(50) NOT NULL,
    [VIN_Position] INT NOT NULL,
    [Created_At] DATETIME NOT NULL DEFAULT GETDATE(),
    -- Foreign key constraint to Loading Stage
    CONSTRAINT [FK_Loading_Stage_VINs_Loading_Stage] 
        FOREIGN KEY ([Loading_Stage_ID]) 
        REFERENCES [dbo].[Loading_Stage]([ID])
        ON DELETE CASCADE,
    -- Unique constraint to prevent duplicate VINs per loading stage
    CONSTRAINT [UQ_Loading_Stage_VINs_VIN] UNIQUE ([Loading_Stage_ID], [VIN_Number])
);
GO

-- Create index for better performance
CREATE INDEX [IX_Loading_Stage_VINs_Loading_Stage_ID] ON [dbo].[Loading_Stage_VINs]([Loading_Stage_ID]);
CREATE INDEX [IX_Loading_Stage_VINs_VIN_Number] ON [dbo].[Loading_Stage_VINs]([VIN_Number]);
GO

-- Create trigger to automatically update VIN_Count and Updated_At
CREATE OR ALTER TRIGGER [dbo].[TR_Loading_Stage_Update_VIN_Count]
ON [dbo].[Loading_Stage_VINs]
AFTER INSERT, DELETE, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update VIN_Count for affected loading stages
    UPDATE ls
    SET ls.VIN_Count = ISNULL(vin_count.vin_total, 0),
        ls.Updated_At = GETDATE()
    FROM [dbo].[Loading_Stage] ls
    LEFT JOIN (
        SELECT Loading_Stage_ID, COUNT(*) as vin_total
        FROM [dbo].[Loading_Stage_VINs]
        GROUP BY Loading_Stage_ID
    ) vin_count ON ls.ID = vin_count.Loading_Stage_ID
    WHERE ls.ID IN (
        SELECT Loading_Stage_ID FROM inserted
        UNION
        SELECT Loading_Stage_ID FROM deleted
    );
END;
GO

-- Insert sample data for testing (optional)
-- Uncomment the following lines to insert sample data
/*
-- Sample Loading Stage records
INSERT INTO [dbo].[Loading_Stage] (Loading_Station_ID, Operation_Type, FNR_No, Rake_No, Deck_Position, Wagon_No, Created_By)
VALUES 
    (1, 'Yard In', NULL, NULL, NULL, NULL, 'admin'),
    (2, 'Yard Out', 'FNR001', 'RAKE001', 'Deck-A', 'WAGON001', 'admin');

-- Sample VIN records
INSERT INTO [dbo].[Loading_Stage_VINs] (Loading_Stage_ID, VIN_Number, VIN_Position)
VALUES 
    (1, 'VIN12345678901234', 1),
    (1, 'VIN12345678901235', 2),
    (2, 'VIN12345678901236', 1),
    (2, 'VIN12345678901237', 2);
*/

-- Create view for easy querying with concatenated VINs
CREATE OR ALTER VIEW [dbo].[VW_Loading_Stage_With_VINs]
AS
SELECT 
    ls.ID,
    ls.Loading_Station_ID,
    tm.TerminalName,
    tm.TerminalCode,
    ls.Operation_Type,
    ls.FNR_No,
    ls.Rake_No,
    ls.Deck_Position,
    ls.Wagon_No,
    ls.VIN_Count,
    ls.Status,
    ls.Created_At,
    ls.Updated_At,
    ls.Created_By,
    STUFF((
        SELECT ', ' + lsv.VIN_Number 
        FROM [dbo].[Loading_Stage_VINs] lsv 
        WHERE lsv.Loading_Stage_ID = ls.ID 
        ORDER BY lsv.VIN_Position
        FOR XML PATH(''), TYPE
    ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS VIN_Details
FROM [dbo].[Loading_Stage] ls
LEFT JOIN [dbo].[Terminal_Master] tm ON ls.Loading_Station_ID = tm.TerminalId
WHERE ls.Status = 'Active';
GO

PRINT 'Loading Stage tables and related objects created successfully!';
