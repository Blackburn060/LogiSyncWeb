import React, { useEffect, useState } from 'react';
import { getHorarios, updateHorario } from '../services/HorarioService';
import { HorarioDisponibilidade } from '../models/HorarioDisponibilidade';
import axios from 'axios';

const GerenciarHorarios: React.FC = () => {
  const [horarios, setHorarios] = useState<HorarioDisponibilidade[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHorarios();
        console.log('Horários recebidos:', data);
        setHorarios(data);
      } catch (error) {
        console.error('Erro ao carregar horários', error);
      }
    };

    fetchData();
  }, []);

  const handleDisponibilidadeChange = async (id: number, statusKey: keyof HorarioDisponibilidade, novaDisponibilidade: 'disponível' | 'indisponível') => {
    const currentStatus = horarios.find(horario => horario.id === id)?.[statusKey];
    if (currentStatus === 'pendente') {
      setErrorMessage('Não é possível modificar o status desse horário, pois tem um agendamento com esse horário.');
      return;
    }

    const day = statusKey.replace('_status', '');
    try {
      console.log(`Atualizando horário: id=${id}, statusKey=${statusKey}, novaDisponibilidade=${novaDisponibilidade}`);
      await updateHorario(id, day, novaDisponibilidade);
      setHorarios(prevHorarios => prevHorarios.map(horario =>
        horario.id === id ? { ...horario, [statusKey]: novaDisponibilidade } : horario
      ));
      setErrorMessage(null); // Limpa a mensagem de erro em caso de sucesso
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Erro ao atualizar disponibilidade');
      }
    }
  };

  const getIcon = (status: string | undefined) => {
    switch (status) {
      case 'disponível':
        return '✔';
      case 'indisponível':
        return '✖';
      case 'pendente':
        return '⚠️';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Ajuste de Horários Disponíveis</h1>
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
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
                {['seg_status', 'ter_status', 'qua_status', 'qui_status', 'sex_status', 'sab_status', 'dom_status'].map((statusKey) => {
                  const status = horario[statusKey as keyof HorarioDisponibilidade] as string;
                  return (
                    <td key={statusKey} className="border border-gray-300 p-2 text-center">
                      <button
                        onClick={() => handleDisponibilidadeChange(horario.id, statusKey as keyof HorarioDisponibilidade, status === 'disponível' ? 'indisponível' : 'disponível')}
                        className={`${status === 'disponível' ? 'bg-green-500 hover:bg-green-700' : status === 'indisponível' ? 'bg-red-500 hover:bg-red-700' : 'bg-yellow-500 hover:bg-yellow-700'} text-white font-bold py-1 px-2 rounded-full`}
                      >
                        {getIcon(status)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GerenciarHorarios;
