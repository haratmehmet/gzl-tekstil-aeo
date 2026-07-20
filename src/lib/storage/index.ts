import { StorageProvider } from './types';
import { VercelBlobStorage } from './providers/vercel-blob';

// Ortam değişkenlerine veya konfigürasyona göre ilgili provider'ı dönecek şekilde
// genişletilebilir. Şu anda Vercel Blob varsayılan olarak seçili.
export const storageService: StorageProvider = new VercelBlobStorage();
