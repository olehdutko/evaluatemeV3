-- Add description column to question_sets
ALTER TABLE `question_sets` ADD COLUMN `description` TEXT NULL AFTER `status`;
