'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Client, ClientType } from '@/types/client';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  BuildingOfficeIcon,
  FunnelIcon,
  UsersIcon,
  DocumentTextIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

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

  const stats = {
    total: clients.length,
    natural: clients.filter(c => c.type === ClientType.NATURAL_PERSON).length,
    company: clients.filter(c => c.type === ClientType.COMPANY).length,
    documents: clients.reduce((acc, c) => acc + c.documents.length, 0),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Gestión de Clientes
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Administra la información de tus clientes y sus documentos de identificación
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] rounded-xl border p-4 transition-theme">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <UsersIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{stats.total}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Total Clientes</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-xl border p-4 transition-theme">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <UserIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{stats.natural}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Personas</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-xl border p-4 transition-theme">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <BuildingOfficeIcon className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{stats.company}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Empresas</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-xl border p-4 transition-theme">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <DocumentTextIcon className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{stats.documents}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Documentos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card)] rounded-xl border p-4 transition-theme">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[var(--input)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ClientType | '')}
              className="pl-10 pr-8 py-2.5 border border-[var(--input)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="">Todos los tipos</option>
              <option value={ClientType.NATURAL_PERSON}>Persona Natural</option>
              <option value={ClientType.COMPANY}>Empresa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Client List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--muted)] border-t-[var(--primary)] animate-spin" />
          </div>
          <p className="mt-4 text-[var(--muted-foreground)]">Cargando clientes...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-[var(--card)] rounded-xl border p-12 text-center transition-theme">
          <div className="mx-auto w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
            <UsersIcon className="w-8 h-8 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            No se encontraron clientes
          </h3>
          <p className="text-[var(--muted-foreground)] mb-6">
            {search || typeFilter ? 'Intenta con otros filtros de búsqueda' : 'Comienza agregando tu primer cliente'}
          </p>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all"
          >
            Crear primer cliente
          </Link>
        </div>
      ) : (
        <div className="bg-[var(--card)] rounded-xl border overflow-hidden transition-theme">
          <div className="divide-y divide-[var(--border)]">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center justify-between p-4 hover:bg-[var(--accent)] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    client.type === ClientType.NATURAL_PERSON 
                      ? 'bg-emerald-500/10' 
                      : 'bg-violet-500/10'
                  }`}>
                    {client.type === ClientType.NATURAL_PERSON ? (
                      <UserIcon className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <BuildingOfficeIcon className="w-6 h-6 text-violet-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                      {client.type === ClientType.NATURAL_PERSON
                        ? `${client.name} ${client.lastName}`
                        : client.legalName}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {client.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      client.type === ClientType.NATURAL_PERSON
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                    }`}>
                      {client.type === ClientType.NATURAL_PERSON ? 'Persona' : 'Empresa'}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2.5 py-1 rounded-full">
                      {client.documents.length} doc{client.documents.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
