import { NextResponse } from "next/server";
import { BackupService } from "@/features/backup/services/backup-service";
import { requireMutationAuth } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const user = await requireMutationAuth();
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");
    const fileName = searchParams.get("fileName") || "backup.sql.gz.enc";

    if (!fileId) {
      return new NextResponse("File ID missing", { status: 400 });
    }

    const service = new BackupService();
    const drive = service.getDriveAuth();

    const res = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${fileName}"`);
    headers.set("Content-Type", "application/octet-stream");

    // Convert GaxiosResponse stream to Web ReadableStream
    const readable = new ReadableStream({
      start(controller) {
        res.data.on("data", (chunk: any) => controller.enqueue(chunk));
        res.data.on("end", () => controller.close());
        res.data.on("error", (err: any) => controller.error(err));
      }
    });

    return new NextResponse(readable, { headers });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
