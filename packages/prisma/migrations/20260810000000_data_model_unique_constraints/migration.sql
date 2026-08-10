-- Migration: Add natural-key unique constraints for the shared data model
-- This migration is non-destructive: it only adds unique constraints to new v3 tables.

-- A company user can have only one company profile.
ALTER TABLE `company_profiles`
  ADD UNIQUE KEY IF NOT EXISTS `company_profiles_user_id_unique` (`user_id`);

-- A test title must be unique within a technology.
ALTER TABLE `tests`
  ADD UNIQUE KEY IF NOT EXISTS `tests_technology_title_unique` (`technology_id`, `title`);

-- Question order index must be unique within a test.
ALTER TABLE `questions`
  ADD UNIQUE KEY IF NOT EXISTS `questions_test_order_unique` (`test_id`, `order_index`);

-- Answer order index must be unique within a question.
ALTER TABLE `answers`
  ADD UNIQUE KEY IF NOT EXISTS `answers_question_order_unique` (`question_id`, `order_index`);
