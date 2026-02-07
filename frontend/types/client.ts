export enum ClientType {
  NATURAL_PERSON = 'NATURAL_PERSON',
  COMPANY = 'COMPANY',
}

export enum DocumentType {
  CEDULA = 'CEDULA',
  RUC = 'RUC',
}

export interface Document {
  id: string;
  type: DocumentType;
  documentNumber: string;
  frontImageUrl: string;
  backImageUrl?: string;
  uploadedAt: string;
}

export interface Client {
  id: string;
  type: ClientType;
  name: string;
  lastName?: string;
  legalName?: string;
  email: string;
  phone?: string;
  address?: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  type: ClientType;
  name: string;
  lastName?: string;
  legalName?: string;
  email: string;
  phone?: string;
  address?: string;
  documentType: DocumentType;
  documentNumber: string;
  frontImage: File;
  backImage?: File;
}
