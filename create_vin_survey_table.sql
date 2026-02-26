-- Create VIN Survey Table to store data from Vinsurvey.jsx component
USE [fleet3]
GO

-- Drop table if it exists to recreate
IF OBJECT_ID('[dbo].[VIN_Survey]', 'U') IS NOT NULL
    DROP TABLE [dbo].[VIN_Survey]
GO

-- Create VIN_Survey table
CREATE TABLE [dbo].[VIN_Survey](
    [survey_id] [int] IDENTITY(1,1) PRIMARY KEY,
    [vin_details] [nvarchar](50) NOT NULL,
    [yard_terminal] [nvarchar](100) NULL,
    [survey_type] [nvarchar](50) NULL,
    [damage_type] [nvarchar](50) NOT NULL,
    [damage_remarks] [nvarchar](1000) NULL,
    [photos_count] [int] NOT NULL DEFAULT 0,
    [survey_status] [nvarchar](20) NOT NULL DEFAULT 'PENDING',
    [survey_date] [date] NOT NULL DEFAULT GETDATE(),
    [survey_time] [time] NOT NULL DEFAULT GETDATE(),
    [created_by] [nvarchar](100) NULL,
    [created_at] [datetime] NOT NULL DEFAULT GETDATE(),
    [updated_at] [datetime] NULL,
    [is_active] [bit] NOT NULL DEFAULT 1
);
GO

-- Create separate table for survey photos to handle multiple photo uploads
CREATE TABLE [dbo].[VIN_Survey_Photos](
    [photo_id] [int] IDENTITY(1,1) PRIMARY KEY,
    [survey_id] [int] NOT NULL,
    [photo_name] [nvarchar](255) NOT NULL,
    [photo_path] [nvarchar](500) NULL,
    [photo_size] [nvarchar](50) NULL,
    [photo_url] [nvarchar](500) NULL,
    [upload_date] [datetime] NOT NULL DEFAULT GETDATE(),
    [is_active] [bit] NOT NULL DEFAULT 1,
    FOREIGN KEY ([survey_id]) REFERENCES [dbo].[VIN_Survey] ([survey_id]) ON DELETE CASCADE
);
GO

-- Create indexes for better performance
CREATE INDEX [IX_VIN_Survey_VIN_Details] ON [dbo].[VIN_Survey]([vin_details]);
CREATE INDEX [IX_VIN_Survey_Survey_Date] ON [dbo].[VIN_Survey]([survey_date]);
CREATE INDEX [IX_VIN_Survey_Yard_Terminal] ON [dbo].[VIN_Survey]([yard_terminal]);
CREATE INDEX [IX_VIN_Survey_Survey_Type] ON [dbo].[VIN_Survey]([survey_type]);
CREATE INDEX [IX_VIN_Survey_Damage_Type] ON [dbo].[VIN_Survey]([damage_type]);
CREATE INDEX [IX_VIN_Survey_Status] ON [dbo].[VIN_Survey]([survey_status]);
CREATE INDEX [IX_VIN_Survey_Created_At] ON [dbo].[VIN_Survey]([created_at]);
GO

CREATE INDEX [IX_VIN_Survey_Photos_Survey_ID] ON [dbo].[VIN_Survey_Photos]([survey_id]);
CREATE INDEX [IX_VIN_Survey_Photos_Upload_Date] ON [dbo].[VIN_Survey_Photos]([upload_date]);
GO

-- Add check constraints for data integrity
ALTER TABLE [dbo].[VIN_Survey] 
ADD CONSTRAINT [CK_VIN_Survey_Survey_Status] 
CHECK ([survey_status] IN ('PENDING', 'COMPLETED', 'CANCELLED', 'IN_PROGRESS'));
GO

ALTER TABLE [dbo].[VIN_Survey] 
ADD CONSTRAINT [CK_VIN_Survey_Photos_Count] 
CHECK ([photos_count] >= 0);
GO

-- Add default values for common survey types and damage types
ALTER TABLE [dbo].[VIN_Survey] 
ADD CONSTRAINT [DF_VIN_Survey_Survey_Type] 
DEFAULT 'Pre-Dispatch Survey' FOR [survey_type] WHEN [survey_type] IS NULL;
GO

