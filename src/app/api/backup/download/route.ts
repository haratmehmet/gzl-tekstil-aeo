import { NextResponse } from "next/server";
import { BackupService } from "@/features/backup/services/backup-service";
import { requireMutationAuth } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const user = await requireMutationAuth();
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    return new NextResponse("E-Posta yedekleme sisteminde indirme işlemi yapılamaz, yedek dosyanız e-posta adresinizdedir.", { status: 400 });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
