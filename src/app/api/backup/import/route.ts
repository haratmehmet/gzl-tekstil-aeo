import { NextResponse } from 'next/server';
import { importDatabase } from '@/features/ayarlar/data-actions';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Dosya bulunamadı." }, { status: 400 });
    }

    const fileContent = await file.text();
    let jsonData;
    try {
      jsonData = JSON.parse(fileContent);
    } catch (e) {
      return NextResponse.json({ success: false, error: "Geçersiz JSON formatı." }, { status: 400 });
    }

    const res = await importDatabase(jsonData);
    
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
