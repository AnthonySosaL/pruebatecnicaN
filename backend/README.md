## README Backend - Versión Final y Concisa

### `backend/README.md`

```markdown
# Backend - API de Gestión de Clientes

API REST desarrollada con NestJS para la gestión de clientes ecuatorianos y sus documentos de identificación.

---

## 🛠️ Tecnologías

- **NestJS 10** - Framework progresivo de Node.js
- **Prisma ORM** - ORM de nueva generación con type-safety
- **PostgreSQL** - Base de datos relacional
- **TypeScript** - Tipado estático
- **Swagger/OpenAPI** - Documentación automática
- **AWS SDK S3** - Almacenamiento con URLs pre-firmadas
- **class-validator** - Validación de DTOs

---

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Copiar .env.example a .env y completar con credenciales reales

# 3. Ejecutar migraciones
npx prisma migrate deploy

# 4. Generar cliente Prisma
npx prisma generate

# 5. Iniciar servidor
npm run start:dev
```

**Servidor:** http://localhost:3001  
**Documentación:** http://localhost:3001/api/docs

---

## 📂 Estructura del Proyecto

```
backend/
├── prisma/
│   ├── schema.prisma              # Modelos de datos
│   └── migrations/                # Historial de migraciones
│
├── src/
│   ├── main.ts                    # Configuración principal
│   ├── app.module.ts              # Módulo raíz
│   │
│   ├── clients/                   # Módulo de clientes
│   │   ├── dto/                   # Data Transfer Objects
│   │   ├── clients.controller.ts # Endpoints HTTP
│   │   ├── clients.service.ts    # Lógica de negocio
│   │   ├── cedula-validator.service.ts # Validación externa
│   │   └── clients.module.ts     # Configuración módulo
│   │
│   ├── prisma/                    # Módulo de Prisma
│   │   ├── prisma.service.ts     # Cliente de BD
│   │   └── prisma.module.ts
│   │
│   └── s3/                        # Módulo de almacenamiento
│       ├── s3.service.ts         # Gestión de archivos
│       └── s3.module.ts
│
└── .env                           # Variables de entorno
```

---

## 🗄️ Modelos de Datos

### Client
```prisma
model Client {
  id         String      @id @default(uuid())
  type       ClientType  // NATURAL_PERSON | COMPANY
  name       String
  lastName   String?
  legalName  String?
  email      String      @unique
  phone      String?
  address    String?
  documents  Document[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}
```

### Document
```prisma
model Document {
  id             String       @id @default(uuid())
  type           DocumentType // CEDULA | RUC
  documentNumber String
  frontImageUrl  String
  backImageUrl   String?
  clientId       String
  client         Client       @relation(onDelete: Cascade)
  uploadedAt     DateTime     @default(now())
  
  @@unique([type, documentNumber]) // Previene duplicados
}
```

---

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/clients` | Crear cliente con documento |
| GET | `/api/clients` | Listar con búsqueda y filtros |
| GET | `/api/clients/:id` | Obtener cliente específico |
| PATCH | `/api/clients/:id` | Actualizar información |
| DELETE | `/api/clients/:id` | Eliminar cliente |
| POST | `/api/clients/validate-cedula` | Validar cédula (servicio externo simulado) |

**Query Parameters (GET /api/clients):**
- `search`: Buscar por nombre, email o documento
- `type`: Filtrar por NATURAL_PERSON o COMPANY

---

## ✅ Validaciones Implementadas

### Validaciones Backend
- Email único en el sistema
- Documento único (cédula/RUC no duplicados)
- Teléfono ecuatoriano: 10 dígitos
- Documento: 10-13 dígitos
- Apellido obligatorio para personas naturales
- Nombre legal obligatorio para empresas
- Imagen frontal obligatoria
- Validación de cédula con algoritmo módulo 10
- Simulación de servicio externo de validación

### DTOs con class-validator
```typescript
export class CreateClientDto {
  @IsEnum(ClientType)
  type: ClientType;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @Matches(/^[0-9]{10}$/)
  @IsOptional()
  phone?: string;

