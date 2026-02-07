```markdown
# Frontend - Sistema de Gestión de Clientes

Aplicación web moderna desarrollada con Next.js 15, TypeScript y Tailwind CSS para la gestión integral de clientes.

---

## 📋 Tabla de Contenidos

- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Flujo de Datos](#flujo-de-datos)
- [Componentes Principales](#componentes-principales)
- [Gestión de Estado](#gestión-de-estado)
- [Validación de Formularios](#validación-de-formularios)
- [Instalación](#instalación)
- [Decisiones de Diseño](#decisiones-de-diseño)

---

## 🛠️ Tecnologías Utilizadas

### Framework Principal
- **Next.js 15**: Framework React con App Router
  - ¿Por qué? Server Components, optimización automática, routing file-based
  - React 19 con React Compiler para mejor rendimiento

### Lenguaje y Tipado
- **TypeScript 5**: Tipado estático end-to-end
  - ¿Por qué? Detecta errores en desarrollo, mejor autocompletado, documentación viva

### Estilos
- **Tailwind CSS 3**: Framework utility-first
  - ¿Por qué? Desarrollo rápido, consistencia, responsive nativo, tree-shaking automático
  - Configuración de dark mode con `class` strategy

### Gestión de Formularios
- **React Hook Form 7**: Manejo eficiente de formularios
  - ¿Por qué? Performance (uncontrolled), menos re-renders, validación integrada
- **Zod 3**: Schema validation
  - ¿Por qué? Type-safe, composable, mensajes de error customizables

### Estado Global
- **Zustand 4**: State management minimalista
  - ¿Por qué? Simple, sin boilerplate, performance, persistencia fácil
  - Usado para tema claro/oscuro con localStorage

### HTTP Client
- **Axios 1**: Cliente HTTP
  - ¿Por qué? Interceptors, mejor manejo de errores, transformación de datos

### Iconos y UI
- **Heroicons**: Iconografía oficial de Tailwind
  - ¿Por qué? Diseño consistente, SVG optimizados, tree-shakeable

---

## 🏗️ Arquitectura del Proyecto

El proyecto usa **App Router de Next.js 15** con arquitectura de Client Components donde es necesario:

```
┌─────────────────────────────────────┐
│         Browser (Client)            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         React Components            │
│  - Client Components ('use client') │
│  - Hooks (useState, useEffect)      │
│  - Event handlers                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         API Layer (lib/api.ts)      │
│  - Axios instance                   │
│  - Base URL configuration           │
│  - Error handling                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Backend API                 │
│  - NestJS REST endpoints            │
│  - http://localhost:3001            │
└─────────────────────────────────────┘
```

### Flujo de Interacción

```
Usuario interactúa con UI
         ↓
React Hook Form captura datos
         ↓
Zod valida schema
         ↓
Si válido → Axios hace request
         ↓
Backend procesa
         ↓
Response actualiza UI
         ↓
