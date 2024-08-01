// models/HorarioDisponibilidade.ts
export type HorarioDisponibilidade = {
  id: number;
  horario_inicial: string;
  horario_final: string;
  seg_status: 'disponível' | 'indisponível' | 'pendente';
  ter_status: 'disponível' | 'indisponível' | 'pendente';
  qua_status: 'disponível' | 'indisponível' | 'pendente';
  qui_status: 'disponível' | 'indisponível' | 'pendente';
  sex_status: 'disponível' | 'indisponível' | 'pendente';
  sab_status: 'disponível' | 'indisponível' | 'pendente';
  dom_status: 'disponível' | 'indisponível' | 'pendente';
};
