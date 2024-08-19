export interface Horario {
  id: number;
  horarioInicio: string;
  horarioFim: string;
  intervaloHorario: number; // Supondo que intervalo é um número (em minutos)
  dataAtualizacao: string;
  agendado: boolean;  // Nova propriedade adicionada
}
