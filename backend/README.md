```markdown
# Backend - API de Gestión de Clientes

API REST desarrollada con NestJS para la gestión de clientes ecuatorianos y sus documentos de identificación.

---

## 📋 Tabla de Contenidos

- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Modelos de Datos](#modelos-de-datos)
- [Endpoints de la API](#endpoints-de-la-api)
- [Validaciones](#validaciones)
- [Instalación](#instalación)
- [Scripts Disponibles](#scripts-disponibles)
- [Decisiones de Diseño](#decisiones-de-diseño)

---

## 🛠️ Tecnologías Utilizadas

### Framework Principal
- **NestJS v10**: Framework progresivo de Node.js inspirado en Angular
  - ¿Por qué? Arquitectura modular, TypeScript nativo, inyección de dependencias

### ORM y Base de Datos
- **Prisma v5**: ORM de nueva generación para Node.js y TypeScript
  - ¿Por qué? Type-safety, migraciones automáticas, queries optimizados
- **PostgreSQL**: Base de datos relacional
  - ¿Por qué? ACID compliant, ideal para datos estructurados

### Validación y Documentación
- **class-validator**: Validación basada en decoradores
- **class-transformer**: Transformación de objetos
- **Swagger/OpenAPI**: Documentación automática de API
  - ¿Por qué? Documentación siempre actualizada, testing integrado

### Almacenamiento
- **AWS SDK S3**: Cliente para servicios compatibles con S3
  - URLs pre-firmadas para buckets privados
  - Expiración de 7 días por seguridad

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una **arquitectura modular** basada en los principios de NestJS:

```
┌─────────────────────────────────────┐
│         HTTP Request                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Controller Layer            │  ← Maneja HTTP requests/responses
│  - Routing                          │
│  - Request validation               │
│  - Response formatting              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Service Layer               │  ← Lógica de negocio
│  - Business logic                   │
│  - Data transformation              │
│  - Service orchestration            │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌─────────────┐  ┌─────────────┐
│   Prisma    │  │   S3 SDK    │        ← Servicios externos
│   Service   │  │   Service   │
└──────┬──────┘  └──────┬──────┘
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  PostgreSQL │  │   S3 Bucket │        ← Almacenamiento
└─────────────┘  └─────────────┘
```

### Principios Aplicados

1. **Separation of Concerns**: Cada capa tiene una responsabilidad única
2. **Dependency Injection**: Facilita testing y mantenimiento
3. **Single Responsibility**: Cada módulo/servicio hace una cosa bien
4. **Type Safety**: TypeScript en todo el proyecto

---

## 📁 Estructura de Carpetas Detallada

```
backend/
├── prisma/                          # Configuración de Prisma ORM
│   ├── schema.prisma               # Definición de modelos y relaciones
│   └── migrations/                 # Historial de cambios en BD
│       └── 20260207_init/         # Primera migración
│
├── src/                            # Código fuente
│   ├── main.ts                    # Entry point - Configuración app
│   │   ├── Inicializa NestJS
│   │   ├── Configura CORS
│   │   ├── Configura validación global
│   │   └── Configura Swagger
│   │
│   ├── app.module.ts              # Módulo raíz
│   │   └── Importa todos los módulos
│   │
│   ├── clients/                   # Módulo de Clientes
│   │   ├── dto/                   # Data Transfer Objects
│   │   │   ├── create-client.dto.ts    # Validaciones para crear
│   │   │   └── update-client.dto.ts    # Validaciones para actualizar
│   │   │
│   │   ├── clients.controller.ts  # Controlador HTTP
│   │   │   ├── @Post('/') crear
│   │   │   ├── @Get('/') listar
│   │   │   ├── @Get('/:id') obtener
│   │   │   ├── @Patch('/:id') actualizar
│   │   │   └── @Delete('/:id') eliminar
│   │   │
│   │   ├── clients.service.ts     # Lógica de negocio
│   │   │   ├── Validaciones complejas
│   │   │   ├── Transacciones de BD
│   │   │   └── Coordinación con S3
│   │   │
│   │   └── clients.module.ts      # Configuración del módulo
│   │       └── Declara providers e imports
│   │
│   ├── prisma/                    # Módulo de Prisma
│   │   ├── prisma.service.ts     # Cliente de Prisma
│   │   │   ├── Conexión a BD
│   │   │   └── Lifecycle hooks
│   │   │
│   │   └── prisma.module.ts      # Configuración global
│   │       └── Export PrismaService
│   │
│   └── s3/                       # Módulo de Almacenamiento
│       ├── s3.service.ts        # Lógica de S3
│       │   ├── uploadFile()     # Subir y generar URL firmada
│       │   └── deleteFile()     # Eliminar archivo
│       │
│       └── s3.module.ts         # Configuración S3
│           └── Inicializa cliente S3
│
├── .env                         # Variables de entorno (NO en Git)
├── .gitignore                   # Archivos ignorados
├── nest-cli.json               # Configuración de NestJS CLI
├── tsconfig.json               # Configuración de TypeScript
└── package.json                # Dependencias y scripts
```

---

## 🗄️ Modelos de Datos (Prisma Schema)

### Client Model

```prisma
model Client {
  id         String      @id @default(uuid())
  type       ClientType              // ENUM: NATURAL_PERSON | COMPANY
  
  // Datos de Persona Natural
  name       String
  lastName   String?
  
  // Datos de Empresa
  legalName  String?
  
  // Datos comunes
  email      String      @unique     // Índice único para búsquedas rápidas
  phone      String?
  address    String?
  
  // Relaciones
  documents  Document[]              // Un cliente puede tener N documentos
  
  // Timestamps automáticos
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  
  // Índices para optimizar queries
  @@index([type])
  @@index([email])
}
```

**Decisiones de diseño:**
- `id` como UUID: Más seguro que IDs secuenciales
- `email` único: Evita duplicados
- `lastName` y `legalName` opcionales: Dependen del tipo
- Índices en `type` y `email`: Optimizan búsquedas frecuentes
- Timestamps automáticos: Auditoría

### Document Model

```prisma
model Document {
  id             String       @id @default(uuid())
  type           DocumentType             // ENUM: CEDULA | RUC
  documentNumber String
  
  // URLs de imágenes (S3 signed URLs)
  frontImageUrl  String
  backImageUrl   String?
  
  // Relación con Cliente
  clientId       String
  client         Client       @relation(fields: [clientId], references: [id], onDelete: Cascade)
  
  // Timestamps
  uploadedAt     DateTime     @default(now())
  
  // Índices
  @@index([clientId])
  @@index([documentNumber])
}
```

**Decisiones de diseño:**
- `onDelete: Cascade`: Al borrar cliente, borra documentos automáticamente
- `backImageUrl` opcional: RUC puede tener una sola cara
- Índices en `clientId` y `documentNumber`: Búsquedas rápidas

### Enums

```prisma
enum ClientType {
  NATURAL_PERSON
  COMPANY
}

