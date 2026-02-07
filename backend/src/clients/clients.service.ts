import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { ClientType } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async create(
    createClientDto: CreateClientDto,
    frontImage: Express.Multer.File,
    backImage?: Express.Multer.File,
  ) {
    // Validar que el email no exista
    const existingClient = await this.prisma.client.findUnique({
      where: { email: createClientDto.email },
    });

    if (existingClient) {
      throw new ConflictException('Ya existe un cliente con este correo electrónico');
    }

    // Validar imágenes
    if (!frontImage) {
      throw new BadRequestException('La imagen frontal del documento es obligatoria');
    }

    // Subir imágenes a S3
    const frontImageUrl = await this.s3Service.uploadFile(frontImage, 'documents');
    let backImageUrl: string | undefined;

    if (backImage) {
      backImageUrl = await this.s3Service.uploadFile(backImage, 'documents');
    }

    // Crear cliente con documento
    try {
      const client = await this.prisma.client.create({
        data: {
          type: createClientDto.type,
          name: createClientDto.name,
          lastName: createClientDto.type === ClientType.NATURAL_PERSON ? createClientDto.lastName : null,
          legalName: createClientDto.type === ClientType.COMPANY ? createClientDto.legalName : null,
          email: createClientDto.email,
          phone: createClientDto.phone,
          address: createClientDto.address,
          documents: {
            create: {
              type: createClientDto.documentType,
              documentNumber: createClientDto.documentNumber,
              frontImageUrl,
              backImageUrl,
            },
          },
        },
        include: {
          documents: true,
        },
      });

      return client;
    } catch (error) {
      // Si falla la creación, eliminar imágenes de S3
      await this.s3Service.deleteFile(frontImageUrl);
      if (backImageUrl) {
        await this.s3Service.deleteFile(backImageUrl);
      }
      throw error;
    }
  }

  async findAll(query: QueryClientDto) {
    const { search, type } = query;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { legalName: { contains: search, mode: 'insensitive' } },
        {
          documents: {
            some: {
              documentNumber: { contains: search },
            },
          },
        },
      ];
    }

    return this.prisma.client.findMany({
      where,
      include: {
        documents: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        documents: true,
      },
    });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    // Verificar que el cliente existe
    await this.findOne(id);

    // Si se actualiza el email, verificar que no esté en uso
    if (updateClientDto.email) {
      const existingClient = await this.prisma.client.findUnique({
        where: { email: updateClientDto.email },
      });

      if (existingClient && existingClient.id !== id) {
        throw new ConflictException('El correo electrónico ya está en uso por otro cliente');
      }
    }

    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
      include: {
        documents: true,
      },
    });
  }

  async remove(id: string) {
    const client = await this.findOne(id);

    // Eliminar imágenes de S3
    for (const document of client.documents) {
      await this.s3Service.deleteFile(document.frontImageUrl);
      if (document.backImageUrl) {
        await this.s3Service.deleteFile(document.backImageUrl);
      }
    }

    // Eliminar cliente (Cascade eliminará los documentos automáticamente)
    await this.prisma.client.delete({
      where: { id },
    });

    return { message: 'Cliente eliminado exitosamente' };
  }
}
