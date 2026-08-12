-- Migration: Add natural-key unique constraints for the shared data model
-- This migration is non-destructive: it only adds unique constraints when they are missing.

-- A company user can have only one company profile.
SET @companyProfileIndex := IF(NOT EXISTS(
  SELECT 1 FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'company_profiles' AND INDEX_NAME = 'company_profiles_userId_unique'
), 'ALTER TABLE `company_profiles` ADD UNIQUE KEY `company_profiles_userId_unique` (`userId`)', 'SELECT 1');
PREPARE stmt FROM @companyProfileIndex; EXECUTE stmt; DEALLOCATE PREPARE stmt;
