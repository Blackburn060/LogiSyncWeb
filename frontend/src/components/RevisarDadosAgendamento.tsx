import React from 'react';
import Modal from 'react-modal';
import { Horario } from '../models/Horario';

interface RevisarDadosAgendamentoProps {
  selectedDate: Date;
  horarioSelecionado: Horario;
  onClose: () => void;
}

const RevisarDadosAgendamento: React.FC<RevisarDadosAgendamentoProps> = ({ selectedDate, horarioSelecionado, onClose }) => {
  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      contentLabel="Revisar Agendamento"
      className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full h-full overflow-y-auto"
      overlayClassName="bg-black bg-opacity-50 fixed inset-0 flex justify-center items-center"
    >
      <div className="flex flex-col space-y-4 h-full">
        <h2 className="text-xl font-bold text-center">Revisar Agendamento</h2>
        
        {/* Dados Pessoais */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Dados Pessoais</h3>
          <div><strong>Nome:</strong> Marcelo Tizio Tizo</div>
          <div><strong>Telefone:</strong> (62) 9 9958-3265</div>
          <div><strong>CPF:</strong> 710.584.369-85</div>
        </div>

        {/* Transportadora */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Transportadora</h3>
          <div><strong>Nome fantasia:</strong> Júlio César RdSa</div>
          <div><strong>Empresa:</strong> RdSA transporte</div>
          <div><strong>CPF/CNPJ:</strong> 710.584.369-85</div>
        </div>

        {/* Veículo */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Veículo</h3>
          <select className="border rounded p-2 w-full">
            <option value="">Selecione</option>
            <option value="Veiculo1">Veículo 1</option>
            <option value="Veiculo2">Veículo 2</option>
          </select>
        </div>

        {/* Dados do Agendamento */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Dados do Agendamento</h3>
          <div><strong>Data:</strong> {selectedDate.toLocaleDateString()}</div>
          <div><strong>Horário:</strong> {horarioSelecionado.horarioInicio}</div>
          <div>
            <label><strong>Produto (Opcional):</strong></label>
            <select className="border rounded p-2 w-full">
              <option value="">Selecione</option>
              <option value="Produto1">Produto 1</option>
              <option value="Produto2">Produto 2</option>
            </select>
          </div>
          <div>
            <label><strong>Tipo da carga (Opcional):</strong></label>
            <select className="border rounded p-2 w-full">
              <option value="">Selecione</option>
              <option value="Tipo1">Tipo 1</option>
              <option value="Tipo2">Tipo 2</option>
            </select>
          </div>
          <div>
            <label><strong>Quantidade (Opcional):</strong></label>
            <input type="text" className="border rounded p-2 w-full" placeholder="Quantidade" />
          </div>
          <div>
            <label><strong>Observação:</strong></label>
            <textarea className="border rounded p-2 w-full" placeholder="Insira uma observação"></textarea>
          </div>
          <div>
            <label><strong>Upload de Arquivo:</strong></label>
            <input type="file" className="border rounded p-2 w-full" />
          </div>
        </div>

        <button
          onClick={onClose}
          className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
};

export default RevisarDadosAgendamento;
