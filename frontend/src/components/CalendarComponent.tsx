import React, { useState, useEffect } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Horario } from '../models/Horario';
import { getHorariosDisponiveis } from '../services/horarioService';
import RevisarDadosAgendamento from './RevisarDadosAgendamento';

const CalendarComponent: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<Horario[]>([]);
  const [horarioSelecionadoId, setHorarioSelecionadoId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchHorariosDisponiveis = async () => {
      if (!selectedDate) return;

      try {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const horarios = await getHorariosDisponiveis(formattedDate);
        setHorariosDisponiveis(horarios);
        setHorarioSelecionadoId(null); // Resetar o horário selecionado ao mudar a data
      } catch (error) {
        console.error('Erro ao buscar horários disponíveis', error);
      }
    };

    fetchHorariosDisponiveis();
  }, [selectedDate]);

  const handleDateChange: CalendarProps['onChange'] = (value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      setHorarioSelecionadoId(null); // Resetar o horário selecionado ao mudar a data
    }
  };

  const handleHorarioClick = (horario: Horario) => {
    setHorarioSelecionadoId(horario.id); // Definir o ID do horário selecionado
  };

  const handleRevisarAgendamento = () => {
    if (horarioSelecionadoId !== null && selectedDate) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-start p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-6xl flex">
        {/* Calendário */}
        <div className="p-6 bg-gray-900 text-white rounded-l-lg flex justify-center items-center" style={{ width: '50%', height: '700px' }}>
          <Calendar 
            onChange={handleDateChange} 
            value={selectedDate} 
            className="text-xl bg-gray-800 p-6 rounded-lg shadow w-full h-full"
            tileClassName="text-white text-2xl h-20" 
          />
        </div>

        {/* Seção de Horários e Status */}
        <div className="p-6 bg-blue-700 text-white flex flex-col justify-start items-center flex-grow" style={{ height: '700px' }}>
          <h2 className="text-lg font-semibold mb-4">
            {selectedDate
              ? `${selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
              : 'Escolha um dia no calendário!'}
          </h2>

          {/* Títulos de Horários e Status */}
          <div className="w-full grid grid-cols-2 text-center mb-2">
            <span className="font-bold">Horários</span>
            <span className="font-bold">Status</span>
          </div>

          <div className="overflow-y-auto h-full w-full border-l border-gray-500">
            {horariosDisponiveis.length > 0 ? (
              <ul className="space-y-2">
                {horariosDisponiveis.map((horario) => (
                  <li key={horario.id} className="mb-2 flex justify-between px-4">
                    <button
                      className={`px-4 py-2 rounded-lg w-full flex justify-between items-center text-sm ${
                        horarioSelecionadoId === horario.id ? 'bg-blue-800' : 'bg-blue-600'
                      } hover:bg-blue-800`}
                      onClick={() => handleHorarioClick(horario)}
                    >
                      <span>{horario.horarioInicio}</span>
                      <span 
                        className={`w-4 h-4 rounded-full ${
                          !horario.agendado 
                            ? 'bg-green-500' 
                            : 'bg-gray-500'
                        }`}
                      ></span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center">Sem horários disponíveis para esta data.</p>
            )}
          </div>

          <button 
            onClick={handleRevisarAgendamento} 
            className="mt-4 bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
            disabled={horarioSelecionadoId === null}
          >
            Revisar Agendamento
          </button>
        </div>
      </div>

      {/* Modal de Revisão de Agendamento */}
      {isModalOpen && horarioSelecionadoId !== null && selectedDate && (
        <RevisarDadosAgendamento 
          selectedDate={selectedDate}
          horarioSelecionado={horariosDisponiveis.find(horario => horario.id === horarioSelecionadoId)!} // Passar o horário selecionado
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CalendarComponent;
