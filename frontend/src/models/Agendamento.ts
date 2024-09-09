import { Veiculo } from '../models/Veiculo';

export interface Agendamento {
  CodigoAgendamento?: number;    
  CodigoUsuario: number;          
  CodigoVeiculo: number;          
  CodigoProduto?: number | null;  
  CodigoTransportadora: number | null; 
  CodigoSafra?: number | null;      
  ArquivoAnexado?: Blob | string | null; // Permite Blob, string ou null
  Observacao?: string | null;   
  DataAgendamento: string;        
  HoraAgendamento: string;         
  UsuarioAprovacao?: number | null;
  MotivoRecusa?: string | null; 
  QuantidadeAgendamento?: number | null;
  SituacaoAgendamento: string; 
  TipoAgendamento?: string | null; 
  DiaTodo: boolean;         
  Placa?: string;                   
  veiculo?: Veiculo;                
}
