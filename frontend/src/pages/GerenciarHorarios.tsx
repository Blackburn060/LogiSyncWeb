import React, { useEffect, useState } from 'react';
import { getHorarios, updateHorario } from '../services/horarioService';
import { Horario } from '../models/Horario';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';

const GerenciarHorarios: React.FC = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null);

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const data = await getHorarios();
        setHorarios(data);
      } catch (error) {
        console.error('Erro ao carregar horários', error);
      }
    };

    fetchHorarios();
  }, []);

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
        
        // Recarregar os horários atualizados
        const updatedHorarios = await getHorarios();
        setHorarios(updatedHorarios);
      } catch (error) {
        console.error('Erro ao atualizar horário', error);
        toast.error('Erro ao atualizar horário.');
      }
    }
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
              <h2 className="text-xl font-bold mb-4 text-center">Horários Cadastrados</h2>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GerenciarHorarios;
