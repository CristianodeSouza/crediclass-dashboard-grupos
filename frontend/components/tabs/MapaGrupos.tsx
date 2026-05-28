'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Grupo } from '@/types';
import GrupoCard from '../GrupoCard';

export default function MapaGrupos() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroAdm, setFiltroAdm] = useState<string>('');
  const [filtroBem, setFiltroBem] = useState<string>('');

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const response = await apiClient.getGrupos();
        setGrupos(response.data.grupos || []);
        setIsLoading(false);
      } catch (err) {
        setError('Falha ao carregar grupos');
        setIsLoading(false);
      }
    };

    fetchGrupos();
  }, []);

  const gruposFiltrados = grupos.filter((grupo) => {
    if (filtroAdm && grupo.adm !== filtroAdm) return false;
    if (filtroBem && grupo.tipo_bem !== filtroBem) return false;
    return true;
  });

  const adms = [...new Set(grupos.map((g) => g.adm))];
  const bens = [...new Set(grupos.map((g) => g.tipo_bem))];

  return (
    <div className="p-6 space-y-6">
      {/* Filtros */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">Filtros</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Administradora
            </label>
            <select
              value={filtroAdm}
              onChange={(e) => setFiltroAdm(e.target.value)}
              className="w-full bg-slate-700 text-slate-100 rounded px-3 py-2 border border-slate-600"
            >
              <option value="">Todas</option>
              {adms.map((adm) => (
                <option key={adm} value={adm}>
                  {adm}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Tipo de Bem
            </label>
            <select
              value={filtroBem}
              onChange={(e) => setFiltroBem(e.target.value)}
              className="w-full bg-slate-700 text-slate-100 rounded px-3 py-2 border border-slate-600"
            >
              <option value="">Todas</option>
              {bens.map((bem) => (
                <option key={bem} value={bem}>
                  {bem}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          Mostrando {gruposFiltrados.length} de {grupos.length} grupos
        </div>
      </div>

      {/* Grid de Grupos */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-slate-400">Carregando grupos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-900 text-red-100 p-4 rounded">{error}</div>
      ) : gruposFiltrados.length === 0 ? (
        <div className="text-center text-slate-400 py-12">
          Nenhum grupo encontrado
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gruposFiltrados.map((grupo) => (
            <GrupoCard key={grupo.id} grupo={grupo} onRefresh={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
