export interface UploadOptions {
  fileName: string;
  file: File | Blob;
  folder?: string;
  isPublic?: boolean;
}

export interface StorageProvider {
  upload(options: UploadOptions): Promise<string>;
  delete?(fileUrl: string): Promise<boolean>;
}
