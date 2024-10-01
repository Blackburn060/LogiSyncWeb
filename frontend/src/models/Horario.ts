export interface Horario {
  id?: number;
  horarioInicio: string;
  horarioFim: string;
  intervaloCarga: number;
  intervaloDescarga: number;
  dataAtualizacao?: string;
  agendado: boolean;
}