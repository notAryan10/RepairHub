-- AlterTable
ALTER TABLE `Issue` ADD COLUMN `scheduledDate` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `PartsRequest` (
    `id` VARCHAR(191) NOT NULL,
    `partName` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `issueId` VARCHAR(191) NOT NULL,
    `requestedById` VARCHAR(191) NOT NULL,

    INDEX `PartsRequest_issueId_idx`(`issueId`),
    INDEX `PartsRequest_requestedById_idx`(`requestedById`),
    INDEX `PartsRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PartsRequest` ADD CONSTRAINT `PartsRequest_issueId_fkey` FOREIGN KEY (`issueId`) REFERENCES `Issue`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartsRequest` ADD CONSTRAINT `PartsRequest_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
