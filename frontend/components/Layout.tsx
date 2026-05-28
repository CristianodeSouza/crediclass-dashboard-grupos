'use client';

import { Stats } from '@/types';

interface LayoutProps {
  stats: Stats | null;
  isLoading: boolean;
}

export default function Layout({ stats, isLoading }: LayoutProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">
            {process.env.NEXT_PUBLIC_APP_NAME || 'Crediclass'}
          </h1>
          <p className="text-slate-400 text-sm">Dashboard de Grupos Financeiros</p>
        </div>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth');
              window.location.href = '/login';
            }
          }}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
        >
          Sair
        </button>
      </div>

      {!isLoading && stats && (
        <div className="grid grid-cols-5 gap-4">
          <StatCard
            label="Total de Grupos"
            value={stats.total_grupos}
            color="bg-blue-900"
          />
          <StatCard
            label="Ativos"
            value={stats.grupos_ativos}
            color="bg-green-900"
          />
          <StatCard
            label="Inativos"
            value={stats.grupos_inativos}
            color="bg-yellow-900"
          />
          <StatCard
            label="Administradoras"
            value={stats.administradoras}
            color="bg-purple-900"
          />
          <StatCard
            label="Valor Total"
            value={`R$ ${(stats.valor_total / 1000).toFixed(1)}k`}
            color="bg-indigo-900"
          />
        </div>
      )}
    </header>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className={`${color} rounded-lg p-4`}>
      <p className="text-slate-300 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">
        {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
      </p>
    </div>
  );
}
