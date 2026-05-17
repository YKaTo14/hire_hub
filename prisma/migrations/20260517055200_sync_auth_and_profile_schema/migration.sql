-- Bring the original database migration in line with the current Prisma schema.

ALTER TABLE `User`
  MODIFY `password` VARCHAR(191) NULL,
  MODIFY `role` ENUM('USER', 'ADMIN', 'MODERATOR', 'EMPLOYER') NOT NULL DEFAULT 'USER',
  ADD COLUMN `emailVerified` DATETIME(3) NULL,
  ADD COLUMN `image` VARCHAR(191) NULL,
  ADD COLUMN `bio` TEXT NULL;

ALTER TABLE `Job`
  ADD COLUMN `category` ENUM('ENGINEERING', 'MARKETING', 'SALES', 'DESIGN', 'FINANCE', 'HR', 'OPERATIONS', 'PRODUCT', 'CUSTOMER_SUPPORT', 'OTHER') NULL,
  ADD COLUMN `customCategory` VARCHAR(191) NULL;

ALTER TABLE `Application`
  ADD COLUMN `cvUrl` TEXT NULL,
  ADD COLUMN `cvName` VARCHAR(191) NULL;

CREATE TABLE `Account` (
  `id` VARCHAR(191) NOT NULL,
  `userId` INTEGER NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `provider` VARCHAR(191) NOT NULL,
  `providerAccountId` VARCHAR(191) NOT NULL,
  `refresh_token` TEXT NULL,
  `access_token` TEXT NULL,
  `expires_at` INTEGER NULL,
  `token_type` VARCHAR(191) NULL,
  `scope` VARCHAR(191) NULL,
  `id_token` TEXT NULL,
  `session_state` VARCHAR(191) NULL,

  UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Session` (
  `id` VARCHAR(191) NOT NULL,
  `sessionToken` VARCHAR(191) NOT NULL,
  `userId` INTEGER NOT NULL,
  `expires` DATETIME(3) NOT NULL,

  UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `VerificationToken` (
  `identifier` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `expires` DATETIME(3) NOT NULL,

  UNIQUE INDEX `VerificationToken_token_key`(`token`),
  UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Message` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `content` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `isRead` BOOLEAN NOT NULL DEFAULT false,
  `senderId` INTEGER NOT NULL,
  `receiverId` INTEGER NOT NULL,
  `jobId` INTEGER NULL,

  INDEX `Message_senderId_idx`(`senderId`),
  INDEX `Message_receiverId_idx`(`receiverId`),
  INDEX `Message_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Message` ADD CONSTRAINT `Message_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
