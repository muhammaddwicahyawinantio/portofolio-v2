-- CreateTable
CREATE TABLE `DwiAiSession` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `messages` JSON NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DwiAiSession_sessionId_key`(`sessionId`),
    INDEX `DwiAiSession_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DwiAiSetting` (
    `id` VARCHAR(191) NOT NULL,
    `assistantName` VARCHAR(191) NOT NULL DEFAULT 'Dwi AI',
    `systemPrompt` TEXT NOT NULL,
    `behaviorDescription` TEXT NULL,
    `temperature` DOUBLE NOT NULL DEFAULT 0.7,
    `maxTokens` INTEGER NOT NULL DEFAULT 4000,
    `model` VARCHAR(191) NOT NULL DEFAULT 'llama-3.3-70b-versatile',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
