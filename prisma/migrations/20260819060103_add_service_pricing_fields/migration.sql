/*
  Warnings:

  - Added the required column `benefits_en` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `benefits_id` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `features_en` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `features_id` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceLabel` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `service` ADD COLUMN `benefits_en` JSON NOT NULL,
    ADD COLUMN `benefits_id` JSON NOT NULL,
    ADD COLUMN `features_en` JSON NOT NULL,
    ADD COLUMN `features_id` JSON NOT NULL,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `priceLabel` VARCHAR(191) NOT NULL;
