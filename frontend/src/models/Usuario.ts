// src/models/Usuario.ts
export interface Usuario {
  CodigoUsuario: number;
  NomeCompleto: string;
  Email: string;
  CPF: string;
  NumeroCelular: string; // Adicione esta linha
  // Adicione outras propriedades que seu modelo de usuário possui
  Senha?: string; // Adicione esta linha se quiser tratar a senha como uma propriedade opcional
}
