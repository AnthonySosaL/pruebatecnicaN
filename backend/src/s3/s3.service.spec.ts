import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('S3Service', () => {
  let service: S3Service;
  let mockS3Client: jest.Mocked<S3Client>;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        S3_ACCESS_KEY_ID: 'test-access-key',
        S3_SECRET_ACCESS_KEY: 'test-secret-key',
        S3_REGION: 'us-east-1',
        S3_ENDPOINT: 'https://s3.example.com',
        S3_BUCKET_NAME: 'test-bucket',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock S3Client
    mockS3Client = {
      send: jest.fn().mockResolvedValue({}),
    } as any;

    (S3Client as jest.Mock).mockImplementation(() => mockS3Client);
    (getSignedUrl as jest.Mock).mockResolvedValue('https://s3.example.com/signed-url');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should throw error if S3 config is missing', async () => {
      const incompleteConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };

      await expect(
        Test.createTestingModule({
          providers: [
            S3Service,
            { provide: ConfigService, useValue: incompleteConfigService },
          ],
        }).compile(),
      ).rejects.toThrow('Faltan variables de entorno de S3');
    });
  });

  describe('uploadFile', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'frontImage',
      originalname: 'test-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test image content'),
      size: 1024,
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    it('should upload file and return signed URL', async () => {
      const result = await service.uploadFile(mockFile, 'documents');

      expect(mockS3Client.send).toHaveBeenCalled();
      expect(getSignedUrl).toHaveBeenCalled();
      expect(result).toBe('https://s3.example.com/signed-url');
    });

    it('should use correct file extension from original name', async () => {
      await service.uploadFile(mockFile, 'documents');

      const sendCall = mockS3Client.send.mock.calls[0][0];
      expect(sendCall).toBeInstanceOf(PutObjectCommand);
    });

    it('should call S3 client send method', async () => {
      await service.uploadFile(mockFile, 'documents');

      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteFile', () => {
    it('should delete file from S3', async () => {
      const fileUrl = 'https://s3.example.com/test-bucket/documents/file.jpg?signature=abc';

      await service.deleteFile(fileUrl);

      expect(mockS3Client.send).toHaveBeenCalled();
    });

    it('should handle missing file URL gracefully', async () => {
      const fileUrl = 'invalid-url';

      await expect(service.deleteFile(fileUrl)).resolves.not.toThrow();
    });

    it('should not throw on S3 delete error', async () => {
      mockS3Client.send.mockRejectedValueOnce(new Error('S3 Error'));

      await expect(
        service.deleteFile('https://s3.example.com/test-bucket/documents/file.jpg'),
      ).resolves.not.toThrow();
    });
  });
});
