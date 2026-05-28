'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Stats, DashboardTab } from '@/types';
import Layout from './Layout';
import MapaGrupos from './tabs/MapaGrupos';
import Gerenciador from './tabs/Gerenciador';
import Calculadora from './tabs/Calculadora';
import Importacao from './tabs/Importacao';
import Analytics from './tabs/Analytics';
import PipeRun from './tabs/PipeRun';

const TABS: DashboardTab[] = [
  { id: 'mapa', label: 'Mapa de Grupos', icon: '🗺️' },
  { id: 'gerenciador', label: 'Gerenciador', icon: '⚙️' },
  { id: 'calculadora', label: 'Calculadora', icon: '🧮' },
  { id: 'importacao', label: 'Importação', icon: '📥' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'piperun', label: 'PipeRun', icon: '🔗' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab['id']>('mapa');
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.getStats();
        setStats(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Falha ao carregar estatísticas');
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mapa':
        return <MapaGrupos />;
      case 'gerenciador':
        return <Gerenciador />;
      case 'calculadora':
        return <Calculadora />;
      case 'importacao':
        return <Importacao />;
      case 'analytics':
        return <Analytics stats={stats} />;
      case 'piperun':
        return <PipeRun />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <Layout stats={stats} isLoading={isLoading} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Navigation */}
        <div className="bg-slate-900 border-b border-slate-700 px-6">
          <nav className="flex gap-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Carregando dashboard...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-400">{error}</div>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
}
