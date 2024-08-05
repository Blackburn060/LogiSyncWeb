// src/models/Usuario.ts
export interface Usuario {
  CodigoUsuario: number;
  NomeCompleto: string;
  Email: string;
  CPF: string;
  NumeroCelular: string; 
  Senha?: string; 
}
