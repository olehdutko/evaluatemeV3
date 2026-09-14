-- Clean migration: drop legacy session/result data and old question links.
-- Existing questions are removed here; they will be re-imported later from evaluateme_db.

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Clear tables that reference questions or sessions
TRUNCATE TABLE `user_answers`;
TRUNCATE TABLE `candidate_sessions`;
TRUNCATE TABLE `user_results`;
TRUNCATE TABLE `candidate_results`;
TRUNCATE TABLE `quiz_sessions`;

-- 2. Clear questions and answers
TRUNCATE TABLE `answers`;
TRUNCATE TABLE `questions`;

-- 3. Drop legacy Test table if it was ever created
DROP TABLE IF EXISTS `tests`;

-- 4. Create QuestionSet table (replaces old evaluateme_db.Tests concept)
CREATE TABLE `question_sets` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `technologyId` VARCHAR(36) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `quizQuestionCount` INT NOT NULL DEFAULT 20,
    `quizDurationMinutes` INT NOT NULL DEFAULT 40,
    `createdByUserId` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `question_sets_technologyId_title_key` (`technologyId`, `title`),
    INDEX `question_sets_technologyId_idx` (`technologyId`),
    CONSTRAINT `question_sets_technologyId_fkey` FOREIGN KEY (`technologyId`) REFERENCES `technologies` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- 5. Repoint questions from technology to question set
ALTER TABLE `questions` DROP COLUMN `technologyId`,
    ADD COLUMN `questionSetId` VARCHAR(36) NOT NULL AFTER `id`,
    DROP INDEX `questions_technologyId_orderIndex_key`,
    ADD UNIQUE INDEX `questions_questionSetId_orderIndex_key` (`questionSetId`, `orderIndex`),
    ADD INDEX `questions_questionSetId_idx` (`questionSetId`),
    ADD CONSTRAINT `questions_questionSetId_fkey` FOREIGN KEY (`questionSetId`) REFERENCES `question_sets` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. Repoint quiz sessions from technology to question set
ALTER TABLE `quiz_sessions` DROP COLUMN `technologyId`,
    ADD COLUMN `questionSetId` VARCHAR(36) NOT NULL AFTER `userId`,
    ADD INDEX `quiz_sessions_questionSetId_idx` (`questionSetId`);

-- 7. Results: keep legacy technologyId nullable and add questionSetId
ALTER TABLE `user_results`
    MODIFY COLUMN `technologyId` VARCHAR(36) NULL,
    ADD COLUMN `questionSetId` VARCHAR(36) NULL AFTER `technologyId`,
    ADD INDEX `user_results_questionSetId_idx` (`questionSetId`);

ALTER TABLE `candidate_results`
    MODIFY COLUMN `technologyId` VARCHAR(36) NULL,
    ADD COLUMN `questionSetId` VARCHAR(36) NULL AFTER `technologyId`,
    ADD INDEX `candidate_results_questionSetId_idx` (`questionSetId`);

-- 8. Repoint access codes from technology to question set
ALTER TABLE `access_codes` DROP COLUMN `technologyId`,
    ADD COLUMN `questionSetId` VARCHAR(36) NULL AFTER `quizId`,
    ADD INDEX `access_codes_questionSetId_idx` (`questionSetId`);

-- 9. Remove quiz settings from technologies (now stored on question_sets)
ALTER TABLE `technologies` DROP COLUMN `quizQuestionCount`,
    DROP COLUMN `quizDurationMinutes`;

SET FOREIGN_KEY_CHECKS = 1;
