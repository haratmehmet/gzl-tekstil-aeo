import { NextResponse } from 'next/server';
import { exportDatabase } from '@/features/ayarlar/data-actions';

export async function GET() {
  try {
    const res = await exportDatabase();
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }

    const jsonString = JSON.stringify(res.data, null, 2);
    
    // Create a Blob or use NextResponse to trigger a download
    const filename = `gzl-yedek-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
