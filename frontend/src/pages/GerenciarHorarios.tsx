import React, { useEffect, useState } from 'react';
import { getHorarios, updateHorario } from '../services/HorarioService';
import { HorarioDisponibilidade } from '../models/HorarioDisponibilidade';

const GerenciarHorarios: React.FC = () => {
  const [horarios, setHorarios] = useState<HorarioDisponibilidade[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHorarios();
        setHorarios(data);
      } catch (error) {
        console.error('Erro ao carregar horários', error);
      }
    };

    fetchData();
  }, []);

  const handleDisponibilidadeChange = async (id: number, statusKey: keyof HorarioDisponibilidade, novaDisponibilidade: 'disponível' | 'indisponível' | 'pendente') => {
    try {
      await updateHorario(id, statusKey, novaDisponibilidade);
      setHorarios(prevHorarios => prevHorarios.map(horario =>
        horario.id === id ? { ...horario, [statusKey]: novaDisponibilidade } : horario
      ));
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Ajuste de Horários Disponíveis</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-center">Horário</th>
              {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map((dia) => (
                <th key={dia} className="border border-gray-300 p-2 text-center">{dia}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horarios.map((horario) => (
              <tr key={horario.id}>
                <td className="border border-gray-300 p-2 text-center">{`${horario.horario_inicial} - ${horario.horario_final}`}</td>
                {['seg_status', 'ter_status', 'qua_status', 'qui_status', 'sex_status', 'sab_status', 'dom_status'].map((statusKey) => (
                  <td key={statusKey} className="border border-gray-300 p-2 text-center">
                    <button
                      onClick={() => handleDisponibilidadeChange(horario.id, statusKey as keyof HorarioDisponibilidade, horario[statusKey as keyof HorarioDisponibilidade] === 'disponível' ? 'indisponível' : 'disponível')}
                      className={`${horario[statusKey as keyof HorarioDisponibilidade] === 'disponível' ? 'bg-green-500 hover:bg-green-700' : 'bg-red-500 hover:bg-red-700'} text-white font-bold py-1 px-2 rounded-full`}
                    >
                      {horario[statusKey as keyof HorarioDisponibilidade] === 'disponível' ? '✔' : '✖'}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GerenciarHorarios;