Zustand persiste preferencias (tema)
```

---

## 📁 Estructura de Carpetas Detallada

```
frontend/
├── app/                              # App Router (Next.js 15)
│   ├── layout.tsx                   # Layout raíz
│   │   ├── ThemeProvider           # Wrapper para tema
│   │   ├── Navbar global           # Navegación persistente
│   │   └── <html> y <body>         # Estructura HTML
│   │
│   ├── page.tsx                     # Ruta raíz "/"
│   │   └── redirect('/clients')    # Redirección automática
│   │
│   ├── clients/                     # Rutas de clientes
│   │   ├── page.tsx                # /clients - Listado
│   │   │   ├── Estado: clients[], loading, search, filters
│   │   │   ├── useEffect → fetchClients()
│   │   │   ├── Barra de búsqueda en tiempo real
│   │   │   ├── Filtro por tipo
│   │   │   └── Grid de cards con Link a detalle
│   │   │
│   │   ├── new/                    # /clients/new - Crear
│   │   │   └── page.tsx
│   │   │       ├── React Hook Form + Zod
│   │   │       ├── Validación condicional (tipo)
│   │   │       ├── Upload de archivos
│   │   │       └── POST → redirect a detalle
│   │   │
│   │   └── [id]/                   # /clients/:id - Dinámico
│   │       ├── page.tsx            # Detalle de cliente
│   │       │   ├── useParams() → id
│   │       │   ├── GET cliente
│   │       │   ├── Mostrar info + documentos
│   │       │   ├── Botón Editar
│   │       │   └── Botón Eliminar con confirmación
│   │       │
│   │       └── edit/
│   │           └── page.tsx        # Editar cliente
│   │               ├── GET cliente actual
│   │               ├── Prellenar formulario con reset()
│   │               ├── PATCH → redirect a detalle
│   │               └── Campos de documento readonly
│   │
│   ├── globals.css                 # Estilos globales
│   │   ├── @tailwind directives
│   │   ├── Variables CSS (--background, --foreground)
│   │   └── Clases utility custom
│   │
│   └── favicon.ico                 # Favicon
│
├── components/                      # Componentes reutilizables
│   ├── ThemeProvider.tsx           # Provider de tema
│   │   ├── 'use client'
│   │   ├── useThemeStore()
│   │   ├── useEffect → toggle dark class
│   │   ├── Mounted check (evita hydration)
│   │   └── Wrapper children
│   │
│   └── ThemeToggle.tsx             # Botón toggle tema
│       ├── 'use client'
│       ├── useThemeStore()
│       ├── onClick → toggleTheme()
│       └── Iconos MoonIcon/SunIcon
│
├── lib/                            # Utilidades y configuración
│   └── api.ts                      # Cliente Axios
│       ├── axios.create()
│       ├── baseURL desde env
│       ├── Headers default
│       └── Export instancia configurada
│
├── store/                          # Estado global (Zustand)
│   └── theme.ts                    # Store de tema
│       ├── create<ThemeStore>()
│       ├── persist middleware (localStorage)
│       ├── theme: 'light' | 'dark'
│       └── toggleTheme()
│
├── types/                          # Definiciones TypeScript
│   └── client.ts                   # Tipos del dominio
│       ├── enum ClientType
│       ├── enum DocumentType
│       ├── interface Client
│       ├── interface Document
│       ├── interface CreateClientDto
│       └── Sincronizados con backend
│
├── public/                         # Archivos estáticos
│
├── .env.local                      # Variables de entorno (NO en Git)
│   └── NEXT_PUBLIC_API_URL
│
├── .gitignore                      # Ignorar archivos
├── next.config.ts                  # Configuración Next.js
│   └── images.remotePatterns (S3)
├── tailwind.config.ts              # Configuración Tailwind
│   └── darkMode: 'class'
├── tsconfig.json                   # Configuración TypeScript
└── package.json                    # Dependencias
```

---

## 🔄 Flujo de Datos en Detalle

### Ejemplo: Crear Cliente

```typescript
// 1. Usuario llena formulario
<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('name')} />
</form>

// 2. React Hook Form captura valores
const { register, handleSubmit, formState: { errors } } = useForm<CreateClientForm>({
  resolver: zodResolver(createClientSchema)
});

// 3. Zod valida antes de submit
const createClientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  // ...
});

// 4. Si válido, ejecuta onSubmit
const onSubmit = async (data: CreateClientForm) => {
  // 5. Construir FormData con archivos
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('frontImage', data.frontImage);
  
  // 6. POST a backend vía Axios
  const response = await api.post('/api/clients', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  // 7. Redirect a detalle
  router.push(`/clients/${response.data.id}`);
};
```

### Ejemplo: Búsqueda en Tiempo Real

```typescript
// 1. Estado de búsqueda
const [search, setSearch] = useState('');
const [clients, setClients] = useState<Client[]>([]);

// 2. useEffect escucha cambios
useEffect(() => {
  fetchClients();
}, [search]); // Re-ejecuta cuando search cambia

// 3. Fetch con query params
const fetchClients = async () => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  
  const response = await api.get(`/api/clients?${params.toString()}`);
  setClients(response.data);
};

// 4. Input actualiza estado
<input 
  value={search}
  onChange={(e) => setSearch(e.target.value)} // Trigger useEffect
/>
```

---

## 🧩 Componentes Principales

### 1. Layout Principal (`app/layout.tsx`)

**Responsabilidades:**
- Estructura HTML raíz
- Navbar global persistente
- ThemeProvider wrapper
- Fuentes (Inter de Google Fonts)

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {/* Navbar */}
          <nav>...</nav>
          
          {/* Contenido de página */}
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**¿Por qué suppressHydrationWarning?**
- Evita warning por tema que cambia en cliente

---

### 2. ThemeProvider (`components/ThemeProvider.tsx`)

**Responsabilidades:**
- Sincronizar tema con DOM
- Evitar flash de tema incorrecto
- Manejar hydration mismatch

```typescript
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, mounted]);

  // Evitar hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
