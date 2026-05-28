'use client';

import { useState } from 'react';
import { Grupo } from '@/types';
import GrupoEditModal from './GrupoEditModal';

interface GrupoCardProps {
  grupo: Grupo;
  onRefresh: () => void;
}

export default function GrupoCard({ grupo, onRefresh }: GrupoCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const ultimoHistorico = grupo.historico?.[grupo.historico.length - 1];
  const statusColor =
    grupo.status === 'ativo'
      ? 'bg-green-900 text-green-100'
      : 'bg-yellow-900 text-yellow-100';

  return (
    <>
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-blue-500 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-slate-100 text-lg">{grupo.nome}</h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
            {grupo.status}
          </span>
        </div>

        <div className="space-y-2 text-sm text-slate-400 mb-4">
          <div className="flex justify-between">
            <span>Administradora:</span>
            <span className="text-slate-200">{grupo.adm}</span>
          </div>
          <div className="flex justify-between">
            <span>Tipo de Bem:</span>
            <span className="text-slate-200">{grupo.tipo_bem}</span>
          </div>
          <div className="flex justify-between">
            <span>Prazo:</span>
            <span className="text-slate-200">
              {grupo.prazo_min} a {grupo.prazo_max} meses
            </span>
          </div>
          {ultimoHistorico && (
            <>
              <div className="flex justify-between pt-2 border-t border-slate-700">
                <span>Saldo:</span>
                <span className="text-green-400 font-medium">
                  R$ {ultimoHistorico.saldo.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Juros:</span>
                <span className="text-slate-200">
                  R$ {ultimoHistorico.juros.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-700">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded transition-colors text-sm font-medium"
          >
            Editar
          </button>
          <button
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded transition-colors text-sm font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Copiando...' : 'Duplicar'}
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <GrupoEditModal
          grupo={grupo}
          onClose={() => setIsEditModalOpen(false)}
          onSave={() => {
            setIsEditModalOpen(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
