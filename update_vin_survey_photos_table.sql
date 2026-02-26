-- Update VIN Survey Photos table to store actual image data
USE [fleet3]
GO

-- Add image_data column to store binary image data
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('VIN_Survey_Photos') AND name = 'image_data'
)
BEGIN
    ALTER TABLE VIN_Survey_Photos 
    ADD image_data VARBINARY(MAX) NULL;
END
GO

-- Add mime_type column to store image MIME type
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('VIN_Survey_Photos') AND name = 'mime_type'
)
BEGIN
    ALTER TABLE VIN_Survey_Photos 
    ADD mime_type NVARCHAR(100) NULL;
END
GO

PRINT 'VIN_Survey_Photos table updated successfully with image data columns'
GO

-- Create index for better performance
CREATE INDEX [IX_VIN_Survey_Photos_Survey_ID_Active] ON [dbo].[VIN_Survey_Photos]([survey_id], [is_active]);
GO
