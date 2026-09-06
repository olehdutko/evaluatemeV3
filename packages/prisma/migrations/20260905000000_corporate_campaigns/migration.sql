-- Corporate Campaigns feature migration
-- All changes are additive to preserve existing data.
-- Note: existing v3 tables use camelCase column names (e.g., companyId, createdByUserId).

-- Campaigns need company ownership and notes
ALTER TABLE `campaigns` ADD COLUMN `companyId` VARCHAR(36) NULL AFTER `id`;
ALTER TABLE `campaigns` ADD COLUMN `notes` TEXT NULL AFTER `description`;
CREATE INDEX `campaigns_companyId_idx` ON `campaigns`(`companyId`);
CREATE INDEX `campaigns_companyId_status_idx` ON `campaigns`(`companyId`, `status`);

-- CampaignHistory needs action and metadata
ALTER TABLE `campaign_history` ADD COLUMN `action` VARCHAR(50) NULL AFTER `campaignId`;
ALTER TABLE `campaign_history` MODIFY COLUMN `status` VARCHAR(20) NULL;
ALTER TABLE `campaign_history` ADD COLUMN `metadata` TEXT NULL AFTER `status`;
CREATE INDEX `campaign_history_campaignId_idx` ON `campaign_history`(`campaignId`);

-- Access codes need campaign linkage and sent tracking
ALTER TABLE `access_codes` ADD COLUMN `campaignId` VARCHAR(36) NULL AFTER `companyId`;
ALTER TABLE `access_codes` ADD COLUMN `quizId` VARCHAR(36) NULL AFTER `campaignId`;
ALTER TABLE `access_codes` ADD COLUMN `sentAt` DATETIME(3) NULL;
ALTER TABLE `access_codes` ADD COLUMN `sentToEmail` VARCHAR(255) NULL;
ALTER TABLE `access_codes` ADD COLUMN `usedCount` INT NOT NULL DEFAULT 0;
ALTER TABLE `access_codes` ADD COLUMN `maxUses` INT NOT NULL DEFAULT 1;
CREATE INDEX `access_codes_campaignId_idx` ON `access_codes`(`campaignId`);

-- New company quiz tables
CREATE TABLE `company_quizzes` (
  `id` VARCHAR(36) NOT NULL,
  `companyId` VARCHAR(36) NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `status` VARCHAR(20) NOT NULL,
  `createdByUserId` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE INDEX `company_quizzes_companyId_idx` ON `company_quizzes`(`companyId`);

CREATE TABLE `custom_quiz_questions` (
  `id` VARCHAR(36) NOT NULL,
  `companyQuizId` VARCHAR(36) NOT NULL,
  `questionId` VARCHAR(36) NOT NULL,
  `orderIndex` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `custom_quiz_questions_quiz_question_idx` (`companyQuizId`, `questionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE INDEX `custom_quiz_questions_companyQuizId_idx` ON `custom_quiz_questions`(`companyQuizId`);

CREATE TABLE `company_quiz_questions` (
  `id` VARCHAR(36) NOT NULL,
  `companyQuizId` VARCHAR(36) NOT NULL,
  `content` TEXT NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `orderIndex` INT NOT NULL,
  `score` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `company_quiz_questions_quiz_order_idx` (`companyQuizId`, `orderIndex`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE INDEX `company_quiz_questions_companyQuizId_idx` ON `company_quiz_questions`(`companyQuizId`);

CREATE TABLE `company_quiz_answers` (
  `id` VARCHAR(36) NOT NULL,
  `companyQuizQuestionId` VARCHAR(36) NOT NULL,
  `content` TEXT NOT NULL,
  `isCorrect` BOOLEAN NOT NULL DEFAULT FALSE,
  `orderIndex` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `company_quiz_answers_question_order_idx` (`companyQuizQuestionId`, `orderIndex`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE INDEX `company_quiz_answers_companyQuizQuestionId_idx` ON `company_quiz_answers`(`companyQuizQuestionId`);

-- Candidate results need campaign linkage for fast campaign-scoped queries
ALTER TABLE `candidate_results` ADD COLUMN `campaignId` VARCHAR(36) NULL AFTER `id`;
ALTER TABLE `candidate_results` ADD COLUMN `accessCodeId` VARCHAR(36) NULL AFTER `candidateId`;
ALTER TABLE `candidate_results` ADD COLUMN `companyQuizId` VARCHAR(36) NULL AFTER `technologyId`;
CREATE INDEX `candidate_results_campaignId_idx` ON `candidate_results`(`campaignId`);
