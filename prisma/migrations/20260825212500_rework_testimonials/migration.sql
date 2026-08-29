-- Rework testimonials from CMS-only quotes into moderated public stories.
DROP INDEX `Testimonial_order_idx` ON `Testimonial`;

ALTER TABLE `Testimonial`
    RENAME COLUMN `clientName` TO `name`,
    RENAME COLUMN `content_en` TO `content`,
    RENAME COLUMN `photo` TO `avatar`;

ALTER TABLE `Testimonial`
    DROP COLUMN `content_id`,
    DROP COLUMN `order`,
    MODIFY `position` VARCHAR(191) NULL,
    ADD COLUMN `rating` INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

CREATE INDEX `Testimonial_isActive_createdAt_idx` ON `Testimonial`(`isActive`, `createdAt`);
