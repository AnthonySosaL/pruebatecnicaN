import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ClientType } from '@prisma/client';

export class QueryClientDto {
  @ApiPropertyOptional({
    description: 'Buscar por nombre, email o número de documento',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ClientType,
    description: 'Filtrar por tipo de cliente',
  })
  @IsOptional()
  @IsEnum(ClientType)
  type?: ClientType;
}
