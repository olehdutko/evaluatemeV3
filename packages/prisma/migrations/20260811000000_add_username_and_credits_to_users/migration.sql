-- Add username and credits columns to users table

ALTER TABLE `users`
  ADD COLUMN `username` VARCHAR(100) NULL AFTER `email`,
  ADD COLUMN `credits` INT NOT NULL DEFAULT 0 AFTER `companyProfileId`,
  ADD UNIQUE INDEX `users_username_key` (`username`);
