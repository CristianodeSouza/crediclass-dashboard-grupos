'use client';

import { useState } from 'react';
import { apiClient, getErrorMessage } from '@/lib/api';

export default function Importacao() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);

    try {
      const response = await apiClient.previewImport(selectedFile);
      setPreview(response.data);
    } catch (err) {
      console.error('Erro ao fazer preview:', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setIsLoading(true);

    try {
      await apiClient.processImport(file);
      setFile(null);
      setPreview(null);
      alert('Importação realizada com sucesso!');
    } catch (err) {
      alert(`Erro ao processar importação: ${getErrorMessage(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-100">Importação</h2>
        <p className="text-blue-200 text-sm mt-1">
          Importe dados em lote a partir de arquivos CSV ou Excel
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-lg border border-slate-700 border-dashed p-8">
          <div className="text-center">
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".csv,.xlsx,.xls"
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer inline-block"
            >
              <div className="text-4xl mb-2">📁</div>
              <p className="text-slate-300 font-medium">
                {file?.name || 'Clique para selecionar arquivo'}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Formatos suportados: CSV, Excel
              </p>
            </label>
          </div>

          {preview && (
            <div className="mt-6 border-t border-slate-700 pt-6">
              <h3 className="font-semibold text-slate-100 mb-4">Preview</h3>
              <div className="text-sm text-slate-300 space-y-2">
                <p>Total de registros: {preview.total_registros}</p>
                <p>Colunas: {preview.colunas_detectadas?.join(', ')}</p>
                {preview.validacao && (
                  <>
                    <p className="text-green-400">
                      Válidos: {preview.validacao.validos}
                    </p>
                    {preview.validacao.invalidos > 0 && (
                      <p className="text-yellow-400">
                        Inválidos: {preview.validacao.invalidos}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {file && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-700">
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white py-2 rounded"
              >
                {isLoading ? 'Importando...' : 'Importar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