enum DocumentType {
  CEDULA
  RUC
}
```

**¿Por qué enums?**
- Type-safety en TypeScript
- Validación en BD
- Documentación clara

---

## 📡 Endpoints de la API

### POST /api/clients
**Crear nuevo cliente con documento**

**Content-Type:** `multipart/form-data`

**Body:**
```typescript
{
  type: 'NATURAL_PERSON' | 'COMPANY',
  name: string,
  lastName?: string,        // Requerido si type = NATURAL_PERSON
  legalName?: string,       // Requerido si type = COMPANY
  email: string,
  phone?: string,
  address?: string,
  documentType: 'CEDULA' | 'RUC',
  documentNumber: string,
  frontImage: File,         // Imagen (obligatorio)
  backImage?: File          // Imagen (opcional)
}
```

**Proceso interno:**
1. Validar DTO con class-validator
2. Verificar que email no exista
3. Subir imágenes a S3
4. Crear cliente en BD
5. Crear documento en BD
6. Retornar cliente completo

**Response 201:**
```json
{
  "id": "uuid",
  "type": "NATURAL_PERSON",
  "name": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "documents": [{
    "id": "uuid",
    "type": "CEDULA",
    "documentNumber": "1234567890",
    "frontImageUrl": "https://...",
    "uploadedAt": "2026-02-07T..."
  }],
  "createdAt": "2026-02-07T...",
  "updatedAt": "2026-02-07T..."
}
```

---

### GET /api/clients
**Listar todos los clientes con filtros opcionales**

**Query Parameters:**
- `search?: string` - Busca en name, email, documentNumber
- `type?: ClientType` - Filtra por tipo de cliente

**Proceso interno:**
1. Construir query dinámicamente con Prisma
2. Aplicar filtros si existen
3. Incluir documentos relacionados
4. Ordenar por createdAt DESC

**Response 200:**
```json
[
  {
    "id": "uuid",
    "type": "NATURAL_PERSON",
    "name": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "documents": [...],
    "createdAt": "2026-02-07T..."
  }
]
```

---

### GET /api/clients/:id
**Obtener cliente específico**

**Proceso interno:**
1. Buscar cliente por ID con Prisma
2. Incluir documentos relacionados
3. Si no existe, lanzar NotFoundException

**Response 200:** Cliente completo
**Response 404:** `{ message: 'Cliente no encontrado' }`

---

### PATCH /api/clients/:id
**Actualizar información del cliente**

**Body:**
```typescript
{
  name?: string,
  lastName?: string,
  legalName?: string,
  email?: string,
  phone?: string,
  address?: string
}
```

**Restricciones:**
- NO se puede cambiar `type`
- NO se pueden actualizar documentos (por seguridad)
- Email debe ser único

**Response 200:** Cliente actualizado

---

### DELETE /api/clients/:id
**Eliminar cliente y sus documentos**

**Proceso interno:**
1. Buscar cliente
2. Eliminar imágenes de S3
3. Eliminar cliente de BD (Cascade elimina documentos)

**Response 200:**
```json
{
  "message": "Cliente eliminado exitosamente"
}
```

---

## ✅ Validaciones Implementadas

### DTOs con class-validator

```typescript
// create-client.dto.ts
export class CreateClientDto {
  @IsEnum(ClientType)
  type: ClientType;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @Matches(/^[0-9]{10}$/)
  phone?: string;