-- Create view for survey summary with photo count
CREATE VIEW [dbo].[VIN_Survey_Summary_View] AS
SELECT 
    s.survey_id,
    s.vin_details,
    s.yard_terminal,
    s.survey_type,
    s.damage_type,
    s.damage_remarks,
    ISNULL(COUNT(p.photo_id), 0) as actual_photos_count,
    s.survey_status,
    s.survey_date,
    s.survey_time,
    s.created_at,
    s.created_by
FROM [dbo].[VIN_Survey] s
LEFT JOIN [dbo].[VIN_Survey_Photos] p ON s.survey_id = p.survey_id AND p.is_active = 1
WHERE s.is_active = 1
GROUP BY 
    s.survey_id,
    s.vin_details,
    s.yard_terminal,
    s.survey_type,
    s.damage_type,
    s.damage_remarks,
    s.survey_status,
    s.survey_date,
    s.survey_time,
    s.created_at,
    s.created_by;
GO

-- Create trigger to update photos_count when photos are added/removed
CREATE TRIGGER [dbo].[TR_VIN_Survey_Photos_Count_Update]
ON [dbo].[VIN_Survey_Photos]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update photos count for affected surveys
    UPDATE s
    SET photos_count = ISNULL(photo_counts.photo_count, 0),
        updated_at = GETDATE()
    FROM [dbo].[VIN_Survey] s
    INNER JOIN (
        SELECT survey_id, COUNT(*) as photo_count
        FROM [dbo].[VIN_Survey_Photos]
        WHERE is_active = 1
        GROUP BY survey_id
    ) photo_counts ON s.survey_id = photo_counts.survey_id
    WHERE s.survey_id IN (
        SELECT survey_id FROM inserted
        UNION
        SELECT survey_id FROM deleted
    );
END
GO

-- Insert sample data for testing
INSERT INTO [dbo].[VIN_Survey] (
    vin_details, yard_terminal, survey_type, damage_type, damage_remarks, created_by
) VALUES 
('1HGCM82633A004352', 'Yard Terminal 1 - Gate A', 'Pre-Dispatch Survey', 'Scratch', 'Minor scratch on driver side door', 'admin'),
('2HGBH41JXMN109186', 'Yard Terminal 2 - Gate B', 'Post-Arrival Survey', 'Dent', 'Dent on rear bumper', 'inspector1'),
('1FTFW1ET5DFC12345', 'Yard Terminal 3 - Gate C', 'Damage Assessment', 'Broken Glass', 'Driver side window cracked', 'admin'),
('5NPEB4AC9BH123456', 'Yard Terminal 4 - Gate D', 'Quality Inspection', 'Paint Damage', 'Paint peeling on hood', 'inspector2');
GO

-- Insert sample photos for the first survey
INSERT INTO [dbo].[VIN_Survey_Photos] (
    survey_id, photo_name, photo_path, photo_size, photo_url
) VALUES 
(1, 'scratch_driver_door.jpg', '/uploads/surveys/1/scratch_driver_door.jpg', '245.7 KB', 'https://example.com/photos/1/scratch_driver_door.jpg'),
(1, 'scratch_closeup.jpg', '/uploads/surveys/1/scratch_closeup.jpg', '189.3 KB', 'https://example.com/photos/1/scratch_closeup.jpg'),
(2, 'dent_rear_bumper.jpg', '/uploads/surveys/2/dent_rear_bumper.jpg', '312.1 KB', 'https://example.com/photos/2/dent_rear_bumper.jpg');
GO

-- Update photos count for existing surveys
UPDATE [dbo].[VIN_Survey] 
SET photos_count = (
    SELECT COUNT(*) 
    FROM [dbo].[VIN_Survey_Photos] p 
    WHERE p.survey_id = [dbo].[VIN_Survey].survey_id AND p.is_active = 1
);
GO

-- Verify the data
SELECT 'VIN_Survey' as table_name, COUNT(*) as record_count FROM VIN_Survey
UNION ALL
SELECT 'VIN_Survey_Photos' as table_name, COUNT(*) as record_count FROM VIN_Survey_Photos;
GO

PRINT 'VIN Survey tables created successfully with sample data'
GO
