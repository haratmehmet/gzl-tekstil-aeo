import { put } from '@vercel/blob';
import { StorageProvider, UploadOptions } from '../types';

export class VercelBlobStorage implements StorageProvider {
  async upload({ fileName, file, folder = 'uploads', isPublic = true }: UploadOptions): Promise<string> {
    const path = `${folder}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    
    // Yükleme işlemini Vercel Blob SDK üzerinden gerçekleştir
    const blob = await put(path, file, { 
      access: isPublic ? 'public' : 'private' 
    });
    
    return blob.url;
  }
}
