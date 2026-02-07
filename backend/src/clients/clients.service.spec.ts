import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CedulaValidatorService } from './cedula-validator.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClientType, DocumentType } from '@prisma/client';

describe('ClientsService', () => {
  let service: ClientsService;
  let prismaService: PrismaService;
  let s3Service: S3Service;
  let cedulaValidator: CedulaValidatorService;

  const mockPrismaService = {
    client: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    document: {
      findFirst: jest.fn(),
    },
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockCedulaValidator = {
    validateCedula: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: S3Service, useValue: mockS3Service },
        { provide: CedulaValidatorService, useValue: mockCedulaValidator },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prismaService = module.get<PrismaService>(PrismaService);
    s3Service = module.get<S3Service>(S3Service);
    cedulaValidator = module.get<CedulaValidatorService>(CedulaValidatorService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'frontImage',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 1024,
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    const createClientDto = {
      type: ClientType.NATURAL_PERSON,
      name: 'Juan',
      lastName: 'Pérez',
      email: 'juan@test.com',
      documentType: DocumentType.CEDULA,
      documentNumber: '1710034065',
    };

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue({ id: '1', email: 'juan@test.com' });

      await expect(service.create(createClientDto, mockFile)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if document number already exists', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);
      mockPrismaService.document.findFirst.mockResolvedValue({
        documentNumber: '1710034065',
        client: { name: 'Existing Client' },
      });

      await expect(service.create(createClientDto, mockFile)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if frontImage is missing', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);
      mockPrismaService.document.findFirst.mockResolvedValue(null);

      await expect(service.create(createClientDto, null as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if cedula validation fails', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);
      mockPrismaService.document.findFirst.mockResolvedValue(null);
      mockCedulaValidator.validateCedula.mockResolvedValue({ valid: false, message: 'Cédula inválida' });

      await expect(service.create(createClientDto, mockFile)).rejects.toThrow(BadRequestException);
    });

    it('should create client successfully', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);
      mockPrismaService.document.findFirst.mockResolvedValue(null);
      mockCedulaValidator.validateCedula.mockResolvedValue({ valid: true, message: 'OK' });
      mockS3Service.uploadFile.mockResolvedValue('https://s3.example.com/image.jpg');
      mockPrismaService.client.create.mockResolvedValue({
        id: '1',
        ...createClientDto,
        documents: [{ id: '1', documentNumber: '1710034065' }],
      });

      const result = await service.create(createClientDto, mockFile);

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(mockFile, 'documents');
    });
  });

  describe('findAll', () => {
    it('should return all clients without filters', async () => {
      const mockClients = [
        { id: '1', name: 'Client 1', documents: [] },
        { id: '2', name: 'Client 2', documents: [] },
      ];
      mockPrismaService.client.findMany.mockResolvedValue(mockClients);

      const result = await service.findAll({});

      expect(result).toEqual(mockClients);
      expect(mockPrismaService.client.findMany).toHaveBeenCalled();
    });

    it('should filter clients by type', async () => {
      mockPrismaService.client.findMany.mockResolvedValue([]);

      await service.findAll({ type: ClientType.COMPANY });

      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: ClientType.COMPANY }),
        }),
      );
    });

    it('should search clients by term', async () => {
      mockPrismaService.client.findMany.mockResolvedValue([]);

      await service.findAll({ search: 'test' });

      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ OR: expect.any(Array) }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      const mockClient = { id: '1', name: 'Test Client', documents: [] };
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);

      const result = await service.findOne('1');

      expect(result).toEqual(mockClient);
    });

    it('should throw NotFoundException if client not found', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const mockClient = { id: '1', name: 'Test', email: 'test@test.com', documents: [] };
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.client.update.mockResolvedValue({ ...mockClient, name: 'Updated' });

      const result = await service.update('1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should throw ConflictException if email is already in use by another client', async () => {
      mockPrismaService.client.findUnique
        .mockResolvedValueOnce({ id: '1', email: 'old@test.com', documents: [] }) // findOne
        .mockResolvedValueOnce({ id: '2', email: 'new@test.com' }); // email check

      await expect(service.update('1', { email: 'new@test.com' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a client and its S3 files', async () => {
      const mockClient = {
        id: '1',
        name: 'Test',
        documents: [
          { frontImageUrl: 'https://s3.example.com/front.jpg', backImageUrl: 'https://s3.example.com/back.jpg' },
        ],
      };
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.client.delete.mockResolvedValue(mockClient);
      mockS3Service.deleteFile.mockResolvedValue(undefined);

      const result = await service.remove('1');

      expect(result.message).toContain('eliminado');
      expect(mockS3Service.deleteFile).toHaveBeenCalledTimes(2);
    });
  });
});
