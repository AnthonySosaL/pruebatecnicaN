import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { CedulaValidatorService } from './cedula-validator.service';
import { BadRequestException } from '@nestjs/common';
import { ClientType, DocumentType } from '@prisma/client';

describe('ClientsController', () => {
  let controller: ClientsController;
  let clientsService: ClientsService;
  let cedulaValidator: CedulaValidatorService;

  const mockClientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCedulaValidator = {
    validateCedula: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        { provide: ClientsService, useValue: mockClientsService },
        { provide: CedulaValidatorService, useValue: mockCedulaValidator },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
    clientsService = module.get<ClientsService>(ClientsService);
    cedulaValidator = module.get<CedulaValidatorService>(CedulaValidatorService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('validateCedula', () => {
    it('should throw BadRequestException for invalid cedula length', async () => {
      await expect(controller.validateCedula('12345')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty cedula', async () => {
      await expect(controller.validateCedula('')).rejects.toThrow(BadRequestException);
    });

    it('should return validation result for valid cedula format', async () => {
      mockCedulaValidator.validateCedula.mockResolvedValue({ valid: true, message: 'OK' });

      const result = await controller.validateCedula('1234567890');

      expect(result.success).toBe(true);
      expect(result.valid).toBe(true);
    });

    it('should return failure when validator throws error', async () => {
      mockCedulaValidator.validateCedula.mockRejectedValue(new Error('Service unavailable'));

      const result = await controller.validateCedula('1234567890');

      expect(result.success).toBe(false);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Service unavailable');
    });
  });

  describe('create', () => {
    const createClientDto = {
      type: ClientType.NATURAL_PERSON,
      name: 'Juan',
      lastName: 'Pérez',
      email: 'juan@test.com',
      documentType: DocumentType.CEDULA,
      documentNumber: '1710034065',
    };

    const mockFiles = {
      frontImage: [{ originalname: 'front.jpg', buffer: Buffer.from('test') }],
      backImage: [{ originalname: 'back.jpg', buffer: Buffer.from('test') }],
    };

    it('should call clientsService.create with correct parameters', async () => {
      const expectedResult = { id: '1', ...createClientDto };
      mockClientsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createClientDto, mockFiles as any);

      expect(mockClientsService.create).toHaveBeenCalledWith(
        createClientDto,
        mockFiles.frontImage[0],
        mockFiles.backImage[0],
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return array of clients', async () => {
      const mockClients = [{ id: '1', name: 'Client 1' }];
      mockClientsService.findAll.mockResolvedValue(mockClients);

      const result = await controller.findAll({});

      expect(result).toEqual(mockClients);
    });

    it('should pass query parameters to service', async () => {
      mockClientsService.findAll.mockResolvedValue([]);

      await controller.findAll({ search: 'test', type: ClientType.COMPANY });

      expect(mockClientsService.findAll).toHaveBeenCalledWith({
        search: 'test',
        type: ClientType.COMPANY,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single client', async () => {
      const mockClient = { id: '1', name: 'Test Client' };
      mockClientsService.findOne.mockResolvedValue(mockClient);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockClient);
      expect(mockClientsService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update and return client', async () => {
      const updateDto = { name: 'Updated Name' };
      const mockClient = { id: '1', name: 'Updated Name' };
      mockClientsService.update.mockResolvedValue(mockClient);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockClient);
      expect(mockClientsService.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete client and return success message', async () => {
      mockClientsService.remove.mockResolvedValue({ message: 'Cliente eliminado exitosamente' });

      const result = await controller.remove('1');

      expect(result.message).toContain('eliminado');
      expect(mockClientsService.remove).toHaveBeenCalledWith('1');
    });
  });
});
