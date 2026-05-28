'use client';

import { Stats } from '@/types';

interface AnalyticsProps {
  stats: Stats | null;
}

export default function Analytics({ stats }: AnalyticsProps) {
  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-400">
          Carregando dados...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-100">Analytics</h2>
        <p className="text-blue-200 text-sm mt-1">
          Visualize métricas e tendências do seu portfólio
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total de Grupos"
          value={stats.total_grupos}
          subtitle="Grupos cadastrados"
          color="blue"
        />
        <MetricCard
          title="Taxa de Atividade"
          value={`${((stats.grupos_ativos / stats.total_grupos) * 100).toFixed(1)}%`}
          subtitle={`${stats.grupos_ativos} ativos`}
          color="green"
        />
        <MetricCard
          title="Saldo Médio"
          value={`R$ ${(stats.saldo_medio / 1000).toFixed(1)}k`}
          subtitle="Por grupo"
          color="purple"
        />
        <MetricCard
          title="Valor Total"
          value={`R$ ${(stats.valor_total / 1000000).toFixed(2)}M`}
          subtitle="Portfólio"
          color="indigo"
        />
        <MetricCard
          title="Administradoras"
          value={stats.administradoras}
          subtitle="Parceiros"
          color="yellow"
        />
        <MetricCard
          title="Grupos Inativos"
          value={stats.grupos_inativos}
          subtitle="Precisam de ação"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Distribuição por Status
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Ativos</span>
                <span className="text-green-400 font-medium">
                  {stats.grupos_ativos}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${(stats.grupos_ativos / stats.total_grupos) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Inativos</span>
                <span className="text-yellow-400 font-medium">
                  {stats.grupos_inativos}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{
                    width: `${(stats.grupos_inativos / stats.total_grupos) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Resumo Financeiro
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Valor Total:</span>
              <span className="text-slate-100 font-medium">
                R$ {stats.valor_total.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Saldo Médio por Grupo:</span>
              <span className="text-slate-100 font-medium">
                R$ {stats.saldo_medio.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Quantidade de Grupos:</span>
              <span className="text-slate-100 font-medium">
                {stats.total_grupos}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-900 text-blue-100',
    green: 'bg-green-900 text-green-100',
    purple: 'bg-purple-900 text-purple-100',
    indigo: 'bg-indigo-900 text-indigo-100',
    yellow: 'bg-yellow-900 text-yellow-100',
    orange: 'bg-orange-900 text-orange-100',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 border border-current border-opacity-30`}>
      <p className="text-sm opacity-75">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs opacity-70 mt-1">{subtitle}</p>
    </div>
  );
}
