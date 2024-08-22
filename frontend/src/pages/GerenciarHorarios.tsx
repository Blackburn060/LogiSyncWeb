import React, { useEffect, useState } from 'react';
import { getHorarios, updateHorario } from '../services/horarioService';
import { Horario } from '../models/Horario';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import { registrarIndisponibilidade, getIndisponibilidades, deleteIndisponibilidade } from '../services/agendamentoService';
import { useAuth } from '../context/AuthContext';
import { Agendamento } from '../models/Agendamento';
import { format } from 'date-fns';

const GerenciarHorarios: React.FC = () => {
  const { user, accessToken } = useAuth();
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null);
  const [dataIndisponivel, setDataIndisponivel] = useState<string>('');
  const [horaIndisponivel, setHoraIndisponivel] = useState<string>('');
  const [diaTodo, setDiaTodo] = useState<boolean>(false);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [indisponibilidades, setIndisponibilidades] = useState<Agendamento[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const data = await getHorarios();
        setHorarios(data);
        gerarHorariosDisponiveis(data[0]);
      } catch (error) {
        console.error('Erro ao carregar horários', error);
      }
    };

    const fetchIndisponibilidades = async () => {
      try {
        const data = await getIndisponibilidades(accessToken!);
        const indisponibilidadesAtualizadas = data.map((ind) => ({
          ...ind,
          HoraAgendamento: ind.HoraAgendamento || "Dia Todo",
          DiaTodo: !ind.HoraAgendamento,
          DataAgendamento: format(new Date(ind.DataAgendamento), 'dd/MM/yyyy'),
        }));
        setIndisponibilidades(indisponibilidadesAtualizadas);
      } catch (error) {
        console.error('Erro ao carregar indisponibilidades', error);
      }
    };

    fetchHorarios();
    fetchIndisponibilidades();
  }, [accessToken]);

  const gerarHorariosDisponiveis = (horario: Horario) => {
    const horariosGerados: string[] = [];
    let current = new Date(`1970-01-01T${horario.horarioInicio}:00`);
    const end = new Date(`1970-01-01T${horario.horarioFim}:00`);

    while (current < end) {
      const next = new Date(current.getTime() + horario.intervaloHorario * 60000);
      if (next > end) break;
      const horaFormatada = `${current.toTimeString().substring(0, 5)} - ${next.toTimeString().substring(0, 5)}`;
      horariosGerados.push(horaFormatada);
      current = next;
    }

    setHorariosDisponiveis(horariosGerados);
  };

  const handleEditClick = (horario: Horario) => {
    setEditingHorario(horario);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingHorario) {
      const { name, value } = e.target;
      setEditingHorario({ ...editingHorario, [name]: name === 'intervaloHorario' ? Number(value) : value });
    }
  };

  const handleUpdate = async () => {
    if (editingHorario) {
      try {
        await updateHorario(editingHorario.id!, editingHorario);
        toast.success('Horário atualizado com sucesso.');
        setEditingHorario(null);

        window.location.reload();
      } catch (error) {
        console.error('Erro ao atualizar horário', error);
        toast.error('Erro ao atualizar horário.');
      }
    }
  };

  const handleRegistrarIndisponibilidade = async () => {
    if (!user || !accessToken) {
      toast.error('Você precisa estar logado para registrar uma indisponibilidade.');
      return;
    }

    if (!dataIndisponivel) {
      toast.error('Por favor, preencha o campo de data.');
      return;
    }

    if (!diaTodo && !horaIndisponivel) {
      toast.error('Por favor, preencha o campo de horário ou selecione "Dia Todo".');
      return;
    }

    try {
      await registrarIndisponibilidade(accessToken, {
        CodigoUsuario: Number(user.id),
        DataAgendamento: dataIndisponivel,
        HoraAgendamento: diaTodo ? '' : horaIndisponivel,
        DiaTodo: diaTodo ? 1 : 0,
      });
      toast.success('Horário registrado como indisponível.');
      setDataIndisponivel('');
      setHoraIndisponivel('');
      setDiaTodo(false);

      const updatedIndisponibilidades = await getIndisponibilidades(accessToken);
      const indisponibilidadesAtualizadas = updatedIndisponibilidades.map((ind) => ({
        ...ind,
        HoraAgendamento: ind.HoraAgendamento || "Dia Todo",
        DiaTodo: !ind.HoraAgendamento,
        DataAgendamento: format(new Date(ind.DataAgendamento), 'dd/MM/yyyy'),
      }));
      setIndisponibilidades(indisponibilidadesAtualizadas);
    } catch (error) {
      console.error('Erro ao registrar indisponibilidade', error);
      toast.error('Erro ao registrar indisponibilidade.');
    }
  };

  const handleDeleteIndisponibilidade = async () => {
    if (idToDelete === null) return;

    try {
      await deleteIndisponibilidade(accessToken!, idToDelete);
      toast.success('Indisponibilidade excluída com sucesso.');

      const updatedIndisponibilidades = await getIndisponibilidades(accessToken!);
      const indisponibilidadesAtualizadas = updatedIndisponibilidades.map((ind) => ({
        ...ind,
        HoraAgendamento: ind.HoraAgendamento || "Dia Todo",
        DiaTodo: !ind.HoraAgendamento,
        DataAgendamento: format(new Date(ind.DataAgendamento), 'dd/MM/yyyy'),
      }));
      setIndisponibilidades(indisponibilidadesAtualizadas);
      setModalVisible(false);
      setIdToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir indisponibilidade', error);
      toast.error('Erro ao excluir indisponibilidade.');
    }
  };

  const openModal = (id: number) => {
    setIdToDelete(id);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setIdToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <Toaster />
      <div className="flex-grow flex flex-col items-center p-4">
        <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Gerenciar Horários de Trabalho</h1>

          {editingHorario ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="horarioInicio" className="block text-sm font-medium text-gray-700">
                  Horário de Início
                </label>
                <input
                  type="time"
                  id="horarioInicio"
                  name="horarioInicio"
                  value={editingHorario.horarioInicio}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="horarioFim" className="block text-sm font-medium text-gray-700">
                  Horário de Fim
                </label>
                <input
                  type="time"
                  id="horarioFim"
                  name="horarioFim"
                  value={editingHorario.horarioFim}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="intervaloHorario" className="block text-sm font-medium text-gray-700">
                  Intervalo de Tempo (em minutos)
                </label>
                <input
                  type="number"
                  id="intervaloHorario"
                  name="intervaloHorario"
                  value={editingHorario.intervaloHorario}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setEditingHorario(null)}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdate}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ml-2"
                >
                  Atualizar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <ul className="space-y-2">
                {horarios.map((horario) => (
                  <li key={horario.id} className="bg-white p-4 rounded-md shadow-sm flex justify-between items-center">
                    {horario.horarioInicio} - {horario.horarioFim} (Intervalo: {horario.intervaloHorario} minutos)
                    <button
                      onClick={() => handleEditClick(horario)}
                      className="ml-4 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                  </li>
                ))}
              </ul>

              <h2 className="text-xl font-bold mt-8 mb-4 text-center">Registrar Horário Indisponível</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="dataIndisponivel" className="block text-sm font-medium text-gray-700">
                    Data
                  </label>
                  <input
                    type="date"
                    id="dataIndisponivel"
                    name="dataIndisponivel"
                    value={dataIndisponivel}
                    onChange={(e) => setDataIndisponivel(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="horaIndisponivel" className="block text-sm font-medium text-gray-700">
                    Horário
                  </label>
                  <select
                    id="horaIndisponivel"
                    name="horaIndisponivel"
                    value={horaIndisponivel}
                    onChange={(e) => setHoraIndisponivel(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={diaTodo}
                  >
                    <option value="">Selecione um horário</option>
                    {horariosDisponiveis.map((horario, index) => (
                      <option key={index} value={horario}>
                        {horario}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="diaTodo" className="block text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      id="diaTodo"
                      name="diaTodo"
                      checked={diaTodo}
                      onChange={(e) => setDiaTodo(e.target.checked)}
                      className="mr-2"
                    />
                    Dia Todo
                  </label>
                </div>
                <button
                  onClick={handleRegistrarIndisponibilidade}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Registrar Indisponibilidade
                </button>
              </div>

              <h2 className="text-xl font-bold mt-8 mb-4 text-center">Indisponibilidades Registradas</h2>
              <ul className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent scrollbar-thumb-rounded-full">
                {indisponibilidades.map((ind) => (
                  <li key={ind.CodigoAgendamento} className="bg-white p-4 rounded-md shadow-sm flex justify-between items-center">
                    {ind.DataAgendamento} - {ind.HoraAgendamento}
                    <button
                      onClick={() => openModal(ind.CodigoAgendamento!)}
                      className="ml-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Excluir
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {modalVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Confirmar Exclusão</h2>
            <p>Tem certeza que deseja excluir esta indisponibilidade?</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteIndisponibilidade}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarHorarios;
