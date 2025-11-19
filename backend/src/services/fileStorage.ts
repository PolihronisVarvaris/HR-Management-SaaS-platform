// src/services/fileStorage.ts
import { Client } from 'minio';
import { randomBytes } from 'crypto';

let minioClient: Client | null = null;
const BUCKET_NAME = process.env.MINIO_BUCKET || 'hr-saas';

const initializeMinIO = () => {
  if (minioClient) return minioClient;
  
  try {
    minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
    return minioClient;
  } catch (error) {
    console.error('Failed to initialize MinIO client:', error);
    return null;
  }
};

const getMinIOClient = () => {
  if (!minioClient) {
    return initializeMinIO();
  }
  return minioClient;
};

export class FileStorageService {
  private static async ensureBucketExists() {
    const client = getMinIOClient();
    if (!client) {
      throw new Error('MinIO client not available');
    }

    try {
      const exists = await client.bucketExists(BUCKET_NAME);
      if (!exists) {
        await client.makeBucket(BUCKET_NAME, 'us-east-1');
        console.log(`✅ Created file storage bucket: ${BUCKET_NAME}`);
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      throw error;
    }
  }

  static async uploadCV(file: Buffer, fileName: string, mimeType: string): Promise<{
    fileUrl: string;
    filename: string;
    fileSize: number;
  }> {
    const client = getMinIOClient();
    if (!client) {
      throw new Error('File storage service unavailable');
    }

    await this.ensureBucketExists();

    // Generate unique filename
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `cv-${randomBytes(8).toString('hex')}-${Date.now()}.${fileExtension}`;

    try {
      // Upload file
      await client.putObject(BUCKET_NAME, uniqueFileName, file, {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });

      // Get file info
      const stat = await client.statObject(BUCKET_NAME, uniqueFileName);

      return {
        fileUrl: uniqueFileName,
        filename: fileName,
        fileSize: stat.size,
      };
    } catch (error) {
      console.error('Error uploading CV:', error);
      throw new Error('Failed to upload file');
    }
  }

  static async getCVUrl(fileKey: string): Promise<string> {
    const client = getMinIOClient();
    if (!client) {
      throw new Error('File storage service unavailable');
    }

    try {
      // Generate presigned URL that expires in 1 hour
      return await client.presignedGetObject(BUCKET_NAME, fileKey, 3600);
    } catch (error) {
      console.error('Error generating CV URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  static async deleteCV(fileKey: string): Promise<void> {
    const client = getMinIOClient();
    if (!client) {
      throw new Error('File storage service unavailable');
    }

    try {
      await client.removeObject(BUCKET_NAME, fileKey);
    } catch (error) {
      console.error('Error deleting CV:', error);
      throw new Error('Failed to delete file');
    }
  }
}

export const initFileStorage = async () => {
  try {
    const client = initializeMinIO();
    if (!client) {
      console.log('⚠️  MinIO client initialization failed');
      return;
    }

    // Test connection
    await client.listBuckets();
    
    const exists = await client.bucketExists(BUCKET_NAME);
    if (!exists) {
      await client.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`✅ Created file storage bucket: ${BUCKET_NAME}`);
    }
    
    console.log(`✅ File storage ready: ${BUCKET_NAME}`);
    console.log('✅ MinIO connection successful');
  } catch (error) {
    console.error('❌ File storage initialization failed:', error);
    console.log('⚠️  File uploads will not work until MinIO is configured properly');
  }
};