import React, { useEffect, useState } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Horario } from '../models/Horario';
import { getHorariosDisponiveis } from '../services/horarioService';
import RevisarDadosAgendamento from '../components/RevisarDadosAgendamento';
import Modal from 'react-modal';

const CalendarioAgendamentos: React.FC = () => {
  const { user, token } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<Horario[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState<Horario | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const tipoAgendamento = localStorage.getItem('TipoAgendamento');
    if (!tipoAgendamento) {
      navigate('/processo');
    }
  }, [navigate]);

  const handleRevisarAgendamento = () => {
    if (!user || !token) {
      setIsLoginModalOpen(true);
      return;
    }
    if (horarioSelecionado && selectedDate) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/registro/usuario');
  };

  useEffect(() => {
    const fetchHorariosDisponiveis = async () => {
      if (!selectedDate) return;

      try {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const tipoAgendamento = localStorage.getItem('TipoAgendamento') || 'carga';
        const horarios = await getHorariosDisponiveis(formattedDate, tipoAgendamento, token!);
        setHorariosDisponiveis(horarios);
        setHorarioSelecionado(null);
        setAlertMessage(''); 
      } catch (error) {
        console.error('Erro ao buscar horários disponíveis', error);
      }
    };

    fetchHorariosDisponiveis();
  }, [selectedDate, token]);

  const handleDateChange: CalendarProps['onChange'] = (value) => {
    if (value instanceof Date) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate.getTime() < now.getTime()) {
        setAlertMessage("Você não pode selecionar uma data anterior ao dia de hoje. Por favor, escolha uma data válida.");
        setHorarioSelecionado(null);
      } else {
        setSelectedDate(value);
        setHorarioSelecionado(null);
        setAlertMessage('');
      }
    }
  };

  const handleHorarioClick = (horario: Horario) => {
    if (horario.agendado) {
      setAlertMessage("Este horário já está agendado. Por favor, selecione outro horário.");
    } else {
      setHorarioSelecionado(horario);
      setAlertMessage('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* Barra de navegação personalizada */}
      <Navbar showLogin={!user} showRegister={!user} />

      <Toaster position="top-right" />
      <div className="container mx-auto pt-10 flex-grow">
        <div className="bg-white flex justify-center items-start p-6">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
            {/* Calendário */}
            <div
              className="p-4 bg-gray-900 text-white rounded-t-lg md:rounded-l-lg md:rounded-t-none flex justify-center items-center md:w-1/2 w-full"
              style={{ height: "550px" }}
            >
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                className="text-lg bg-gray-800 p-4 rounded-lg shadow w-full h-full"
                tileClassName={({ date }) => {
                  let classes = "text-white text-xl h-16 w-16 flex items-center justify-center rounded-full transition duration-200 ease-in-out";
                  const now = new Date();
                  now.setHours(0, 0, 0, 0);

                  // Adiciona uma cor de fundo especial para o dia atual
                  if (date.getTime() === now.getTime()) {
                    classes += " bg-yellow-500 text-white";
                  }

                  // Estilo para o dia selecionado
                  if (selectedDate && date.getTime() === selectedDate.getTime()) {
                    classes += " bg-blue-600 text-white";
                  }

                  return classes + " hover:bg-blue-400 hover:text-black hover:border hover:border-blue-600";
                }}
                next2Label={null}
                prev2Label={null}
                navigationLabel={({ label }) => (
                  <span className="text-white hover:text-black transition duration-200 ease-in-out">{label}</span>
                )}
                nextLabel={<span className="text-white hover:text-black transition duration-200 ease-in-out">{'>'}</span>}
                prevLabel={<span className="text-white hover:text-black transition duration-200 ease-in-out">{'<'}</span>}
              />
            </div>

            {/* Seção de Horários e Status */}
            <div
              className="p-4 bg-blue-700 text-white flex flex-col justify-start items-center flex-grow md:w-1/2 w-full"
              style={{ height: "550px" }}
            >
              <h2 className="text-md font-semibold mb-4">
                {selectedDate
                  ? `${selectedDate.toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}`
                  : "Escolha um dia no calendário!"}
              </h2>

              {/* Títulos de Horários e Status */}
              <div className="w-full grid grid-cols-2 text-center mb-2">
                <span className="font-bold">Horários</span>
                <span className="font-bold">Status</span>
              </div>

              {/* Verificação de mensagem de erro */}
              <div className="overflow-y-auto w-full border-l border-gray-500 flex-grow">
                {alertMessage ? (
                  <div className="text-center bg-500 text-white p-4 rounded-lg">
                    {alertMessage}
                  </div>
                ) : horariosDisponiveis.length > 0 ? (
                  <ul className="space-y-2">
                    {horariosDisponiveis.map((horario) => (
                      <li
                        key={`${horario.horarioInicio}-${horario.horarioFim}`}
                        className="mb-2 flex justify-between px-4"
                      >
                        <button
                          className={`px-4 py-2 rounded-lg w-full flex justify-between items-center text-sm ${
                            horarioSelecionado === horario
                              ? "bg-blue-800"
                              : "bg-blue-600"
                          } hover:bg-blue-800`}
                          onClick={() => handleHorarioClick(horario)}
                        >
                          <span>{`${horario.horarioInicio} - ${horario.horarioFim}`}</span>
                          <span
                            className={`w-4 h-4 rounded-full ${
                              !horario.agendado ? "bg-green-500" : "bg-gray-500"
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

          {/* Modal de Login/Cadastro */}
          <Modal
            isOpen={isLoginModalOpen}
            onRequestClose={handleCloseLoginModal}
            contentLabel="Login ou Cadastro"
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
            overlayClassName="bg-black bg-opacity-50 fixed inset-0 flex justify-center items-center"
          >
            <h2 className="text-xl font-bold text-center">Faça Login ou Cadastre-se</h2>
            <p className="mt-4 text-center">Para revisar ou confirmar um agendamento, você precisa estar autenticado.</p>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={handleLogin}
                className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
              >
                Cadastrar-se
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default CalendarioAgendamentos;
