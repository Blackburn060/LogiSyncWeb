import React, { useState, useEffect } from 'react';
import { Veiculo } from '../models/Veiculo';

interface VeiculoFormProps {
  veiculo: Partial<Veiculo>;
  onSave: (veiculo: Partial<Veiculo>) => Promise<void>;
  onCancel: () => void;
}

const VeiculoForm: React.FC<VeiculoFormProps> = ({ veiculo: initialVeiculo, onSave, onCancel }) => {
  const [veiculo, setVeiculo] = useState<Partial<Veiculo>>(initialVeiculo);

  useEffect(() => {
    setVeiculo(initialVeiculo);
  }, [initialVeiculo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVeiculo(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(veiculo);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">{veiculo.CodigoVeiculo ? 'Editar Veículo' : 'Novo Veículo'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Nome Veículo</label>
              <input
                type="text"
                name="NomeVeiculo"
                value={veiculo.NomeVeiculo || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Placa</label>
              <input
                type="text"
                name="Placa"
                value={veiculo.Placa || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Marca</label>
              <input
                type="text"
                name="Marca"
                value={veiculo.Marca || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Modelo/Tipo</label>
              <input
                type="text"
                name="ModeloTipo"
                value={veiculo.ModeloTipo || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Ano de Fabricação</label>
              <input
                type="number"
                name="AnoFabricacao"
                value={veiculo.AnoFabricacao || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Cor</label>
              <input
                type="text"
                name="Cor"
                value={veiculo.Cor || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Capacidade de Carga</label>
              <input
                type="number"
                name="CapacidadeCarga"
                value={veiculo.CapacidadeCarga || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="mr-4 px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VeiculoForm;
