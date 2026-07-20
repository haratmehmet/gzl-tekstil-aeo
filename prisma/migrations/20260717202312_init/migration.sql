/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "KumasTakip" (
    "id" TEXT NOT NULL,
    "kumasKodu" TEXT NOT NULL,
    "gelenMetraj" DOUBLE PRECISION NOT NULL,
    "kumasciFirma" TEXT NOT NULL,
    "geldigiTarih" TEXT NOT NULL,
    "sezon" TEXT NOT NULL,
    "sapKodu" TEXT,
    "baglandigiModel" TEXT NOT NULL,
    "etiket" TEXT,
    "kullanildigiYer" TEXT NOT NULL,
    "topAdedi" INTEGER NOT NULL,
    "kumasIcerik" TEXT,
    "kumasRenk" TEXT,
    "urunDptRenk" TEXT,
    "kumasEn" TEXT,
    "cekmeEn" TEXT,
    "cekmeBoy" TEXT,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KumasTakip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roll" (
    "id" TEXT NOT NULL,
    "kumasTakipId" TEXT NOT NULL,
    "mt" DOUBLE PRECISION NOT NULL,
    "kg" DOUBLE PRECISION,
    "lot" TEXT,

    CONSTRAINT "Roll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CekmeFoyu" (
    "id" TEXT NOT NULL,
    "testeGonderilmeTarihi" TEXT NOT NULL,
    "modelist" TEXT NOT NULL,
    "etiket" TEXT NOT NULL,
    "modelKodu" TEXT NOT NULL,
    "sapKodu" TEXT NOT NULL,
    "kumasKodu" TEXT NOT NULL,
    "sezon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CekmeFoyu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CekmeFabric" (
    "id" TEXT NOT NULL,
    "cekmeFoyuId" TEXT NOT NULL,
    "kumasKodu" TEXT NOT NULL,
    "kumasIcerik" TEXT NOT NULL,
    "kumasRenk" TEXT NOT NULL,
    "kumasEn" TEXT NOT NULL,
    "cekmeEn" TEXT NOT NULL,
    "cekmeBoy" TEXT NOT NULL,

    CONSTRAINT "CekmeFabric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KalanKumas" (
    "id" TEXT NOT NULL,
    "faturaNo" TEXT NOT NULL,
    "malzemeKodu" TEXT NOT NULL,
    "faturaTarih" TEXT NOT NULL,
    "depoyaGirisTarihi" TEXT NOT NULL,
    "kumasKodu" TEXT NOT NULL,
    "kumasMetraji" TEXT NOT NULL,
    "birimFiyat" DOUBLE PRECISION,
    "eklenmeTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KalanKumas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Roll" ADD CONSTRAINT "Roll_kumasTakipId_fkey" FOREIGN KEY ("kumasTakipId") REFERENCES "KumasTakip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CekmeFabric" ADD CONSTRAINT "CekmeFabric_cekmeFoyuId_fkey" FOREIGN KEY ("cekmeFoyuId") REFERENCES "CekmeFoyu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
