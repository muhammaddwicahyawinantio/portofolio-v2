/*
  Warnings:

  - You are about to drop the column `title` on the `project` table. All the data in the column will be lost.
  - Added the required column `caseStudy_en` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `caseStudy_id` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_en` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_id` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `project` DROP COLUMN `title`,
    ADD COLUMN `archived` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `caseStudy_en` TEXT NOT NULL,
    ADD COLUMN `caseStudy_id` TEXT NOT NULL,
    ADD COLUMN `client` VARCHAR(191) NULL,
    ADD COLUMN `coverImage` VARCHAR(191) NULL,
    ADD COLUMN `featured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `link` VARCHAR(191) NULL,
    ADD COLUMN `role` VARCHAR(191) NOT NULL,
    ADD COLUMN `title_en` VARCHAR(191) NOT NULL,
    ADD COLUMN `title_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `year` VARCHAR(191) NOT NULL;
