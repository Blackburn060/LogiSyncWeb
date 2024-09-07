// Certifique-se de importar a interface Veiculo corretamente
import { Veiculo } from '../models/Veiculo'; // ajuste o caminho conforme necessário

export interface Agendamento {
  CodigoAgendamento?: number;       // Chave primária
  CodigoUsuario: number;            // Código do usuário
  CodigoVeiculo: number;            // Código do veículo
  CodigoProduto?: number | null;    // Código do produto
  CodigoTransportadora: number | null;  // Código da transportadora
  CodigoSafra?: number | null;      // Código da safra
  ArquivoAnexado?: Blob | null;     // Arquivo anexado
  Observacao?: string | null;       // Observação
  DataAgendamento: string;          // Data do agendamento
  HoraAgendamento: string;          // Hora do agendamento
  UsuarioAprovacao?: number | null; // Usuário que aprovou
  MotivoRecusa?: string | null;     // Motivo da recusa
  QuantidadeAgendamento?: number | null; // Quantidade do agendamento
  SituacaoAgendamento: string;      // Situação do agendamento
  TipoAgendamento?: string | null;  // Tipo de agendamento
  DiaTodo: boolean;                 // Se o agendamento é o dia todo
  Placa?: string;                   // Placa do veículo
  veiculo?: Veiculo;                // Detalhes do veículo (associação com a interface Veiculo)
}
