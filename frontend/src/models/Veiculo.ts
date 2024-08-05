export interface Veiculo {
  CodigoVeiculo?: number;
  CodigoUsuario: number;
  NomeVeiculo: string;
  Placa?: string;
  Marca?: string;
  ModeloTipo?: string;
  AnoFabricacao?: number;
  Cor?: string;
  CapacidadeCarga?: number;
  SituacaoVeiculo?: number;
  Bloqueado?: number;
  UsuarioAlteracao?: number;
  DataAlteracao?: string;
  DataGeracao?: string;
}
