## README Frontend - Versión Final y Concisa

### `frontend/README.md`

```markdown
# Frontend - Sistema de Gestión de Clientes

Aplicación web moderna desarrollada con Next.js 15 y TypeScript para la gestión integral de clientes ecuatorianos.

---

## 🛠️ Tecnologías

- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework utility-first
- **React Hook Form** - Gestión eficiente de formularios
- **Zod** - Validación de schemas
- **Zustand** - Estado global con persistencia
- **Axios** - Cliente HTTP
- **Heroicons** - Iconografía

---

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Copiar .env.example a .env.local

# 3. Iniciar servidor
npm run dev
```

**Aplicación:** http://localhost:3000

---

## 📂 Estructura del Proyecto

```
frontend/
├── app/                           # App Router (Next.js 15)
│   ├── layout.tsx                # Layout global con navbar
│   ├── page.tsx                  # Redirect a /clients
│   │
│   └── clients/                  # Rutas de clientes
│       ├── page.tsx              # Listado con búsqueda
│       ├── new/
│       │   └── page.tsx          # Crear cliente
│       └── [id]/
│           ├── page.tsx          # Detalle
│           └── edit/
│               └── page.tsx      # Editar
│
├── components/                    # Componentes reutilizables
│   ├── ThemeProvider.tsx         # Provider de tema
│   └── ThemeToggle.tsx           # Toggle dark/light
│
├── lib/
│   └── api.ts                    # Cliente Axios configurado
│
├── store/
│   └── theme.ts                  # Zustand store (tema)
│
├── types/
│   └── client.ts                 # Interfaces TypeScript
│
└── .env.local                    # Variables de entorno
```

---

## 🎨 Funcionalidades

### Gestión de Clientes
- ✅ Crear cliente con documentos (drag & drop)
- ✅ Listar clientes con grid responsive
- ✅ Ver detalle completo con documentos
- ✅ Editar información del cliente
- ✅ Eliminar con confirmación
- ✅ Búsqueda en tiempo real
- ✅ Filtros por tipo (Persona Natural/Empresa)

### UX/UI
- ✅ Tema claro/oscuro persistente
- ✅ Diseño responsive mobile-first
- ✅ Validación en tiempo real
- ✅ Mensajes de error descriptivos
- ✅ Estados de carga
- ✅ Optimización de imágenes
- ✅ Psicología de colores (azul/morado)

---

## 🔄 Flujo de Datos

### Crear Cliente
```typescript
// 1. Usuario llena formulario
<form onSubmit={handleSubmit(onSubmit)}>

// 2. Zod valida schema
const schema = z.object({
  email: z.string().email(),
  // ...
});

// 3. React Hook Form maneja envío
const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema)
});

// 4. Axios hace POST
const response = await api.post('/api/clients', formData);

// 5. Redirect a detalle
router.push(`/clients/${response.data.id}`);
```

### Búsqueda en Tiempo Real
```typescript
const [search, setSearch] = useState('');

useEffect(() => {
  fetchClients(); // Re-ejecuta al cambiar search
}, [search]);

<input onChange={(e) => setSearch(e.target.value)} />
```

---

## 🧩 Componentes Principales

### Layout (`app/layout.tsx`)
- Estructura HTML raíz
- Navbar global persistente
- ThemeProvider wrapper
- Fuentes (Inter de Google)

### ThemeProvider (`components/ThemeProvider.tsx`)
- Sincroniza tema con DOM
- Evita flash de tema incorrecto
- Maneja hydration con `mounted` check

### Listado (`app/clients/page.tsx`)
**Estados:**
- `clients[]` - Lista de clientes
- `loading` - Estado de carga
- `search` - Texto de búsqueda
- `typeFilter` - Filtro por tipo

**Features:**
- Grid responsive (1-3 columnas)
- Cards con preview de datos
- Empty states
- Loading states

### Formulario Crear (`app/clients/new/page.tsx`)
**Validaciones:**
- Campos condicionales según tipo
- Upload de archivos (drag & drop)
- Mensajes de error en español
- Loading durante creación

**Validación condicional Zod:**
```typescript
.refine(
  (data) => {
    if (data.type === 'NATURAL_PERSON') {
      return !!data.lastName;
    }
    return true;
  },
  { message: 'Apellido obligatorio', path: ['lastName'] }
)
```

### Detalle (`app/clients/[id]/page.tsx`)
- Carga con `useParams()` para ID dinámico
- Vista previa de documentos
- Botones de acción (Editar/Eliminar)
- Confirmación antes de eliminar

### Editar (`app/clients/[id]/edit/page.tsx`)
- Prellenado de formulario con `reset()`
- Validación igual que creación
- PATCH al backend
- Nota: documentos no editables por seguridad

