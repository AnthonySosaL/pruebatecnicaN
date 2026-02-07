
```markdown
# Sistema de Gestión de Clientes

Sistema Full Stack para la gestión de clientes y documentos de identificación ecuatorianos (Cédula y RUC).

**Desarrollador:** Anthony Sosa  
**Institución:** PUCE - Pontificia Universidad Católica del Ecuador  
**Fecha:** 7 de febrero de 2026  
**Empresa:** Nexus Soluciones S.A.S

---

## 📋 Stack Tecnológico

### Backend
- NestJS 10
- Prisma ORM
- PostgreSQL (Railway)
- TypeScript
- Swagger/OpenAPI
- AWS SDK S3 (URLs pre-firmadas)

### Frontend
- Next.js 15 con App Router
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Zustand (gestión de estado)
- Axios

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- **Node.js** v20 o superior (recomendado v22 LTS)
- **npm** v10 o superior
- **Git**

Verificar versiones:
```bash
node --version
npm --version
git --version
```

---

## ⚙️ Configuración del Backend

### 1. Navegar a la carpeta del backend

```bash
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la carpeta `backend/`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# S3 Compatible Storage
S3_ENDPOINT="https://your-s3-endpoint.com"
S3_REGION="auto"
S3_BUCKET_NAME="your-bucket-name"
S3_ACCESS_KEY_ID="your-access-key-id"
S3_SECRET_ACCESS_KEY="your-secret-access-key"

# App
PORT=3001
NODE_ENV=development
```

**IMPORTANTE:** Las credenciales reales se proporcionarán por separado por razones de seguridad.

### 4. Ejecutar migraciones de base de datos

```bash
npx prisma migrate deploy
```

### 5. Generar cliente de Prisma

```bash
npx prisma generate
```

### 6. Iniciar el servidor de desarrollo

```bash
npm run start:dev
```

El backend estará disponible en: **http://localhost:3001**

**Documentación Swagger:** http://localhost:3001/api/docs

---

## 🎨 Configuración del Frontend

### 1. Abrir nueva terminal y navegar al frontend

```bash
cd frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env.local` en la carpeta `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:3000**

---

## ✅ Verificación de Instalación

### Backend funcionando correctamente:

1. Abrir http://localhost:3001/api/docs
2. Deberías ver la documentación Swagger con todos los endpoints

### Frontend funcionando correctamente:

1. Abrir http://localhost:3000
2. Deberías ver la pantalla de "Gestión de Clientes"
3. Botón de "Nuevo Cliente" visible

---

## 📂 Estructura del Proyecto

```
prueba-tecnica/
├── backend/                    # API NestJS
│   ├── prisma/                # Schema y migraciones de BD
│   ├── src/
│   │   ├── clients/           # Módulo de clientes (CRUD)
│   │   ├── s3/                # Servicio de almacenamiento S3
│   │   ├── prisma/            # Servicio de Prisma
│   │   └── main.ts            # Entry point
│   ├── .env                   # Variables de entorno (NO incluir en Git)
│   └── package.json
│
├── frontend/                  # Aplicación Next.js
│   ├── app/                   # App Router de Next.js
│   │   ├── clients/           # Páginas de clientes
│   │   │   ├── page.tsx       # Listado con búsqueda
│   │   │   ├── new/           # Formulario de creación
│   │   │   └── [id]/          # Detalle y edición
│   │   └── layout.tsx         # Layout principal
│   ├── components/            # Componentes reutilizables
│   ├── lib/                   # API client (Axios)
│   ├── store/                 # Zustand stores (tema)
│   ├── types/                 # Tipos TypeScript
│   ├── .env.local             # Variables de entorno (NO incluir en Git)
│   └── package.json
│
└── README.md                  # Este archivo
```

---

## 🧪 Funcionalidades Implementadas

### Core (100%)
- ✅ Crear cliente con documento de identificación
- ✅ Listar clientes con búsqueda y filtros
- ✅ Ver detalle completo de cliente
- ✅ Editar información de cliente
- ✅ Eliminar cliente y sus documentos
- ✅ Subida de imágenes a S3 (URLs pre-firmadas)
- ✅ Validaciones robustas en backend y frontend
- ✅ Soporte para Personas Naturales y Empresas
- ✅ Tipos de documentos: Cédula y RUC

### Funcionalidades Bonus
- ✅ Búsqueda en tiempo real por nombre, email o documento
- ✅ Filtros por tipo de cliente
- ✅ Documentación Swagger/OpenAPI completa
- ✅ Tema claro/oscuro con persistencia (Zustand)
- ✅ Vista previa de documentos escaneados
- ✅ Diseño responsive y accesible

---

