import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    
    // Geçici güvenlik: sadece doğru token ile çalışır
    if (token !== "gzl2026temizle") {
      return NextResponse.json({ success: false, error: "Geçersiz token." }, { status: 403 });
    }

    // Tabloları temizle
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "BackupLog", "IsNotu", "GenelUretimKayit", "UretimSezon", "UretimTakipFoyu", "KesimKontrolFoyu", "CekmeFabric", "CekmeFoyu", "Roll", "KalanKumas", "KumasTakip", "KumasDeposu" CASCADE;`);
    
    // Admin hariç tüm kullanıcıları sil
    await prisma.$executeRawUnsafe(`DELETE FROM "User" WHERE role != 'ADMIN';`);

    return NextResponse.json({ 
      success: true, 
      message: "TEMİZLİK BAŞARILI! Veritabanındaki tüm deneme verileri silindi." 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
