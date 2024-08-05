import React, { useEffect, useState } from 'react';
import { getHorarios, updateHorario } from '../services/HorarioService';
import { HorarioDisponibilidade } from '../models/HorarioDisponibilidade';
import axios from 'axios';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';

const GerenciarHorarios: React.FC = () => {
  const [horarios, setHorarios] = useState<HorarioDisponibilidade[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHorarios();
        const sortedData = data.sort((a, b) => {
          const timeA = new Date(`1970-01-01T${a.horario_inicial}Z`).getTime();
          const timeB = new Date(`1970-01-01T${b.horario_inicial}Z`).getTime();
          return timeA - timeB;
        });
        setHorarios(sortedData);
      } catch (error) {
        console.error('Erro ao carregar horários', error);
      }
    };

    fetchData();
  }, []);

  const handleDisponibilidadeChange = async (id: number, statusKey: keyof HorarioDisponibilidade, novaDisponibilidade: 'disponível' | 'indisponível') => {
    const currentStatus = horarios.find(horario => horario.id === id)?.[statusKey];
    if (currentStatus === 'pendente') {
      toast.error('Não é possível modificar o status desse horário, pois tem um agendamento com esse horário.');
      return;
    }

    const day = statusKey.replace('_status', '');
    try {
      await updateHorario(id, day, novaDisponibilidade);
      setHorarios(prevHorarios => prevHorarios.map(horario =>
        horario.id === id ? { ...horario, [statusKey]: novaDisponibilidade } : horario
      ));
      toast.success('Disponibilidade atualizada com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao atualizar disponibilidade');
      }
    }
  };

  const getIcon = (status: string | undefined) => {
    switch (status) {
      case 'disponível':
        return '✅';
      case 'indisponível':
        return '❌';
      case 'pendente':
        return '⚠️';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <Toaster />
      <div className="flex-grow flex justify-center items-center p-4">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Ajuste de Horários Disponíveis</h1>
            <div className="flex space-x-4">
              <span>Pendente <span className="text-yellow-500">⚠️</span></span>
              <span>Indisponível <span className="text-red-500">❌</span></span>
              <span>Disponível <span className="text-green-500">✅</span></span>
            </div>
          </div>
          <div className="w-full max-h-[700px] overflow-y-auto rounded-lg border-2 border-black scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thumb-gray-300">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border border-gray-300 p-2 text-center">Horário</th>
                  {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map((dia) => (
                    <th key={dia} className="border border-gray-200 p-2 text-center">{dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horarios.map((horario, index) => (
                  <tr key={horario.id} className={index % 2 === 0 ? 'bg-gray-200' : 'bg-white'}>
                    <td className="border border-gray-300 p-2 text-center">{`${horario.horario_inicial} - ${horario.horario_final}`}</td>
                    {['seg_status', 'ter_status', 'qua_status', 'qui_status', 'sex_status', 'sab_status', 'dom_status'].map((statusKey) => {
                      const status = horario[statusKey as keyof HorarioDisponibilidade] as string;
                      return (
                        <td key={statusKey} className="border border-gray-300 p-2 text-center">
                          <button
                            onClick={() => handleDisponibilidadeChange(horario.id, statusKey as keyof HorarioDisponibilidade, status === 'disponível' ? 'indisponível' : 'disponível')}
                            className="text-xl"
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
      </div>
    </div>
  );
};

export default GerenciarHorarios;
