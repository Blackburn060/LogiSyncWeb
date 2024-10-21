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
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [tipoAgendamento, setTipoAgendamento] = useState<string>(localStorage.getItem('TipoAgendamento') || 'carga');

  const navigate = useNavigate();

  useEffect(() => {
    if (!tipoAgendamento) {
      navigate('/processo');
    }
  }, [navigate, tipoAgendamento]);

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

  const fetchHorarios = async (selectedDate: Date, tipo: string) => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    const horarios = await getHorariosDisponiveis(formattedDate, tipo, token!);
    setHorariosDisponiveis(horarios);
    setHorarioSelecionado(null);
    setAlertMessage('');
  };

  useEffect(() => {
    if (!selectedDate) return;
    fetchHorarios(selectedDate, tipoAgendamento);
  }, [selectedDate, tipoAgendamento, token]);

  const handleDateChange: CalendarProps['onChange'] = (value) => {
    if (value instanceof Date) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate.getTime() < now.getTime()) {
        setAlertMessage('Você não pode selecionar uma data anterior ao dia de hoje. Por favor, escolha uma data válida.');
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
      setAlertMessage('Este horário já está agendado. Por favor, selecione outro horário.');
    } else {
      setHorarioSelecionado(horario);
      setAlertMessage('');
    }
  };

  // Função para alternar o tipo de agendamento entre "Carga" e "Descarga"
  const toggleTipoAgendamento = () => {
    const novoTipo = tipoAgendamento === 'carga' ? 'descarga' : 'carga';
    localStorage.setItem('TipoAgendamento', novoTipo);
    setTipoAgendamento(novoTipo);
    if (selectedDate) {
      fetchHorarios(selectedDate, novoTipo);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Navbar showLogin={!user} showRegister={!user} />
      <Toaster position="top-right" containerClassName='mt-20' />

      <div className="container mx-auto pt-10 flex-grow">
        {/* Botão de Alternar para Carga/Descarga */}
        <div className="flex justify-center mb-4">
          <button
            onClick={toggleTipoAgendamento}
            className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
          >
            Alternar para {tipoAgendamento === 'carga' ? 'Descarga' : 'Carga'}
          </button>
        </div>

        {/* Conteúdo do Calendário */}
        <div className="bg-white flex justify-center items-start p-6">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
            {/* Calendário */}
            <div
              className="p-4 bg-gray-900 text-white rounded-t-lg md:rounded-l-lg md:rounded-t-none flex justify-center items-center md:w-1/2 w-full"
              style={{ height: '550px' }}
            >
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                className="text-lg bg-gray-800 p-4 rounded-lg shadow w-full h-full"
                tileClassName={({ date }) => {
                  let classes = 'text-white text-xl h-16 w-16 flex items-center justify-center rounded-full transition duration-200 ease-in-out';
                  const now = new Date();
                  now.setHours(0, 0, 0, 0);

                  // Adiciona uma cor de fundo especial para o dia atual
                  if (date.getTime() === now.getTime()) {
                    classes += ' bg-yellow-500 text-white';
                  }

                  // Estilo para o dia selecionado
                  if (selectedDate && date.getTime() === selectedDate.getTime()) {
                    classes += ' bg-blue-600 text-white';
                  }

                  return classes + ' hover:bg-blue-400 hover:text-black hover:border hover:border-blue-600';
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
              style={{ height: '550px' }}
            >
              {/* Título com o indicador de tipo de agendamento */}
              <div className="flex items-center space-x-4">
                <h2 className="text-md font-semibold">
                  {selectedDate
                    ? `${selectedDate.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}`
                    : 'Escolha um dia no calendário!'}
                </h2>
                {/* Indicador de TipoAgendamento */}
                <div
                  className={`flex items-center justify-center px-2 py-1 text-sm font-semibold rounded ${tipoAgendamento === 'carga' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                >
                  {tipoAgendamento === 'carga' ? 'Carga' : 'Descarga'}
                </div>
              </div>

              {/* Títulos de Horários e Status */}
              <div className="w-full grid grid-cols-2 text-center mb-2">
                <div className="flex justify-start pl-4">
                  <span className="font-bold">Horários</span>
                </div>
                <div className="flex justify-end pr-4">
                  <span className="font-bold">Status</span>
                </div>
              </div>

              {/* Verificação de mensagem de erro */}
              <div className="overflow-y-auto w-full border-l border-gray-500 flex-grow">
                {alertMessage ? (
                  <div className="text-center bg-red-500 text-white p-4 rounded-lg">
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
                          className={`px-4 py-2 rounded-lg w-full flex justify-between items-center text-sm ${horarioSelecionado === horario ? 'bg-blue-800' : 'bg-blue-600'
                            } hover:bg-blue-800`}
                          onClick={() => handleHorarioClick(horario)}
                        >
                          <div className="flex justify-start w-full">
                            <span>{`${horario.horarioInicio} - ${horario.horarioFim}`}</span>
                          </div>
                          <div className="flex justify-end w-full">
                            <span
                              className={`w-4 h-4 rounded-full ${!horario.agendado ? 'bg-green-500' : 'bg-gray-500'
                                }`}
                            ></span>
                          </div>
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
                className="mt-4 bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
                disabled={!horarioSelecionado}
              >
                Revisar Agendamento
              </button>
            </div>
          </div>

          {isModalOpen && horarioSelecionado && selectedDate && (
            <RevisarDadosAgendamento
              selectedDate={selectedDate}
              horarioSelecionado={horarioSelecionado}
              onClose={handleCloseModal}
            />
          )}

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
