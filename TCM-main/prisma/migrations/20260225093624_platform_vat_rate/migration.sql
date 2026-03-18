/*
  Warnings:

  - Added the required column `vatRate` to the `PlatformPricing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlatformPricing" ADD COLUMN     "vatRate" DOUBLE PRECISION NOT NULL;
