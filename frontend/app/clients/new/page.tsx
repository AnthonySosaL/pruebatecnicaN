'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { ClientType, DocumentType } from '@/types/client';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

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
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Volver a clientes
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Crear Nuevo Cliente
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Cliente *
            </label>
            <select
              {...register('type')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value={ClientType.NATURAL_PERSON}>Persona Natural</option>
              <option value={ClientType.COMPANY}>Empresa</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {clientType === ClientType.NATURAL_PERSON ? 'Nombre *' : 'Razón Social *'}
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Apellido (solo persona natural) */}
          {clientType === ClientType.NATURAL_PERSON && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Apellido *
              </label>
              <input
                {...register('lastName')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName.message}</p>
              )}
            </div>
          )}

          {/* Nombre legal (solo empresa) */}
          {clientType === ClientType.COMPANY && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre Legal *
              </label>
              <input
                {...register('legalName')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              {errors.legalName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.legalName.message}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correo Electrónico *
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono
            </label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="0987654321"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dirección
            </label>
            <textarea
              {...register('address')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tipo de documento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Documento *
            </label>
            <select
              {...register('documentType')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value={DocumentType.CEDULA}>Cédula</option>
              <option value={DocumentType.RUC}>RUC</option>
            </select>
          </div>

          {/* Número de documento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de Documento *
            </label>
            <input
              {...register('documentNumber')}
              type="text"
              placeholder="1234567890"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            {errors.documentNumber && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.documentNumber.message}</p>
            )}
          </div>

          {/* Imagen frontal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Imagen Frontal del Documento *
            </label>
            <input
              {...register('frontImage')}
              type="file"
              accept="image/*"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            {errors.frontImage && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.frontImage.message as string}</p>
            )}
          </div>

          {/* Imagen posterior */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Imagen Posterior del Documento (opcional)
            </label>
            <input
              {...register('backImage')}
              type="file"
              accept="image/*"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Cliente'}
            </button>
            <Link
              href="/clients"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
