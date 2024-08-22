export interface Agendamento {
  CodigoAgendamento?: number;
  CodigoUsuario: number;
  CodigoVeiculo: number;
  CodigoProduto?: number | null;
  CodigoTransportadora: number | null;
  CodigoSafra?: number | null;
  CodigoHorario: string | number; 
  ArquivoAnexado?: string;
  Observacao?: string;
  DataAgendamento: string;
  HoraAgendamento: string;
  UsuarioAprovacao?: string;
  MotivoRecusa?: string;
  QuantidadeAgendamento?: number | null;
  SituacaoAgendamento: string;
  TipoAgendamento?: string;
  Placa?: string; 

}
