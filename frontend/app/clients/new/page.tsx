'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { ClientType, DocumentType } from '@/types/client';
import { ArrowLeftIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

const createClientSchema = z.object({
  type: z.nativeEnum(ClientType),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().optional(),
  legalName: z.string().optional(),
  email: z.string().email('Debe ser un correo electrónico válido'),
  phone: z.string().regex(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos').optional().or(z.literal('')),
  address: z.string().optional(),
  documentType: z.nativeEnum(DocumentType),
  documentNumber: z.string().regex(/^[0-9]{10,13}$/, 'El documento debe tener entre 10 y 13 dígitos'),
  frontImage: z.any().refine((files) => files?.length > 0, 'La imagen frontal es obligatoria'),
  backImage: z.any().optional(),
}).refine(
  (data) => {
    if (data.type === ClientType.NATURAL_PERSON) {
      return !!data.lastName;
    }
    return true;
  },
  {
    message: 'El apellido es obligatorio para personas naturales',
    path: ['lastName'],
  }
).refine(
  (data) => {
    if (data.type === ClientType.COMPANY) {
      return !!data.legalName;
    }
    return true;
  },
  {
    message: 'El nombre legal es obligatorio para empresas',
    path: ['legalName'],
  }
);

type CreateClientForm = z.infer<typeof createClientSchema>;

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateClientForm>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      type: ClientType.NATURAL_PERSON,
      documentType: DocumentType.CEDULA,
    },
  });

  const clientType = watch('type');

  const onSubmit = async (data: CreateClientForm) => {
    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('name', data.name);
      if (data.lastName) formData.append('lastName', data.lastName);
      if (data.legalName) formData.append('legalName', data.legalName);
      formData.append('email', data.email);
      if (data.phone) formData.append('phone', data.phone);
      if (data.address) formData.append('address', data.address);
      formData.append('documentType', data.documentType);
      formData.append('documentNumber', data.documentNumber);
      
      if (data.frontImage?.[0]) {
        formData.append('frontImage', data.frontImage[0]);
      }
      if (data.backImage?.[0]) {
        formData.append('backImage', data.backImage[0]);
      }

      const response = await api.post('/api/clients', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      router.push(`/clients/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Volver a clientes
      </Link>

      <div className="bg-[var(--card)] rounded-xl border p-6 md:p-8 transition-theme">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Crear Nuevo Cliente
          </h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            Completa la información para registrar un nuevo cliente
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-3">
            <div className="p-1 rounded-full bg-red-500/20">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Tipo de cliente - Cards */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
              Tipo de Cliente <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`
                  relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${clientType === ClientType.NATURAL_PERSON 
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                    : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                  }
                `}
              >
                <input
                  type="radio"
                  {...register('type')}
                  value={ClientType.NATURAL_PERSON}
                  className="sr-only"
                />
                <div className={`p-2 rounded-lg ${clientType === ClientType.NATURAL_PERSON ? 'bg-emerald-500/10' : 'bg-[var(--muted)]'}`}>
                  <UserIcon className={`w-6 h-6 ${clientType === ClientType.NATURAL_PERSON ? 'text-emerald-500' : 'text-[var(--muted-foreground)]'}`} />
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">Persona Natural</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Individuo con cédula</p>
                </div>
                {clientType === ClientType.NATURAL_PERSON && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--primary)]" />
                )}
              </label>
              <label
                className={`
                  relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${clientType === ClientType.COMPANY 
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                    : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                  }
                `}
              >
                <input
                  type="radio"
                  {...register('type')}
                  value={ClientType.COMPANY}
                  className="sr-only"
                />
                <div className={`p-2 rounded-lg ${clientType === ClientType.COMPANY ? 'bg-violet-500/10' : 'bg-[var(--muted)]'}`}>
                  <BuildingOfficeIcon className={`w-6 h-6 ${clientType === ClientType.COMPANY ? 'text-violet-500' : 'text-[var(--muted-foreground)]'}`} />
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">Empresa</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Compañía con RUC</p>
                </div>
                {clientType === ClientType.COMPANY && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--primary)]" />
                )}
              </label>
            </div>
          </div>

          {/* Información básica */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)] pb-2 border-b border-[var(--border)]">
              Información Básica
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  {clientType === ClientType.NATURAL_PERSON ? 'Nombre' : 'Razón Social'} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder={clientType === ClientType.NATURAL_PERSON ? 'Juan' : 'Mi Empresa S.A.'}
                  className="w-full px-4 py-2.5 border border-[var(--input)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Apellido (solo persona natural) */}
              {clientType === ClientType.NATURAL_PERSON && (
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('lastName')}
                    type="text"
                    placeholder="Pérez"
                    className="w-full px-4 py-2.5 border border-[var(--input)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              )}

              {/* Nombre legal (solo empresa) */}
              {clientType === ClientType.COMPANY && (
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Nombre Legal <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('legalName')}
                    type="text"
                    placeholder="Mi Empresa Sociedad Anónima"
                    className="w-full px-4 py-2.5 border border-[var(--input)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                  />
                  {errors.legalName && (
                    <p className="mt-1 text-sm text-red-500">{errors.legalName.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Información de contacto */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)] pb-2 border-b border-[var(--border)]">
              Información de Contacto
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-2.5 border border-[var(--input)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Teléfono
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="0987654321"
                  className="w-full px-4 py-2.5 border border-[var(--input)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Dirección
              </label>
              <textarea
                {...register('address')}
                rows={2}
                placeholder="Calle Principal 123, Ciudad"
                className="w-full px-4 py-2.5 border border-[var(--input)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-none"
              />
            </div>
          </div>

          {/* Documento de identidad */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)] pb-2 border-b border-[var(--border)]">
              Documento de Identidad
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de documento */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Tipo de Documento <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('documentType')}
                  className="w-full px-4 py-2.5 border border-[var(--input)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                >
                  <option value={DocumentType.CEDULA}>Cédula de Identidad</option>
                  <option value={DocumentType.RUC}>RUC</option>
                </select>
              </div>

              {/* Número de documento */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Número de Documento <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('documentNumber')}
                  type="text"
                  placeholder="1234567890"
                  className="w-full px-4 py-2.5 border border-[var(--input)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                />
                {errors.documentNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.documentNumber.message}</p>
                )}
              </div>
            </div>

            {/* Imágenes del documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <ImageUpload
                label="Imagen Frontal del Documento"
                required
                onChange={(files) => setValue('frontImage', files)}
                error={errors.frontImage?.message as string}
              />
              <ImageUpload
                label="Imagen Posterior (opcional)"
                onChange={(files) => setValue('backImage', files)}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Link
              href="/clients"
              className="flex-1 sm:flex-none px-6 py-3 border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--accent)] text-center font-medium transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 rounded-lg font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Cliente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
