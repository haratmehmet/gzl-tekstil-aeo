import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Dosya bulunamadı' }, { status: 400 });
    }

    // Dosyayı Vercel Blob'a yükle (public erişilebilir şekilde)
    // token env var BLOB_READ_WRITE_TOKEN'dan otomatik olarak alınır.
    const blob = await put(`gzlaeo-uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`, file, {
      access: 'public',
    });

    // Vercel Blob bize doğrudan güvenli bir URL döner.
    return NextResponse.json({ success: true, url: blob.url });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Yükleme başarısız' }, { status: 500 });
  }
}
