/*
  Warnings:

  - Added the required column `capacity` to the `scheduling_slots` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "scheduling_slots" ADD COLUMN     "capacity" INTEGER NOT NULL;
