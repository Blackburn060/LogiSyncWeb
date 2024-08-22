export interface Horario {
  id?: number;
  horarioInicio: string;
  horarioFim: string;
  intervaloHorario: number; 
  dataAtualizacao?: string;
  agendado: boolean;
}
