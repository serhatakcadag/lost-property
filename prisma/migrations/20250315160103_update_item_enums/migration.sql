/*
  Warnings:

  - The `status` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `category` on the `Item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('PENDING', 'FOUND', 'RETURNED', 'CLAIMED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('ELECTRONICS', 'CLOTHING', 'ACCESSORIES', 'DOCUMENTS', 'KEYS', 'BAGS', 'OTHERS');

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "category",
ADD COLUMN     "category" "ItemCategory" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Item_status_idx" ON "Item"("status");

-- CreateIndex
CREATE INDEX "Item_category_idx" ON "Item"("category");
