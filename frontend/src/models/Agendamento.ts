export interface Agendamento {
    CodigoAgendamento: number;
    CodigoUsuario: number;
    CodigoVeiculo: number;
    CodigoProduto: number;
    CodigoTransportadora: number;
    CodigoSafra: number;
    CodigoHorario: number;
    ArquivoAnexado: string;
    Observacao: string;
    DataAgendamento: string;
    HoraAgendamento: string;
    UsuarioAprovacao: string;
    MotivoRecusa: string;
    QuantidadeAgendamento: number;
    SituacaoAgendamento: string;
    TipoAgendamento: string;
    Placa?: string; 
  }
  