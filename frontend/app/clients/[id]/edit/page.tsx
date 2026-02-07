'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Client, ClientType } from '@/types/client';
import { ArrowLeftIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const updateClientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().optional(),
  legalName: z.string().optional(),
  email: z.string().email('Debe ser un correo electrónico válido'),
  phone: z.string().regex(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos').optional().or(z.literal('')),
  address: z.string().optional(),
});

type UpdateClientForm = z.infer<typeof updateClientSchema>;

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateClientForm>({
    resolver: zodResolver(updateClientSchema),
  });

  useEffect(() => {
    if (params.id) {
      fetchClient();
    }
  }, [params.id]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/clients/${params.id}`);
      setClient(response.data);
      
      reset({
        name: response.data.name,
        lastName: response.data.lastName || '',
        legalName: response.data.legalName || '',
        email: response.data.email,
        phone: response.data.phone || '',
        address: response.data.address || '',
      });
    } catch (error) {
      console.error('Error fetching client:', error);
      router.push('/clients');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateClientForm) => {
    try {
      setSaving(true);
      setError('');

      await api.patch(`/api/clients/${params.id}`, data);
      router.push(`/clients/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el cliente');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--muted)] border-t-[var(--primary)] animate-spin" />
        <p className="mt-4 text-[var(--muted-foreground)]">Cargando cliente...</p>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/clients/${params.id}`}
        className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Volver al detalle
      </Link>

      <div className="bg-[var(--card)] rounded-xl border p-6 md:p-8 transition-theme">
        {/* Header con info del cliente */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--border)]">
          <div className={`p-3 rounded-xl ${client.type === ClientType.NATURAL_PERSON ? 'bg-emerald-500/10' : 'bg-violet-500/10'}`}>
            {client.type === ClientType.NATURAL_PERSON ? (
              <UserIcon className="w-8 h-8 text-emerald-500" />
            ) : (
              <BuildingOfficeIcon className="w-8 h-8 text-violet-500" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Editar Cliente
            </h1>
            <p className="text-[var(--muted-foreground)]">
              {client.type === ClientType.NATURAL_PERSON ? 'Persona Natural' : 'Empresa'}
            </p>
          </div>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)] pb-2 border-b border-[var(--border)]">
              Información Básica
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  {client.type === ClientType.NATURAL_PERSON ? 'Nombre' : 'Razón Social'} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-4 py-2.5 border border-[var(--input)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Apellido (solo persona natural) */}
              {client.type === ClientType.NATURAL_PERSON && (
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Apellido
                  </label>
                  <input
                    {...register('lastName')}
                    type="text"
                    className="w-full px-4 py-2.5 border border-[var(--input)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              )}

              {/* Nombre legal (solo empresa) */}
              {client.type === ClientType.COMPANY && (
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Nombre Legal
                  </label>
                  <input
                    {...register('legalName')}
                    type="text"
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

          {/* Nota sobre documentos */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
            <div className="p-1 rounded-full bg-blue-500/20 mt-0.5">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Los documentos de identificación no se pueden editar por seguridad. Si necesitas cambiarlos, crea un nuevo cliente.
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Link
              href={`/clients/${params.id}`}
              className="flex-1 sm:flex-none px-6 py-3 border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--accent)] text-center font-medium transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 rounded-lg font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