```

**Problema que resuelve:**
- Server-side: no conoce tema del usuario
- Client-side: lee tema de localStorage
- Sin mounted check → HTML no coincide → hydration error

---

### 3. Listado de Clientes (`app/clients/page.tsx`)

**Features:**
- ✅ Búsqueda en tiempo real (debounce implícito por useEffect)
- ✅ Filtro por tipo de cliente
- ✅ Grid responsive (1 col mobile, 3 cols desktop)
- ✅ Loading states
- ✅ Empty states
- ✅ Cards con preview de datos

**Estados manejados:**
```typescript
const [clients, setClients] = useState<Client[]>([]);     // Lista de clientes
const [loading, setLoading] = useState(true);             // Cargando inicial
const [search, setSearch] = useState('');                 // Texto búsqueda
const [typeFilter, setTypeFilter] = useState<ClientType | ''>(''); // Filtro tipo
```

---

### 4. Formulario de Creación (`app/clients/new/page.tsx`)

**Features:**
- ✅ Validación en tiempo real
- ✅ Mensajes de error descriptivos
- ✅ Campos condicionales (tipo de cliente)
- ✅ Upload de archivos
- ✅ Loading state durante creación

**Validación condicional con Zod:**
```typescript
.refine(
  (data) => {
    if (data.type === ClientType.NATURAL_PERSON) {
      return !!data.lastName; // Apellido obligatorio
    }
    return true;
  },
  {
    message: 'El apellido es obligatorio para personas naturales',
    path: ['lastName'],
  }
)
```

---

### 5. Detalle de Cliente (`app/clients/[id]/page.tsx`)

**Features:**
- ✅ useParams() para obtener ID dinámico
- ✅ Carga de cliente con documentos
- ✅ Vista previa de imágenes con next/image
- ✅ Botones de acción (Editar, Eliminar)
- ✅ Confirmación antes de eliminar

**Optimización de imágenes:**
```typescript
<Image
  src={doc.frontImageUrl}
  alt="Documento frontal"
  fill
  className="object-cover"
  unoptimized // URLs pre-firmadas no son compatibles con Image Optimization