  @Matches(/^[0-9]{10,13}$/)
  documentNumber: string;
}
```

---

## 🔒 Servicio de Validación de Cédula

El sistema incluye un servicio que simula la validación con el Registro Civil:

**Características:**
- Valida estructura de cédula ecuatoriana (algoritmo módulo 10)
- Simula latencia de red (500-1500ms)
- Falla aleatoriamente 30% del tiempo
- Endpoint de prueba disponible en Swagger

**Uso:**
```bash
POST /api/clients/validate-cedula
Body: { "documentNumber": "1234567890" }
```

---

## 💾 Almacenamiento de Archivos

**Tecnología:** AWS S3 compatible (t3.storage)  
**Método:** URLs pre-firmadas para buckets privados

**Flujo:**
1. Cliente sube archivo via multipart/form-data
2. Backend sube a S3 con `PutObjectCommand`
3. Genera URL pre-firmada válida por 7 días
4. Retorna URL al cliente
5. Frontend consume URL directamente

**Ventajas:**
- Bucket privado (más seguro)
- URLs con expiración
- No requiere autenticación adicional
- Acceso temporal controlado

---

## 🏗️ Arquitectura

### Patrón de Capas

```
Controller → Service → Prisma/S3
   ↓           ↓          ↓
 HTTP      Business    Data
Request    Logic      Access
```

### Principios Aplicados
- **Separation of Concerns**: Cada capa con responsabilidad única
- **Dependency Injection**: Módulos desacoplados y testables
- **Repository Pattern**: Abstracción de acceso a datos
- **Single Responsibility**: Servicios específicos

---

## 📜 Scripts

```bash
npm run start:dev     # Desarrollo con hot-reload
npm run build         # Compilar para producción
npm run start:prod    # Ejecutar producción
npx prisma studio     # Interfaz visual de BD
npx prisma migrate dev # Crear migración
```

---

## 🎯 Características Destacadas

### Transacciones
Creación de cliente y documento en una sola transacción atómica:
```typescript
const client = await this.prisma.client.create({
  data: {
    // datos del cliente
    documents: {
      create: {
        // datos del documento
      }
    }
  }
});
```

### Cascade Delete
Al eliminar un cliente, sus documentos y archivos en S3 se eliminan automáticamente.

### Validación en Múltiples Niveles
1. DTOs con decoradores
2. Service layer con lógica de negocio
3. Base de datos con constraints únicos
4. Servicio externo de validación

---

## 🔧 Variables de Entorno

```env
DATABASE_URL="postgresql://..."
S3_ENDPOINT="https://..."
S3_REGION="auto"
S3_BUCKET_NAME="..."
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
PORT=3001
```

Ver `.env.example` para plantilla completa.

---

## 📊 Decisiones Técnicas

### ¿Por qué NestJS?
Arquitectura modular, TypeScript nativo, DI integrada, Swagger automático.

### ¿Por qué Prisma?
Type-safety, migraciones automáticas, schema declarativo, Prisma Studio.

### ¿Por qué UUIDs?
Únicos globalmente, no predecibles, seguros para APIs.

### ¿Por qué URLs pre-firmadas?
Bucket privado, acceso temporal, seguridad por diseño.

---

## 📈 Features Implementadas

- ✅ CRUD completo de clientes
- ✅ Subida de archivos a S3
- ✅ Búsqueda y filtros dinámicos
- ✅ Validaciones robustas
- ✅ Documentación Swagger completa
- ✅ Servicio de validación externa
- ✅ Manejo de errores descriptivo
- ✅ Constraint de documentos únicos
- ✅ Cascade deletes
- ✅ TypeScript end-to-end

---

**Desarrollado siguiendo las mejores prácticas de arquitectura limpia y SOLID**
```
