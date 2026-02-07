import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf, Matches, MinLength } from 'class-validator';
import { ClientType, DocumentType } from '@prisma/client';

export class CreateClientDto {
  @ApiProperty({
    enum: ClientType,
    description: 'Tipo de cliente: NATURAL_PERSON o COMPANY',
    example: 'NATURAL_PERSON',
  })
  @IsEnum(ClientType, { message: 'El tipo debe ser NATURAL_PERSON o COMPANY' })
  @IsNotEmpty({ message: 'El tipo de cliente es obligatorio' })
  type: ClientType;

  @ApiProperty({
    description: 'Nombre del cliente o razón social',
    example: 'Juan',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Apellido (requerido para personas naturales)',
    example: 'Pérez',
  })
  @ValidateIf((o) => o.type === ClientType.NATURAL_PERSON)
  @IsNotEmpty({ message: 'El apellido es obligatorio para personas naturales' })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Nombre legal (requerido para empresas)',
    example: 'Empresa S.A.',
  })
  @ValidateIf((o) => o.type === ClientType.COMPANY)
  @IsNotEmpty({ message: 'El nombre legal es obligatorio para empresas' })
  @IsString({ message: 'El nombre legal debe ser una cadena de texto' })
  legalName?: string;

  @ApiProperty({
    description: 'Correo electrónico',
    example: 'juan.perez@example.com',
  })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '0987654321',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Matches(/^[0-9]{10}$/, { message: 'El teléfono debe tener 10 dígitos' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Dirección',
    example: 'Av. Amazonas y Naciones Unidas, Quito',
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  address?: string;

  // Documentos
  @ApiProperty({
    enum: DocumentType,
    description: 'Tipo de documento: CEDULA o RUC',
    example: 'CEDULA',
  })
  @IsEnum(DocumentType, { message: 'El tipo de documento debe ser CEDULA o RUC' })
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  documentType: DocumentType;

  @ApiProperty({
    description: 'Número de documento (cédula o RUC)',
    example: '1234567890',
  })
  @IsString({ message: 'El número de documento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @Matches(/^[0-9]{10,13}$/, { message: 'El documento debe tener entre 10 y 13 dígitos' })
  documentNumber: string;
}
