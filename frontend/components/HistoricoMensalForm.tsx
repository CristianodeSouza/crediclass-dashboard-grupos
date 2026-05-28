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
          saldo: 0,
          juros: 0,
          multa: 0,
          taxa_adm: 0,
          observacoes: '',
        }
      );
    }
  }

  const handleChange = (
    index: number,
    field: keyof HistoricoMensal,
    value: string | number
  ) => {
    const updated = [...mesesArray];
    if (field === 'mes') {
      updated[index].mes = value as string;
    } else if (
      field === 'saldo' ||
      field === 'juros' ||
      field === 'multa' ||
      field === 'taxa_adm'
    ) {
      updated[index][field] = typeof value === 'string' ? parseFloat(value) || 0 : value;
    } else {
      updated[index][field] = value as any;
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
                placeholder="Saldo"
                value={item.saldo}
                onChange={(e) =>
                  handleChange(index, 'saldo', e.target.value)
                }
                className="w-full bg-slate-600 text-slate-100 rounded px-2 py-1 text-xs border border-slate-500"
              />
              <input
                type="number"
                placeholder="Juros"
                value={item.juros}
                onChange={(e) =>
                  handleChange(index, 'juros', e.target.value)
                }
                className="w-full bg-slate-600 text-slate-100 rounded px-2 py-1 text-xs border border-slate-500"
              />
              <input
                type="number"
                placeholder="Multa"
                value={item.multa}
                onChange={(e) =>
                  handleChange(index, 'multa', e.target.value)
                }
                className="w-full bg-slate-600 text-slate-100 rounded px-2 py-1 text-xs border border-slate-500"
              />
              <input
                type="number"
                placeholder="Taxa Adm"
                value={item.taxa_adm}
                onChange={(e) =>
                  handleChange(index, 'taxa_adm', e.target.value)
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
