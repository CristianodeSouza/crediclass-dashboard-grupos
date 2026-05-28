'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Grupo, GrupoEditFormData } from '@/types';
import HistoricoMensalForm from './HistoricoMensalForm';

interface GrupoEditModalProps {
  grupo: Grupo;
  onClose: () => void;
  onSave: () => void;
}

export default function GrupoEditModal({
  grupo,
  onClose,
  onSave,
}: GrupoEditModalProps) {
  const [formData, setFormData] = useState<GrupoEditFormData>({
    nome: grupo.nome,
    adm: grupo.adm,
    tipo_bem: grupo.tipo_bem,
    prazo_min: grupo.prazo_min,
    prazo_max: grupo.prazo_max,
    historico: grupo.historico || [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'historico'>('info');

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await apiClient.updateGrupo(grupo.id, formData);

      setIsLoading(false);
      onSave();
    } catch (err) {
      setError('Falha ao salvar grupo');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full mx-4 border border-slate-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-slate-100">Editar Grupo</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'info'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:text-slate-100'
            }`}
          >
            Informações
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'historico'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:text-slate-100'
            }`}
          >
            Histórico Mensal
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {error && (
            <div className="bg-red-900 text-red-100 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {activeTab === 'info' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Nome do Grupo
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  className="w-full bg-slate-700 text-slate-100 rounded px-3 py-2 border border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Administradora
                </label>
                <input
                  type="text"
                  value={formData.adm}
                  onChange={(e) =>
                    setFormData({ ...formData, adm: e.target.value })
                  }
                  className="w-full bg-slate-700 text-slate-100 rounded px-3 py-2 border border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Tipo de Bem
                </label>
                <input
                  type="text"
                  value={formData.tipo_bem}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo_bem: e.target.value })
                  }
                  className="w-full bg-slate-700 text-slate-100 rounded px-3 py-2 border border-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Prazo Mínimo (meses)
                  </label>
                  <input
                    type="text"
                    value={formData.prazo_min}
                    onChange={(e) =>
                      setFormData({ ...formData, prazo_min: e.target.value })
                    }
                    className="w-full bg-slate-700 text-slate-100 rounded px-3 py-2 border border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Prazo Máximo (meses)
                  </label>
                  <input
                    type="text"
                    value={formData.prazo_max}
                    onChange={(e) =>
                      setFormData({ ...formData, prazo_max: e.target.value })
                    }
                    className="w-full bg-slate-700 text-slate-100 rounded px-3 py-2 border border-slate-600"
                  />
                </div>
              </div>
            </div>
          ) : (
            <HistoricoMensalForm
              historico={formData.historico}
              onChange={(historico) =>
                setFormData({ ...formData, historico })
              }
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700 bg-slate-700">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-slate-100 py-2 rounded transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white py-2 rounded transition-colors font-medium"
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
