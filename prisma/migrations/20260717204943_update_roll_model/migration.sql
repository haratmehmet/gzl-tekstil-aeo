/*
  Warnings:

  - You are about to drop the column `kg` on the `Roll` table. All the data in the column will be lost.
  - You are about to drop the column `lot` on the `Roll` table. All the data in the column will be lost.
  - You are about to drop the column `mt` on the `Roll` table. All the data in the column will be lost.
  - Added the required column `eksikFazlaMetraj` to the `Roll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topUstundeYazanMt` to the `Roll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Roll" DROP COLUMN "kg",
DROP COLUMN "lot",
DROP COLUMN "mt",
ADD COLUMN     "cikanMt" DOUBLE PRECISION,
ADD COLUMN     "eksikFazlaMetraj" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "topUstundeYazanMt" DOUBLE PRECISION NOT NULL;
