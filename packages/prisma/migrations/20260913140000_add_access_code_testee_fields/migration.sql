-- Add testee info and manual quiz settings to access codes
ALTER TABLE `access_codes` ADD COLUMN `testeeName` VARCHAR(255) NULL;
ALTER TABLE `access_codes` ADD COLUMN `testeeEmail` VARCHAR(255) NULL;
ALTER TABLE `access_codes` ADD COLUMN `questionCount` INT NULL;
ALTER TABLE `access_codes` ADD COLUMN `durationMinutes` INT NULL;
