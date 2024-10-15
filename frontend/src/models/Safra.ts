// Definição da interface Safra baseada na sua tabela
export interface Safra {
  CodigoSafra: number;
  AnoSafra: number;
  SituacaoSafra: number;
  DataGeracao: string;
  UsuarioAlteracao?: number | null;
  DataAlteracao?: string | null;
}