/>
```

---

## 💾 Gestión de Estado

### Zustand Store (Tema)

```typescript
// store/theme.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'theme-storage', // Clave en localStorage
    }
  )
);
```

**¿Por qué Zustand y no Context?**

**React Context:**
- ❌ Causa re-renders innecesarios
- ❌ Más boilerplate
- ❌ Sin persistencia nativa

**Zustand:**
- ✅ Solo componentes que usan el estado re-renderizan
- ✅ API minimalista
- ✅ Persistencia con middleware
- ✅ No requiere Provider en árbol

---

## ✅ Validación de Formularios

### Schema Zod para Crear Cliente

```typescript
const createClientSchema = z.object({
  type: z.nativeEnum(ClientType),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().optional(),
  legalName: z.string().optional(),
  email: z.string().email('Debe ser un correo electrónico válido'),
  phone: z.string()
    .regex(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos')
    .optional()
    .or(z.literal('')), // Permite string vacío
  address: z.string().optional(),
  documentType: z.nativeEnum(DocumentType),
  documentNumber: z.string()
    .regex(/^[0-9]{10,13}$/, 'El documento debe tener entre 10 y 13 dígitos'),
  frontImage: z.any()
    .refine((files) => files?.length > 0, 'La imagen frontal es obligatoria'),
  backImage: z.any().optional(),
})
.refine(/* validación condicional lastName */)
.refine(/* validación condicional legalName */);
```

**Ventajas de Zod:**
- Type inference automático: `type CreateClientForm = z.infer<typeof createClientSchema>`
- Composable: `.refine()` para lógica custom
- Mensajes personalizados por validación
- Integración perfecta con React Hook Form

---

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Crear .env.local:
NEXT_PUBLIC_API_URL=http://localhost:3001

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en navegador
# http://localhost:3000
```

---

## 📜 Scripts Disponibles

```bash
npm run dev           # Servidor de desarrollo (puerto 3000)
npm run build         # Build de producción
npm run start         # Servidor de producción (requiere build)
npm run lint          # ESLint + Next.js linter
```

---

## 💡 Decisiones de Diseño y Justificaciones

### 1. ¿Por qué App Router sobre Pages Router?

**Pages Router (antiguo):**
- ❌ Solo Client Components
- ❌ getServerSideProps verboso
- ❌ Sin streaming

**App Router (nuevo):**
- ✅ Server Components por defecto
- ✅ Layouts anidados
- ✅ Loading y error boundaries
- ✅ Metadata API
- ✅ Mejor performance

### 2. ¿Por qué Client Components en todas las páginas?

```typescript
'use client'
```

**Razón:** Necesitamos:
- Hooks (useState, useEffect, useForm)
- Event handlers (onClick, onChange)
- Librerías que usan browser APIs (Zustand, Axios)

**Trade-off aceptado:**
- ❌ Sin Server Components benefits
- ✅ Pero: SPA-like UX necesaria para CRUD

### 3. ¿Por qué Tailwind sobre CSS Modules?

**CSS Modules:**
- ❌ Archivos separados
- ❌ Class naming manual
- ❌ No utility-first

**Tailwind:**
- ✅ Todo en JSX
- ✅ Responsive con prefijos (`md:`, `lg:`)
- ✅ Dark mode con `dark:`
- ✅ Purge automático (solo CSS usado)
- ✅ Consistencia de diseño

### 4. ¿Por qué React Hook Form sobre controlled inputs?

**Controlled inputs (useState):**
```typescript
const [name, setName] = useState('');
<input value={name} onChange={(e) => setName(e.target.value)} />
// Re-render en CADA tecla presionada
```

**React Hook Form (uncontrolled):**
```typescript
const { register } = useForm();
<input {...register('name')} />
// Re-render solo en submit o validación
```

**Beneficios:**
- ✅ Mejor performance (menos re-renders)
- ✅ Validación integrada
- ✅ Menos código boilerplate

### 5. ¿Por qué Axios sobre fetch?

**fetch:**
```typescript
const response = await fetch('/api/clients');
if (!response.ok) throw new Error(); // Manual
const data = await response.json(); // Manual
```

**Axios:**
```typescript
const { data } = await api.get('/api/clients');
// Auto-parse JSON, auto-throw en error
```

**Beneficios:**
- ✅ Menos código
- ✅ Interceptors (futuro: auth tokens)
- ✅ Mejor manejo de errores
- ✅ Transformación de datos

### 6. ¿Por qué `unoptimized` en next/image?

```typescript
<Image src={signedUrl} unoptimized />
```

**Razón:**
- URLs pre-firmadas de S3 expiran en 7 días
- Next.js Image Optimization cachea imágenes
- Cache + URL expirada = imagen rota
- `unoptimized` = usar URL directamente

---

## 🎨 Sistema de Diseño

### Paleta de Colores

```typescript
// Personas Naturales
text-blue-600 dark:text-blue-400

// Empresas
text-purple-600 dark:text-purple-400

// Estados
text-green-600  // Éxito
text-red-600    // Error
text-yellow-600 // Warning
text-gray-600   // Neutral
```

### Breakpoints Responsive

```typescript
// Mobile first
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Equivale a:
// < 768px: 1 columna
// 768-1024px: 2 columnas
// > 1024px: 3 columnas
```

### Dark Mode

```typescript
// Automático con clase 'dark'
<div className="bg-white dark:bg-gray-800">
<p className="text-gray-900 dark:text-white">
```

---

## 🧪 Testing (Bonus - No implementado por tiempo)

```typescript
// Ejemplo con React Testing Library
import { render, screen } from '@testing-library/react';

test('renders client list', () => {
  render(<ClientsPage />);
  expect(screen.getByText('Gestión de Clientes')).toBeInTheDocument();
});
```

---

## 📈 Mejoras Futuras

- [ ] Skeleton loaders (mejor UX durante carga)
- [ ] Infinite scroll en listado
- [ ] Drag & drop para subir imágenes
- [ ] Cropper de imágenes antes de subir
- [ ] PWA (offline support)
- [ ] Animations con Framer Motion
- [ ] Tests E2E con Playwright
- [ ] Storybook para componentes
- [ ] Paginación server-side

---

## 📚 Recursos de Aprendizaje

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Zustand](https://docs.pmnd.rs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎯 Características de Accesibilidad

- ✅ ARIA labels en botones e inputs
- ✅ Navegación por teclado
- ✅ Contraste suficiente (WCAG AA)
- ✅ Focus visible en elementos interactivos
- ✅ Mensajes de error descriptivos
- ✅ Alt text en imágenes

---

**Desarrollado con ❤️ priorizando UX, performance y mantenibilidad**
```