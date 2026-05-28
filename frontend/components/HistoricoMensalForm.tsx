'use client';

import { HistoricoMensal } from '@/types';

interface HistoricoMensalFormProps {
  historico: HistoricoMensal[];
  onChange: (historico: HistoricoMensal[]) => void;
}

const MESES = [
  'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
  'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
];

export default function HistoricoMensalForm({
  historico,
  onChange,
}: HistoricoMensalFormProps) {
  const mesesArray: HistoricoMensal[] = [];

  // Gera 36 meses (JAN-24 a DEC-26)
  for (let year = 24; year <= 26; year++) {
    for (let month = 0; month < 12; month++) {
      const mesKey = `${MESES[month]}-${year}`;
      const existing = historico.find((h) => h.mes === mesKey);
      mesesArray.push(
        existing || {
          mes: mesKey,
          maior_lance: undefined,
          menor_lance: undefined,
          qtd: undefined,
        }
      );
    }
  }

  const handleChange = (
    index: number,
    field: keyof HistoricoMensal,
    value: string | number | undefined
  ) => {
    const updated = [...mesesArray];
    if (field === 'mes') {
      updated[index].mes = value as string;
    } else if (field === 'maior_lance' || field === 'menor_lance') {
      updated[index][field] = value ? (typeof value === 'string' ? parseFloat(value) : value) : undefined;
    } else if (field === 'qtd') {
      updated[index][field] = value ? (typeof value === 'string' ? parseInt(value, 10) : value) : undefined;
    }
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {mesesArray.map((item, index) => (
          <div
            key={item.mes}
            className="bg-slate-700 p-3 rounded border border-slate-600"
          >
            <div className="text-xs font-semibold text-slate-300 mb-2">
              {item.mes}
            </div>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Maior Lance"
                value={item.maior_lance ?? ''}
                onChange={(e) =>
                  handleChange(index, 'maior_lance', e.target.value)
                }
                className="w-full bg-slate-600 text-slate-100 rounded px-2 py-1 text-xs border border-slate-500"
              />
              <input
                type="number"
                placeholder="Menor Lance"
                value={item.menor_lance ?? ''}
                onChange={(e) =>
                  handleChange(index, 'menor_lance', e.target.value)
                }
                className="w-full bg-slate-600 text-slate-100 rounded px-2 py-1 text-xs border border-slate-500"
              />
              <input
                type="number"
                placeholder="Qtd"
                value={item.qtd ?? ''}
                onChange={(e) =>
                  handleChange(index, 'qtd', e.target.value)
                }
                className="w-full bg-slate-600 text-slate-100 rounded px-2 py-1 text-xs border border-slate-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
