import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { S3Module } from '../s3/s3.module';
import { CedulaValidatorService } from './cedula-validator.service';

@Module({
  imports: [S3Module],
  controllers: [ClientsController],
  providers: [ClientsService, CedulaValidatorService],
})
export class ClientsModule {}
