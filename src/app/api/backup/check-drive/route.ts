import { NextResponse } from "next/server";
import { BackupService } from "@/features/backup/services/backup-service";

export async function GET() {
  try {
    const service = new BackupService();
    const list = await service.getBackupsList();
    return NextResponse.json({ success: true, count: list.length, files: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
