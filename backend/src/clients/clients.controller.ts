import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CedulaValidatorService } from './cedula-validator.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';

@ApiTags('clients')
@Controller('api/clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly cedulaValidator: CedulaValidatorService,
  ) {}

  @Post('validate-cedula')
  @ApiOperation({ summary: 'Validar cédula ecuatoriana (servicio que puede fallar)' })
  @ApiBody({ 
    schema: { 
      properties: { 
        documentNumber: { type: 'string', example: '1234567890' } 
      } 
    } 
  })
  async validateCedula(@Body('documentNumber') documentNumber: string) {
    if (!documentNumber || documentNumber.length !== 10) {
      throw new BadRequestException('Número de cédula debe tener 10 dígitos');
    }

    try {
      const result = await this.cedulaValidator.validateCedula(documentNumber);
      return {
        success: true,
        ...result
      };
    } catch (error: any) {
      return {
        success: false,
        valid: false,
        message: error.message
      };
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo cliente con su documento' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El email ya está en uso' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'frontImage', maxCount: 1 },
      { name: 'backImage', maxCount: 1 },
    ]),
  )
  create(
    @Body() createClientDto: CreateClientDto,
    @UploadedFiles()
    files: {
      frontImage?: Express.Multer.File[];
      backImage?: Express.Multer.File[];
    },
  ) {
    const frontImage = files.frontImage?.[0];
    const backImage = files.backImage?.[0];
    
    return this.clientsService.create(
      createClientDto,
      frontImage!,
      backImage,
    );
  }


  @Get()
  @ApiOperation({ summary: 'Obtener todos los clientes con filtros opcionales' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre, email o documento' })
  @ApiQuery({ name: 'type', required: false, enum: ['NATURAL_PERSON', 'COMPANY'] })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  findAll(@Query() query: QueryClientDto) {
    return this.clientsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información de un cliente' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cliente y sus documentos' })
  @ApiResponse({ status: 200, description: 'Cliente eliminado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.remove(id);
  }
}