## 📝 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/clients` | Crear cliente con documento |
| GET | `/api/clients` | Listar todos los clientes |
| GET | `/api/clients?search=texto` | Buscar clientes |
| GET | `/api/clients?type=NATURAL_PERSON` | Filtrar por tipo |
| GET | `/api/clients/:id` | Obtener cliente específico |
| PATCH | `/api/clients/:id` | Actualizar cliente |
| DELETE | `/api/clients/:id` | Eliminar cliente |

**Documentación completa:** http://localhost:3001/api/docs

---

## 🗄️ Base de Datos

### Modelos Prisma

**Client** - Información del cliente
- Tipo: NATURAL_PERSON o COMPANY
- Datos personales/empresariales
- Relación 1:N con Document

**Document** - Documentos de identificación
- Tipo: CEDULA o RUC
- Número de documento
- URLs de imágenes (frontal y posterior)
- Relación N:1 con Client

### Administración de Base de Datos

```bash
# Ver base de datos en interfaz visual
npx prisma studio

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Reset completo de BD (desarrollo)
npx prisma migrate reset
```

---

## 💾 Almacenamiento de Archivos

El sistema utiliza **AWS S3 compatible (t3.storage)** con **URLs pre-firmadas** para manejar buckets privados.

**Características:**
- Subida segura de documentos
- URLs firmadas válidas por 7 días
- Compatible con buckets privados
- Eliminación automática al borrar cliente

---

## 🎨 Características de UI/UX

- **Tema claro/oscuro** persistente con Zustand
- **Diseño responsive** mobile-first
- **Psicología de colores:**
  - Azul para Personas Naturales
  - Morado para Empresas
- **Validación en tiempo real** con feedback visual
- **Estados de carga** y mensajes informativos
- **Accesibilidad** con ARIA labels
- **Optimización de imágenes** con next/image

---

## 🏗️ Arquitectura y Patrones

### Backend
- **Repository Pattern** - Separación de lógica de datos
- **Dependency Injection** - Módulos desacoplados
- **DTO Pattern** - Validación con class-validator
- **Service Layer** - Lógica de negocio centralizada
- **Global Exception Filters** - Manejo de errores

### Frontend
- **Component-Based Architecture** - Componentes reutilizables
- **Custom Hooks** - Lógica compartida
- **Client Components** - Interactividad con 'use client'
- **Form Validation** - React Hook Form + Zod schemas
- **State Management** - Zustand con persistencia

---

## 🔧 Scripts Disponibles

### Backend
```bash
npm run start:dev     # Desarrollo con hot-reload
npm run build         # Compilar para producción
npm run start:prod    # Ejecutar en producción
npm run lint          # Linter
```

### Frontend
```bash
npm run dev           # Desarrollo
npm run build         # Compilar para producción
npm run start         # Ejecutar build de producción
npm run lint          # Linter
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verificar que `DATABASE_URL` en `.env` sea correcta
- Comprobar conexión a internet (Railway está en la nube)

### Error: "Port 3001 already in use"
- Detener otros procesos en puerto 3001: `npx kill-port 3001`
- O cambiar `PORT` en `.env` del backend

### Error: "Cannot find module"
- Eliminar `node_modules` y reinstalar:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Imágenes no se muestran
- Verificar que el backend esté corriendo
- Comprobar que S3 esté configurado correctamente
- Las URLs pre-firmadas expiran en 7 días

### Frontend no conecta con Backend
- Verificar `NEXT_PUBLIC_API_URL` en `.env.local`
- Asegurar que backend esté corriendo en puerto 3001
- Revisar CORS en backend (está habilitado por defecto)

---

## 📊 Validaciones Implementadas

### Backend (class-validator)
- Email único y formato válido
- Teléfono ecuatoriano: exactamente 10 dígitos
- Documento: entre 10 y 13 dígitos
- Apellido obligatorio para personas naturales
- Nombre legal obligatorio para empresas
- Imagen frontal obligatoria

### Frontend (Zod)
- Validación en tiempo real
- Mensajes de error descriptivos en español
- Validación condicional según tipo de cliente
- Prevención de envío con datos inválidos

---

## 🔒 Seguridad

- ✅ Variables de entorno separadas (no incluidas en Git)
- ✅ Validación de datos en backend y frontend
- ✅ URLs pre-firmadas con expiración para S3
- ✅ CORS configurado
- ✅ Sanitización de inputs
- ✅ TypeScript para prevenir errores de tipo

**IMPORTANTE:** Los archivos `.env` y `.env.local` están incluidos en `.gitignore` y no deben subirse al repositorio.

---

## 📧 Contacto

Para consultas sobre credenciales o configuración, contactar al desarrollador o al equipo de Nexus Soluciones S.A.S.

---

## 📄 Licencia

Este proyecto fue desarrollado como prueba técnica para Nexus Soluciones S.A.S.
```


