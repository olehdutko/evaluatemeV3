-- Remove plain text body from email_templates
ALTER TABLE `email_templates` DROP COLUMN `bodyText`;
