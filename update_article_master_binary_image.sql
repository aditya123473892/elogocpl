-- Update ARTICLE_MASTER table to store image as binary data
ALTER TABLE ARTICLE_MASTER ADD COLUMN article_image_binary VARBINARY(MAX) NULL;

-- If the old article_image column exists, we can drop it or keep it for backup
-- ALTER TABLE ARTICLE_MASTER DROP COLUMN article_image;
