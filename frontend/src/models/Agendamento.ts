import { Veiculo } from '../models/Veiculo';
import { Portaria } from './Portaria';

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
  Quantidade?: number | null;  
  Produto?: string | null;   
  Safra?: string | null;   
  Arquivo?: string | null;   
  DataHoraSaida?: string;    // Defina a propriedade DataHoraSaida como opcional

  // Novas propriedades adicionadas
  DescricaoProduto?: string;
  AnoSafra?: string;
  DadosPortaria?: Portaria;

 
}
