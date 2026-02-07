import { Test, TestingModule } from '@nestjs/testing';
import { CedulaValidatorService } from './cedula-validator.service';

describe('CedulaValidatorService', () => {
  let service: CedulaValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CedulaValidatorService],
    }).compile();

    service = module.get<CedulaValidatorService>(CedulaValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validarCedulaEcuatoriana (private method via validateCedula)', () => {
    // Mock Math.random para evitar fallas aleatorias en tests
    beforeEach(() => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0.5); // No fallará (> 0.3)
    });

    afterEach(() => {
      jest.spyOn(global.Math, 'random').mockRestore();
    });

    it('should reject cedula with invalid length', async () => {
      const result = await service.validateCedula('12345'); // menos de 10 dígitos
      expect(result.valid).toBe(false);
      expect(result.message).toContain('no válida');
    });

    it('should reject cedula with invalid province code (00)', async () => {
      const result = await service.validateCedula('0012345678');
      expect(result.valid).toBe(false);
    });

    it('should reject cedula with invalid province code (25+)', async () => {
      const result = await service.validateCedula('2512345678');
      expect(result.valid).toBe(false);
    });

    it('should validate a correct ecuadorian cedula', async () => {
      // Cédula válida de ejemplo (generada con algoritmo módulo 10)
      // Provincia 17, dígitos: 1710034065
      const result = await service.validateCedula('1710034065');
      expect(result.valid).toBe(true);
      expect(result.message).toContain('válida');
    });

    it('should reject an invalid cedula with wrong check digit', async () => {
      const result = await service.validateCedula('1710034066'); // dígito verificador incorrecto
      expect(result.valid).toBe(false);
    });
  });

  describe('service failure simulation', () => {
    it('should throw error when service fails (random < 0.3)', async () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0.1); // Forzar falla

      await expect(service.validateCedula('1710034065')).rejects.toThrow(
        'Servicio de validación no disponible temporalmente',
      );

      jest.spyOn(global.Math, 'random').mockRestore();
    });

    it('should succeed when service does not fail (random >= 0.3)', async () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0.5); // No falla

      const result = await service.validateCedula('1710034065');
      expect(result).toBeDefined();

      jest.spyOn(global.Math, 'random').mockRestore();
    });
  });
});
