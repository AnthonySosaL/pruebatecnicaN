'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Client, ClientType } from '@/types/client';
import {
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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
    } catch (error) {
      console.error('Error fetching client:', error);
      router.push('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/api/clients/${params.id}`);
      router.push('/clients');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error al eliminar el cliente');
    } finally {
      setDeleting(false);
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
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-[var(--muted-foreground)]">Cliente no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Volver a clientes
      </Link>

      {/* Header */}
      <div className="bg-[var(--card)] rounded-xl border p-6 mb-6 transition-theme">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${client.type === ClientType.NATURAL_PERSON ? 'bg-emerald-500/10' : 'bg-violet-500/10'}`}>
              {client.type === ClientType.NATURAL_PERSON ? (
                <UserIcon className="w-12 h-12 text-emerald-500" />
              ) : (
                <BuildingOfficeIcon className="w-12 h-12 text-violet-500" />
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                {client.type === ClientType.NATURAL_PERSON
                  ? `${client.name} ${client.lastName}`
                  : client.legalName}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-1 mt-2 rounded-full text-xs font-medium ${
                client.type === ClientType.NATURAL_PERSON
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
              }`}>
                {client.type === ClientType.NATURAL_PERSON ? 'Persona Natural' : 'Empresa'}
              </span>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex gap-3">
            <Link
              href={`/clients/${params.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
            >
              <PencilIcon className="w-5 h-5" />
              Editar
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg transition-all disabled:opacity-50"
            >
              <TrashIcon className="w-5 h-5" />
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="bg-[var(--card)] rounded-xl border p-6 mb-6 transition-theme">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 pb-2 border-b border-[var(--border)]">
          Información de Contacto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--muted)]/50">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <EnvelopeIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Correo Electrónico</p>
              <p className="text-[var(--foreground)] font-medium">{client.email}</p>
            </div>
          </div>

          {client.phone && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--muted)]/50">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <PhoneIcon className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Teléfono</p>
                <p className="text-[var(--foreground)] font-medium">{client.phone}</p>
              </div>
            </div>
          )}

          {client.address && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--muted)]/50 md:col-span-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <MapPinIcon className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Dirección</p>
                <p className="text-[var(--foreground)] font-medium">{client.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Documentos */}
      <div className="bg-[var(--card)] rounded-xl border p-6 transition-theme">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 pb-2 border-b border-[var(--border)]">
          Documentos de Identificación
        </h2>
        <div className="space-y-6">
          {client.documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-[var(--border)] rounded-xl p-4 bg-[var(--muted)]/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <DocumentTextIcon className="w-6 h-6 text-violet-500" />
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {doc.type === 'CEDULA' ? 'Cédula de Identidad' : 'RUC'}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Número: {doc.documentNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Imagen frontal */}
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)] mb-2">
                    Imagen Frontal
                  </p>
                  <div className="relative aspect-video bg-[var(--muted)] rounded-lg overflow-hidden">
                    <Image
                      src={doc.frontImageUrl}
                      alt="Documento frontal"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Imagen posterior */}
                {doc.backImageUrl && (
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)] mb-2">
                      Imagen Posterior
                    </p>
                    <div className="relative aspect-video bg-[var(--muted)] rounded-lg overflow-hidden">
                      <Image
                        src={doc.backImageUrl}
                        alt="Documento posterior"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs text-[var(--muted-foreground)]">
                Subido el {new Date(doc.uploadedAt).toLocaleDateString('es-EC', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Metadatos */}
      <div className="mt-6 text-sm text-[var(--muted-foreground)] text-center">
        Cliente registrado el{' '}
        {new Date(client.createdAt).toLocaleDateString('es-EC', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        {client.createdAt !== client.updatedAt && (
          <>
            {' '}
            · Última actualización el{' '}
            {new Date(client.updatedAt).toLocaleDateString('es-EC', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </>
        )}
      </div>
    </div>
  );
}
