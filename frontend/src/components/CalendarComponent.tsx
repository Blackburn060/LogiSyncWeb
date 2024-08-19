import React, { useState, useEffect } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Horario } from '../models/Horario';
import { getHorariosDisponiveis, confirmarHorario } from '../services/horarioService';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

const CalendarComponent: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<Horario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] = useState<Horario | null>(null);

  useEffect(() => {
    const fetchHorariosDisponiveis = async () => {
      if (!selectedDate) return;

      try {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const horarios = await getHorariosDisponiveis(formattedDate);
        setHorariosDisponiveis(horarios);
      } catch (error) {
        toast.error('Erro ao buscar horários disponíveis');
        console.error(error);
      }
    };

    fetchHorariosDisponiveis();
  }, [selectedDate]);

  const handleDateChange: CalendarProps['onChange'] = (value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value)) {
      setSelectedDate(value[0]);
    } else {
      setSelectedDate(null);
    }
  };

  const handleHorarioClick = (horario: Horario) => {
    if (!horario.agendado) {
      setHorarioSelecionado(horario);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setHorarioSelecionado(null);
  };

  const handleConfirmarHorario = async () => {
    if (!horarioSelecionado || !selectedDate) return;

    try {
      await confirmarHorario({
        id: horarioSelecionado.id,
        horarioInicio: horarioSelecionado.horarioInicio,
        horarioFim: horarioSelecionado.horarioFim,
        intervaloHorario: horarioSelecionado.intervaloHorario,
        dataAtualizacao: selectedDate.toISOString().split('T')[0],
      });
      toast.success('Agendamento confirmado!');
      handleCloseModal();
    } catch (error) {
      toast.error('Erro ao confirmar agendamento.');
      console.error(error);
    }
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
            tileClassName="text-white text-2xl h-20" // Aumentando o texto e altura dos tiles
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
                        !horario.agendado ? 'bg-blue-600 hover:bg-blue-800' : 'bg-gray-500 cursor-not-allowed'
                      }`}
                      onClick={() => handleHorarioClick(horario)}
                      disabled={horario.agendado}
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

          <button className="mt-4 bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded">
            Revisar Agendamento
          </button>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Confirmar Agendamento"
        className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20"
        overlayClassName="bg-black bg-opacity-50 fixed inset-0 flex justify-center items-center"
      >
        <h2 className="text-lg font-semibold mb-4">Confirmar Agendamento</h2>
        {horarioSelecionado && (
          <>
            <p className="mb-4">
              Deseja confirmar o agendamento para o horário{' '}
              {horarioSelecionado.horarioInicio}?
            </p>
            <button
              onClick={handleConfirmarHorario}
              className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded mr-4"
            >
              Confirmar
            </button>
            <button
              onClick={handleCloseModal}
              className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CalendarComponent;
