-- CreateTable
CREATE TABLE `email_service_configs` (
    `id` VARCHAR(36) NOT NULL,
    `provider` VARCHAR(50) NOT NULL DEFAULT 'custom',
    `smtpHost` VARCHAR(255) NOT NULL,
    `smtpPort` INT NOT NULL,
    `smtpUser` VARCHAR(255) NOT NULL,
    `smtpPass` TEXT NOT NULL,
    `fromEmail` VARCHAR(255) NOT NULL,
    `secure` BOOLEAN NOT NULL DEFAULT false,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `updatedByUserId` VARCHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `email_service_configs_id_key` ON `email_service_configs`(`id`);