  @Matches(/^[0-9]{10,13}$/)
  documentNumber: string;
}
```

**Validaciones aplicadas:**
- `@IsEnum`: Solo valores permitidos
- `@IsString`: Tipo correcto
- `@MinLength`: Longitud mínima
- `@IsEmail`: Formato de email válido
- `@Matches`: Expresiones regulares (teléfono, documento)
- `@IsOptional`: Campo no obligatorio

### Validaciones personalizadas en Service

```typescript
// Verificar email único
const existingClient = await this.prisma.client.findUnique({
  where: { email }
});
if (existingClient) {
  throw new ConflictException('El email ya está registrado');
}

// Validación condicional
if (type === ClientType.NATURAL_PERSON && !lastName) {
  throw new BadRequestException('Apellido requerido para personas naturales');
}
```

---

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env
DATABASE_URL="postgresql://..."
S3_ENDPOINT="https://..."
# ... resto de variables

# 3. Ejecutar migraciones
npx prisma migrate deploy

# 4. Generar cliente Prisma
npx prisma generate

# 5. Iniciar servidor
npm run start:dev
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Hot-reload con nodemon

# Producción
npm run build             # Compilar TypeScript
npm run start:prod        # Ejecutar build

# Base de datos
npx prisma studio         # Interfaz visual de BD
npx prisma migrate dev    # Crear nueva migración
npx prisma generate       # Regenerar cliente Prisma

# Calidad de código
npm run lint              # ESLint
npm run format            # Prettier
npm run test              # Jest tests
```

---

## 💡 Decisiones de Diseño y Justificaciones

### 1. ¿Por qué NestJS sobre Express puro?

**Express puro:**
- ❌ Sin estructura definida
- ❌ Más código boilerplate
- ❌ DI manual

**NestJS:**
- ✅ Arquitectura modular
- ✅ Dependency Injection nativo
- ✅ TypeScript first-class
- ✅ Decorators para validación
- ✅ Swagger automático

### 2. ¿Por qué Prisma sobre TypeORM?

**TypeORM:**
- ❌ Sintaxis más verbosa
- ❌ Migraciones manuales complejas

**Prisma:**
- ✅ Schema declarativo y legible
- ✅ Migraciones automáticas
- ✅ Type-safety perfecto
- ✅ Query API intuitiva
- ✅ Prisma Studio (GUI)

### 3. ¿Por qué URLs pre-firmadas?

**URLs públicas:**
- ❌ Bucket debe ser público
- ❌ Riesgo de seguridad
- ❌ Sin control de acceso

**URLs pre-firmadas:**
- ✅ Bucket privado
- ✅ Acceso temporal (7 días)
- ✅ Seguridad por diseño
- ✅ No requiere autenticación adicional

### 4. ¿Por qué Cascade Delete?

```prisma
client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)
```

- ✅ Integridad referencial
- ✅ No documentos huérfanos
- ✅ Menos código manual
- ✅ Transaccional (todo o nada)

### 5. ¿Por qué UUIDs en lugar de IDs incrementales?

**IDs incrementales (1, 2, 3...):**
- ❌ Predecibles
- ❌ Revelan cantidad de registros
- ❌ Problemas en sistemas distribuidos

**UUIDs:**
- ✅ Únicos globalmente
- ✅ No predecibles
- ✅ Seguros para APIs públicas
- ✅ Generables en cliente sin conflictos

---

## 🧪 Testing (Bonus - No implementado por tiempo)

```typescript
// Ejemplo de test unitario
describe('ClientsService', () => {
  it('should create a client', async () => {
    const dto = { /* ... */ };
    const result = await service.create(dto, files);
    expect(result.email).toBe(dto.email);
  });
});
```

---

## 📈 Mejoras Futuras

- [ ] Autenticación JWT con roles
- [ ] Rate limiting con @nestjs/throttler
- [ ] Logging estructurado con Winston
- [ ] Cache con Redis
- [ ] Paginación en listados
- [ ] Soft deletes (borrado lógico)
- [ ] Tests E2E completos
- [ ] Health checks endpoint
- [ ] Métricas con Prometheus

---

## 📚 Recursos de Aprendizaje

- [Documentación oficial NestJS](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)

---

**Desarrollado con ❤️ usando buenas prácticas y arquitectura limpia**
```
