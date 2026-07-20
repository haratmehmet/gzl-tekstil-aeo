import { NextResponse } from 'next/server';
import { storageService } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Dosya bulunamadı' }, { status: 400 });
    }

    // Storage servisi üzerinden yükleme yap
    const url = await storageService.upload({
      fileName: file.name,
      file: file,
      folder: 'gzlaeo-uploads',
      isPublic: true
    });

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Yükleme başarısız' }, { status: 500 });
  }
}
