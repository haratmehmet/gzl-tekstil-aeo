/*
  Warnings:

  - You are about to drop the column `cekmeBoy` on the `CekmeFabric` table. All the data in the column will be lost.
  - You are about to drop the column `cekmeEn` on the `CekmeFabric` table. All the data in the column will be lost.
  - You are about to drop the column `kumasKodu` on the `CekmeFabric` table. All the data in the column will be lost.
  - You are about to drop the column `kumasRenk` on the `CekmeFabric` table. All the data in the column will be lost.
  - Added the required column `artikelAdi` to the `CekmeFabric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `boyCekmeYuzde` to the `CekmeFabric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enCekmeYuzde` to the `CekmeFabric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gelenMetraj` to the `CekmeFabric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kullanildigiYer` to the `CekmeFabric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tedarikci` to the `CekmeFabric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urunDptRenk` to the `CekmeFabric` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CekmeFabric" DROP COLUMN "cekmeBoy",
DROP COLUMN "cekmeEn",
DROP COLUMN "kumasKodu",
DROP COLUMN "kumasRenk",
ADD COLUMN     "artikelAdi" TEXT NOT NULL,
ADD COLUMN     "boyCekmeYuzde" TEXT NOT NULL,
ADD COLUMN     "enCekmeYuzde" TEXT NOT NULL,
ADD COLUMN     "gelenMetraj" TEXT NOT NULL,
ADD COLUMN     "kullanildigiYer" TEXT NOT NULL,
ADD COLUMN     "tedarikci" TEXT NOT NULL,
ADD COLUMN     "urunDptRenk" TEXT NOT NULL;
