export interface Usuario {
  CodigoUsuario: number;
  NomeCompleto: string;
  Email: string;
  CPF: string;
  NumeroCelular: string; 
  Senha?: string; 
  CodigoTransportadora?: number;
  TipoUsuario: string;
  SituacaoUsuario: number;
  UsuarioAlteracao?: string;
}
