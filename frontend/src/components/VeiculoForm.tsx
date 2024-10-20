import React, { useState, useEffect } from 'react';
import Cleave from 'cleave.js/react';
import { NumericFormat } from 'react-number-format';
import { FaSpinner } from 'react-icons/fa';
import { Veiculo } from '../models/Veiculo';

interface VeiculoFormProps {
  veiculo: Partial<Veiculo>;
  onSave: (veiculo: Partial<Veiculo>) => Promise<void>;
  onCancel: () => void;
}

const VeiculoForm: React.FC<VeiculoFormProps> = ({ veiculo: initialVeiculo, onSave, onCancel }) => {
  const [veiculo, setVeiculo] = useState<Partial<Veiculo>>(initialVeiculo);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleCapacidadeChange = (values: any) => {
    const { value } = values;
    setVeiculo(prevState => ({
      ...prevState,
      CapacidadeCarga: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = ['NomeVeiculo', 'Placa', 'Marca', 'ModeloTipo', 'AnoFabricacao', 'Cor', 'CapacidadeCarga'];
    for (const field of requiredFields) {
      if (!veiculo[field as keyof Veiculo]) {
        alert(`O campo ${field} é obrigatório.`);
        return;
      }
    }

    setIsSaving(true);

    await onSave(veiculo);

    setIsSaving(false);
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
                required
              />
            </div>

            <div>
              <label className="block mb-2">Placa</label>
              <Cleave
                name="Placa"
                value={veiculo.Placa || ''}
                onChange={handleChange}
                options={{
                  blocks: [7],
                  uppercase: true,
                }}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Ex. ABC-1234"
                required
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
                required
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
                required
              />
            </div>

            <div>
              <label className="block mb-2">Ano de Fabricação</label>
              <Cleave
                name="AnoFabricacao"
                value={veiculo.AnoFabricacao || ''}
                onChange={handleChange}
                options={{
                  numericOnly: true,
                  blocks: [4],
                }}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Ex. 2020"
                required
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
                required
              />
            </div>

            <div>
              <label className="block mb-2">Capacidade de Carga</label>
              <NumericFormat
                name="CapacidadeCarga"
                value={veiculo.CapacidadeCarga || ''}
                onValueChange={handleCapacidadeChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Ex. 20 ton"
                suffix=" ton"
                decimalScale={0}
                allowNegative={false}
                valueIsNumericString
                required
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
              disabled={isSaving}
            >
              {isSaving ? <FaSpinner className="animate-spin text-2xl" /> : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VeiculoForm;