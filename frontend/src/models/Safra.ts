export interface Safra {
  CodigoSafra?: number; // Tornado opcional para novos registros
  AnoSafra: string; // Agora string para aceitar valores como "23/24"
  SituacaoSafra: number;
  DataGeracao?: string; // Opcional, definido no backend
  UsuarioAlteracao?: number | null;
  DataAlteracao?: string | null;
}
