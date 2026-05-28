'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Grupo } from '@/types';

export default function Gerenciador() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const response = await apiClient.getGruposGerenciador({
          limit: 50,
          offset: 0,
        });
        setGrupos(response.data.grupos || []);
        setIsLoading(false);
      } catch (err) {
        setError('Falha ao carregar grupos');
        setIsLoading(false);
      }
    };

    fetchGrupos();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-slate-400">Carregando grupos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900 text-red-100 p-4 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-100">
          Gerenciador de Grupos
        </h2>
        <p className="text-blue-200 text-sm mt-1">
          Gerencie e edite os grupos financeiros com filtros avançados e busca
        </p>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-100">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-100">
                Administradora
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-100">
                Tipo de Bem
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-100">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-100">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((grupo) => (
              <tr key={grupo.id} className="border-t border-slate-700 hover:bg-slate-700">
                <td className="px-6 py-4 text-slate-100">{grupo.nome}</td>
                <td className="px-6 py-4 text-slate-300">{grupo.adm}</td>
                <td className="px-6 py-4 text-slate-300">{grupo.tipo_bem}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      grupo.status === 'ativo'
                        ? 'bg-green-900 text-green-100'
                        : 'bg-yellow-900 text-yellow-100'
                    }`}
                  >
                    {grupo.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
