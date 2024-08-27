import React, { useState, useEffect } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Horario } from '../models/Horario';
import { getHorariosDisponiveis } from '../services/horarioService';
import RevisarDadosAgendamento from './RevisarDadosAgendamento';
import Modal from 'react-modal';

const CalendarComponent: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<Horario[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState<Horario | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  useEffect(() => {
    const fetchHorariosDisponiveis = async () => {
      if (!selectedDate) return;

      try {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const horarios = await getHorariosDisponiveis(formattedDate);
        setHorariosDisponiveis(horarios);
        setHorarioSelecionado(null);
      } catch (error) {
        console.error('Erro ao buscar horários disponíveis', error);
      }
    };

    fetchHorariosDisponiveis();
  }, [selectedDate]);

  const handleDateChange: CalendarProps['onChange'] = (value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      setHorarioSelecionado(null);
    }
  };

  const handleHorarioClick = (horario: Horario) => {
    if (horario.agendado) {
      setIsAlertModalOpen(true);
    } else {
      setHorarioSelecionado(horario);
    }
  };

  const handleRevisarAgendamento = () => {
    if (horarioSelecionado && selectedDate) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseAlertModal = () => {
    setIsAlertModalOpen(false);
  };

  const disablePastDates = ({ date }: { date: Date }) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return date < now;
  };

  return (
    <div className="bg-white flex justify-center items-start p-6">
      <div className="shadow-lg rounded-lg overflow-hidden w-full max-w-4xl flex flex-col md:flex-row mx-auto">
        {/* Calendário */}
        <div className="p-2 bg-gray-900 text-white rounded-t-lg md:rounded-l-lg md:rounded-t-none flex justify-center items-center md:w-1/2 w-full" style={{ height: '550px' }}>
          <Calendar 
            onChange={handleDateChange} 
            value={selectedDate} 
            className="text-lg bg-gray-800 p-2 rounded-lg shadow w-full h-full"
            tileClassName={({ date, view }) =>
              view === 'month' && disablePastDates({ date })
                ? 'text-gray-400 bg-transparent'  // Cor do texto ajustada para cinza mais claro
                : 'text-white'
            }
            tileDisabled={disablePastDates} // Desabilitar datas anteriores ao dia atual
          />
        </div>

        {/* Seção de Horários e Status */}
        <div className="p-2 bg-blue-700 text-white flex flex-col justify-start items-center flex-grow md:w-1/2 w-full overflow-y-auto" style={{ height: '550px' }}>
          <h2 className="text-md font-semibold mb-4">
            {selectedDate
              ? `${selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
              : 'Escolha um dia no calendário!'}
          </h2>

          {/* Títulos de Horários e Status */}
          <div className="w-full grid grid-cols-2 text-center mb-2">
            <span className="font-bold">Horários</span>
            <span className="font-bold">Status</span>
          </div>

          <div className="overflow-y-auto w-full border-l border-gray-500 flex-grow">
            {horariosDisponiveis.length > 0 ? (
              <ul className="space-y-2">
                {horariosDisponiveis.map((horario) => (
                  <li key={`${horario.horarioInicio}-${horario.horarioFim}`} className="mb-2 flex justify-between px-4">
                    <button
                      className={`px-4 py-2 rounded-lg w-full flex justify-between items-center text-sm ${
                        horarioSelecionado === horario ? 'bg-blue-800' : 'bg-blue-600'
                      } hover:bg-blue-800`}
                      onClick={() => handleHorarioClick(horario)}
                    >
                      <span>{`${horario.horarioInicio} - ${horario.horarioFim}`}</span>
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
            disabled={!horarioSelecionado}
          >
            Revisar Agendamento
          </button>
        </div>
      </div>

      {/* Modal de Revisão de Agendamento */}
      {isModalOpen && horarioSelecionado && selectedDate && (
        <RevisarDadosAgendamento 
          selectedDate={selectedDate}
          horarioSelecionado={horarioSelecionado} 
          onClose={handleCloseModal}
        />
      )}

      {/* Modal de Alerta de Horário já agendado */}
      <Modal
        isOpen={isAlertModalOpen}
        onRequestClose={handleCloseAlertModal}
        contentLabel="Horário Já Agendado"
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
        overlayClassName="bg-black bg-opacity-50 fixed inset-0 flex justify-center items-center"
      >
        <h2 className="text-xl font-bold text-center">Horário Indisponível</h2>
        <p className="mt-4 text-center">Este horário já está agendado. Por favor, selecione outro horário.</p>
        <button 
          onClick={handleCloseAlertModal} 
          className="mt-6 bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded mx-auto"
        >
          Fechar
        </button>
      </Modal>
    </div>
  );
};

export default CalendarComponent;
