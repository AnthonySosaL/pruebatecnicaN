import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private endpoint: string;

  constructor(private configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY');
    const region = this.configService.get<string>('S3_REGION');
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const bucketName = this.configService.get<string>('S3_BUCKET_NAME');

    if (!accessKeyId || !secretAccessKey || !region || !endpoint || !bucketName) {
      throw new Error('Faltan variables de entorno de S3');
    }

    this.endpoint = endpoint;
    this.bucketName = bucketName;

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    // Generar URL pre-firmada válida por 7 días
    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    const signedUrl = await getSignedUrl(this.s3Client, getCommand, {
      expiresIn: 604800, // 7 días en segundos
    });

    return signedUrl;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extraer el Key del URL (antes del signo ?)
      const urlParts = fileUrl.split(`${this.bucketName}/`)[1];
      if (!urlParts) return;

      const fileName = urlParts.split('?')[0]; // Quitar query params de URL firmada
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
    }
  }
}
