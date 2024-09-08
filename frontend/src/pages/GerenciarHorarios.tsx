import React, { useEffect, useState } from 'react';
import { getHorarios, updateHorario } from '../services/horarioService';
import { Horario } from '../models/Horario';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import { registrarIndisponibilidade, getIndisponibilidades, deleteIndisponibilidade } from '../services/agendamentoService';
import { useAuth } from '../context/AuthContext';
import { Agendamento } from '../models/Agendamento';
import { format, parseISO } from 'date-fns';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ptBR } from 'date-fns/locale';

const GerenciarHorarios: React.FC = () => {
  const { user, token } = useAuth();
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null);
  const [dataIndisponivel, setDataIndisponivel] = useState<Date | null>(null);
  const [horaIndisponivel, setHoraIndisponivel] = useState<string>('');
  const [diaTodo, setDiaTodo] = useState<boolean>(false);
  const [TipoAgendamento, setTipoAgendamento] = useState<string>('carga');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<{ value: string; label: string }[]>([]);
  const [indisponibilidades, setIndisponibilidades] = useState<Agendamento[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const data = await getHorarios();
        setHorarios(data);
        gerarHorariosDisponiveis(data[0], TipoAgendamento);
      } catch (error) {
        console.error('Erro ao carregar horários', error);
      }
    };

    const fetchIndisponibilidades = async () => {
      try {
        const data = await getIndisponibilidades(token!);
        const indisponibilidadesAtualizadas = data.map((ind) => ({
          ...ind,
          HoraAgendamento: ind.HoraAgendamento || "Dia Todo",
          DiaTodo: !ind.HoraAgendamento,
          DataAgendamento: format(parseISO(ind.DataAgendamento), 'dd/MM/yyyy'),
        }));
        setIndisponibilidades(indisponibilidadesAtualizadas);
      } catch (error) {
        console.error('Erro ao carregar indisponibilidades', error);
      }
    };

    fetchHorarios();
    fetchIndisponibilidades();
  }, [token, TipoAgendamento]);

  // Gera horários disponíveis apenas com intervalos para indisponibilidade
  const gerarHorariosDisponiveis = (horario: Horario | null, tipoAgendamento: string) => {
    if (!horario) {
      setHorariosDisponiveis([]);
      return;
    }

    const intervalo = tipoAgendamento === 'carga' ? horario.intervaloCarga : horario.intervaloDescarga;
    const horariosGerados: { value: string; label: string }[] = [];
    let current = new Date(`1970-01-01T${horario.horarioInicio}:00`);
    const end = new Date(`1970-01-01T${horario.horarioFim}:00`);

    // Gera horários com intervalo
    while (current < end) {
      const next = new Date(current.getTime() + intervalo * 60000);
      if (next > end) break;

      const horaFormatada = `${current.toTimeString().substring(0, 5)} - ${next.toTimeString().substring(0, 5)}`;
      horariosGerados.push({ value: horaFormatada, label: horaFormatada });

      current = next;
    }

    setHorariosDisponiveis(horariosGerados);
  };

  const handleTipoAgendamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTipoAgendamento = e.target.value;
    setTipoAgendamento(selectedTipoAgendamento);

    if (editingHorario) {
      gerarHorariosDisponiveis(editingHorario, selectedTipoAgendamento);
    }
  };

  const handleEditClick = (horario: Horario) => {
    setEditingHorario(horario);
  };

  const handleInputChange = (name: string, value: string) => {
    if (editingHorario) {
      setEditingHorario({ ...editingHorario, [name]: value });
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
    if (!user || !token) {
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
      await registrarIndisponibilidade(token, {
        CodigoUsuario: Number(user.id),
        DataAgendamento: format(dataIndisponivel!, 'yyyy-MM-dd'),
        HoraAgendamento: diaTodo ? '' : horaIndisponivel,
        DiaTodo: diaTodo ? 1 : 0,
        TipoAgendamento: TipoAgendamento,
      });
      toast.success('Indisponibilidade registrada com sucesso.');
      setDataIndisponivel(null);
      setHoraIndisponivel('');
      setDiaTodo(false);

      const updatedIndisponibilidades = await getIndisponibilidades(token);
      const indisponibilidadesAtualizadas = updatedIndisponibilidades.map((ind) => ({
        ...ind,
        HoraAgendamento: ind.HoraAgendamento || "Dia Todo",
        DiaTodo: !ind.HoraAgendamento,
        DataAgendamento: format(parseISO(ind.DataAgendamento), 'dd/MM/yyyy'),
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
      await deleteIndisponibilidade(token!, idToDelete);
      toast.success('Indisponibilidade excluída com sucesso.');

      const updatedIndisponibilidades = await getIndisponibilidades(token!);
      const indisponibilidadesAtualizadas = updatedIndisponibilidades.map((ind) => ({
        ...ind,
        HoraAgendamento: ind.HoraAgendamento || "Dia Todo",
        DiaTodo: !ind.HoraAgendamento,
        DataAgendamento: format(parseISO(ind.DataAgendamento), 'dd/MM/yyyy'),
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
                <Select
                  id="horarioInicio"
                  name="horarioInicio"
                  value={{ label: editingHorario.horarioInicio, value: editingHorario.horarioInicio }}
                  options={horariosDisponiveis}
                  onChange={(option) => handleInputChange('horarioInicio', option?.value || '')}
                  isClearable
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="horarioFim" className="block text-sm font-medium text-gray-700">
                  Horário de Fim
                </label>
                <Select
                  id="horarioFim"
                  name="horarioFim"
                  value={{ label: editingHorario.horarioFim, value: editingHorario.horarioFim }}
                  options={horariosDisponiveis}
                  onChange={(option) => handleInputChange('horarioFim', option?.value || '')}
                  isClearable
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="intervaloCarga" className="block text-sm font-medium text-gray-700">
                  Intervalo de Carga (em minutos)
                </label>
                <input
                  type="number"
                  id="intervaloCarga"
                  name="intervaloCarga"
                  value={editingHorario.intervaloCarga}
                  onChange={(e) => handleInputChange('intervaloCarga', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="intervaloDescarga" className="block text-sm font-medium text-gray-700">
                  Intervalo de Descarga (em minutos)
                </label>
                <input
                  type="number"
                  id="intervaloDescarga"
                  name="intervaloDescarga"
                  value={editingHorario.intervaloDescarga}
                  onChange={(e) => handleInputChange('intervaloDescarga', e.target.value)}
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
              {horarios.length > 0 ? (
                <ul className="space-y-2">
                  {horarios.map((horario) => (
                    <li key={horario.id} className="bg-white p-4 rounded-md shadow-sm flex justify-between items-center">
                      {horario.horarioInicio} - {horario.horarioFim} (Intervalo de Carga: {horario.intervaloCarga} minutos, Intervalo de Descarga: {horario.intervaloDescarga} minutos)
                      <button
                        onClick={() => handleEditClick(horario)}
                        className="ml-4 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">Não há registros de horários no momento.</p>
              )}

              <h2 className="text-xl font-bold mt-8 mb-4 text-center">Registrar Horário Indisponível</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="TipoAgendamento" className="block text-sm font-medium text-gray-700">
                    Tipo de Agendamento
                  </label>
                  <select
                    id="TipoAgendamento"
                    name="TipoAgendamento"
                    value={TipoAgendamento}
                    onChange={handleTipoAgendamentoChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="carga">Carga</option>
                    <option value="descarga">Descarga</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="dataIndisponivel" className="block text-sm font-medium text-gray-700">
                    Data
                  </label>
                  <DatePicker
                    selected={dataIndisponivel}
                    onChange={(date) => setDataIndisponivel(date as Date)}
                    dateFormat="dd/MM/yyyy"
                    locale={ptBR}
                    placeholderText="Selecione uma data"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="horaIndisponivel" className="block text-sm font-medium text-gray-700">
                    Horário
                  </label>
                  <Select
                    id="horaIndisponivel"
                    name="horaIndisponivel"
                    value={{ label: horaIndisponivel, value: horaIndisponivel }}
                    options={horariosDisponiveis}
                    onChange={(option) => setHoraIndisponivel(option?.value || '')}
                    isClearable
                    isDisabled={diaTodo}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
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
              {indisponibilidades.length > 0 ? (
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
              ) : (
                <p className="text-center text-gray-500">Não há registros de indisponibilidades no momento.</p>
              )}
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
