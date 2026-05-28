// API Response Types

export interface Grupo {
  id: string;
  nome: string;
  adm: string;
  tipo_bem: string;
  prazo_min: string;
  prazo_max: string;
  status: 'ativo' | 'inativo';
  data_criacao: string;
  data_atualizacao: string;
  historico: HistoricoMensal[];
  deletado: boolean;
  data_delecao?: string;
}

export interface HistoricoMensal {
  mes: string; // format: "JAN-24", "FEV-24", etc
  saldo: number;
  juros: number;
  multa: number;
  taxa_adm: number;
  observacoes?: string;
}

export interface GrupoListResponse {
  grupos: Grupo[];
  total: number;
}

export interface GrupoGerenciadorParams {
  limit?: number;
  offset?: number;
  busca?: string;
  adm?: string;
  tipo_bem?: string;
  prazo_min?: string;
  prazo_max?: string;
}

export interface Stats {
  total_grupos: number;
  grupos_ativos: number;
  grupos_inativos: number;
  administradoras: number;
  valor_total: number;
  saldo_medio: number;
}

export interface Administradora {
  id: string;
  nome: string;
  total_grupos: number;
  saldo_total: number;
}

export interface ImportPreviewResponse {
  total_registros: number;
  primeira_linha: Record<string, string>;
  colunas_detectadas: string[];
  validacao: {
    validos: number;
    invalidos: number;
    erros: string[];
  };
}

export interface ImportProcessResponse {
  sucesso: boolean;
  total_processado: number;
  total_importado: number;
  erros: {
    linha: number;
    erro: string;
  }[];
}

export interface GrupoAuditoria {
  id: string;
  grupo_id: string;
  acao: 'criado' | 'atualizado' | 'deletado' | 'status_alterado' | 'duplicado';
  usuario: string;
  data: string;
  detalhes: Record<string, any>;
}

export interface PiperunOportunidade {
  id: string;
  titulo: string;
  valor: number;
  etapa: string;
  data_atualizacao: string;
  grupo_relacionado?: string;
}

export interface DashboardTab {
  id: 'mapa' | 'gerenciador' | 'calculadora' | 'importacao' | 'analytics' | 'piperun';
  label: string;
  icon: string;
}

export interface GrupoEditFormData {
  nome: string;
  adm: string;
  tipo_bem: string;
  prazo_min: string;
  prazo_max: string;
  historico: HistoricoMensal[];
}