---

## 💾 Gestión de Estado (Zustand)

```typescript
// store/theme.ts
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        }))
    }),
    { name: 'theme-storage' } // localStorage key
  )
);

// Uso en componente
const { theme, toggleTheme } = useThemeStore();
```

**Ventajas sobre Context:**
- Solo componentes que usan el estado re-renderizan
- API minimalista
- Persistencia integrada
- No requiere Provider

---

## ✅ Validación de Formularios

### Schema Zod
```typescript
const createClientSchema = z.object({
  type: z.nativeEnum(ClientType),
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string()
    .regex(/^[0-9]{10}$/, 'Teléfono debe tener 10 dígitos')
    .optional()
    .or(z.literal('')),
  documentNumber: z.string()
    .regex(/^[0-9]{10,13}$/, 'Entre 10 y 13 dígitos'),
  frontImage: z.any()
    .refine((files) => files?.length > 0, 'Imagen obligatoria')
});

// Type inference automático
type CreateClientForm = z.infer<typeof createClientSchema>;
```

### React Hook Form
```typescript
const { register, handleSubmit, formState: { errors } } = useForm<CreateClientForm>({
  resolver: zodResolver(createClientSchema)
});

// En JSX
<input {...register('name')} />
{errors.name && <p>{errors.name.message}</p>}
```

---

## 🎨 Sistema de Diseño

### Paleta de Colores
```css
/* Personas Naturales */
text-blue-600 dark:text-blue-400

/* Empresas */
text-purple-600 dark:text-purple-400

/* Estados */
text-green-600  /* Éxito */
text-red-600    /* Error */
text-gray-600   /* Neutral */
```

### Responsive Breakpoints
```typescript
// Mobile first
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

/* 
  < 768px:  1 columna
  768-1024: 2 columnas
  > 1024:   3 columnas
*/
```

### Dark Mode
```typescript
// Automático con clase 'dark'
<div className="bg-white dark:bg-gray-800">
<p className="text-gray-900 dark:text-white">
```

---

## 📜 Scripts

```bash
npm run dev       # Desarrollo (puerto 3000)
npm run build     # Build de producción
npm run start     # Servidor de producción
npm run lint      # ESLint
```

---

## 🔧 Variables de Entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Ver `.env.example` para plantilla.

---

## 💡 Decisiones Técnicas

### App Router vs Pages Router
**App Router (elegido):**
- Server Components por defecto
- Layouts anidados
- Loading UI integrada
- Mejor performance

### Client Components
Todas las páginas usan `'use client'` porque requieren:
- Hooks (useState, useEffect)
- Event handlers
- Librerías browser (Zustand, Axios)

### Tailwind vs CSS Modules
**Tailwind (elegido):**
- Todo en JSX
- Responsive con prefijos
- Dark mode con `dark:`
- Purge automático
- Consistencia

### React Hook Form vs Controlled
**React Hook Form (elegido):**
- Menos re-renders (uncontrolled)
- Validación integrada
- Mejor performance
- Menos boilerplate

### Axios vs fetch
**Axios (elegido):**
- Auto-parse JSON
- Auto-throw en error
- Interceptors (futuro: auth)
- Menos código

### next/image con unoptimized
```typescript
<Image src={signedUrl} unoptimized />
```
**Razón:** URLs pre-firmadas de S3 expiran. Next.js cache + URL expirada = imagen rota.

---

## 🎯 Features Implementadas

- ✅ CRUD completo de clientes
- ✅ Búsqueda en tiempo real
- ✅ Filtros por tipo
- ✅ Drag & drop archivos
- ✅ Vista previa de imágenes
- ✅ Tema claro/oscuro
- ✅ Validación en tiempo real
- ✅ Diseño responsive
- ✅ Manejo de errores
- ✅ Estados de carga
- ✅ Confirmaciones
- ✅ TypeScript end-to-end

---

## ♿ Accesibilidad

- ✅ ARIA labels en controles
- ✅ Navegación por teclado
- ✅ Contraste WCAG AA
- ✅ Focus visible
- ✅ Mensajes descriptivos
- ✅ Alt text en imágenes

---

## 📊 Optimizaciones

- **Client Components** solo donde es necesario
- **Lazy loading** implícito de Next.js
- **next/image** para optimización
- **Tree-shaking** de Tailwind
- **Persistencia** de preferencias
- **Debounce** implícito en búsqueda

---

## 🔄 Integración con Backend

```typescript
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Uso
const response = await api.get('/api/clients');
const data = response.data;
```

**CORS:** Habilitado en backend para localhost:3000

---

**Desarrollado priorizando UX, performance y mantenibilidad**
```

