import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  try {
    // Admin kullanıcısını kurtarma (SUPER_ADMIN rolü silinmişti)
    const email = "admin@ableajans.com";
    const password = "admin"; // Geçici şifre
    
    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcı varsa güncelle, yoksa oluştur
    await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: "SUPER_ADMIN", // Ya da daha önceki rolünüz neyse
        isActive: true,
      },
      create: {
        name: "Yönetici",
        email: email,
        password: hashedPassword,
        role: "SUPER_ADMIN",
        isActive: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Kurtarma başarılı! admin@ableajans.com ve 'admin' şifresiyle giriş yapabilirsiniz." 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
