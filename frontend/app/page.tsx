'use client';

import { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import { apiClient, getErrorMessage } from '@/lib/api';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to load stats to verify backend is available
        // If stats fails, still allow access to the dashboard
        try {
          await apiClient.getStats();
        } catch (statsErr) {
          console.warn('Stats endpoint unavailable:', getErrorMessage(statsErr));
        }
        // Dashboard can load regardless
        setIsLoading(false);
      } catch (err) {
        // Only show error if we have a critical failure
        setError(`Falha ao conectar com o servidor: ${getErrorMessage(err)}`);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <p className="text-slate-400 text-sm">Verifique sua conexão com o servidor</p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
