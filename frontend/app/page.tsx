'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Client, ClientType } from '@/types/client';
import { MagnifyingGlassIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ClientType | ''>('');

  useEffect(() => {
    fetchClients();
  }, [search, typeFilter]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);

      const response = await api.get(`/api/clients?${params.toString()}`);
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestión de Clientes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra la información de tus clientes y sus documentos
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ClientType | '')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          <option value={ClientType.NATURAL_PERSON}>Persona Natural</option>
          <option value={ClientType.COMPANY}>Empresa</option>
        </select>
      </div>

      {/* Lista de clientes */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando clientes...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">No se encontraron clientes</p>
          <Link
            href="/clients/new"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Crear primer cliente
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {client.type === ClientType.NATURAL_PERSON ? (
                    <UserIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <BuildingOfficeIcon className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {client.type === ClientType.NATURAL_PERSON
                        ? `${client.name} ${client.lastName}`
                        : client.legalName}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {client.type === ClientType.NATURAL_PERSON ? 'Persona Natural' : 'Empresa'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span className="truncate">{client.email}</span>
                </p>
                {client.phone && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Teléfono:</span> {client.phone}
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Documentos:</span> {client.documents.length}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Registrado: {new Date(client.createdAt).toLocaleDateString('es-EC')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
