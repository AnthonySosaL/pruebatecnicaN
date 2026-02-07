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
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando cliente...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Cliente no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Volver a clientes
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {client.type === ClientType.NATURAL_PERSON ? (
              <UserIcon className="w-16 h-16 text-blue-600 dark:text-blue-400" />
            ) : (
              <BuildingOfficeIcon className="w-16 h-16 text-purple-600 dark:text-purple-400" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {client.type === ClientType.NATURAL_PERSON
                  ? `${client.name} ${client.lastName}`
                  : client.legalName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {client.type === ClientType.NATURAL_PERSON ? 'Persona Natural' : 'Empresa'}
              </p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Información de Contacto
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Correo Electrónico</p>
              <p className="text-gray-900 dark:text-white">{client.email}</p>
            </div>
          </div>

          {client.phone && (
            <div className="flex items-center gap-3">
              <PhoneIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                <p className="text-gray-900 dark:text-white">{client.phone}</p>
              </div>
            </div>
          )}

          {client.address && (
            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                <p className="text-gray-900 dark:text-white">{client.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Documentos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Documentos de Identificación
        </h2>
        <div className="space-y-6">
          {client.documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {doc.type === 'CEDULA' ? 'Cédula de Identidad' : 'RUC'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Número: {doc.documentNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Imagen frontal */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Imagen Frontal
                  </p>
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
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
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Imagen Posterior
                    </p>
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
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

              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
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
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
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
