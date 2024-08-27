import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Horario } from '../models/Horario';
import { getUsuario } from '../services/usuarioService';
import { getVeiculos } from '../services/veiculoService';
import { getTransportadora } from '../services/transportadoraService';
import { addAgendamento } from '../services/agendamentoService';
import { useAuth } from '../context/AuthContext';
import { Usuario } from '../models/Usuario';
import { Veiculo } from '../models/Veiculo';
import { Transportadora } from '../models/Transportadora';

interface RevisarDadosAgendamentoProps {
  selectedDate: Date;
  horarioSelecionado: Horario;
  onClose: () => void;
}

const RevisarDadosAgendamento: React.FC<RevisarDadosAgendamentoProps> = ({ selectedDate, horarioSelecionado, onClose }) => {
  const { accessToken, user } = useAuth();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [transportadora, setTransportadora] = useState<Transportadora | null>(null);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<string>('');
  const [produto, setProduto] = useState<string>('');
  const [tipoCarga, setTipoCarga] = useState<string>('');
  const [quantidade, setQuantidade] = useState<string>('');
  const [observacao, setObservacao] = useState<string>('');
  const [arquivo, setArquivo] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (accessToken && user) {
        try {
          const usuarioData = await getUsuario(accessToken, Number(user.id));
          console.log('Dados do usuário:', usuarioData);
          setUsuario(usuarioData);

          const veiculosData = await getVeiculos(accessToken);
          console.log('Veículos disponíveis:', veiculosData);
          setVeiculos(veiculosData.filter(veiculo => veiculo.SituacaoVeiculo === 1));

          if (usuarioData.CodigoTransportadora) {
            const transportadoraData = await getTransportadora(accessToken, usuarioData.CodigoTransportadora);
            console.log('Dados da transportadora:', transportadoraData);
            setTransportadora(transportadoraData);
          }
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
        }
      }
    };

    fetchData();
  }, [accessToken, user]);

  const handleAgendar = async () => {
    if (!usuario || !veiculoSelecionado || !selectedDate || !horarioSelecionado) {
      return alert('Preencha todos os campos obrigatórios!');
    }

    const novoAgendamento = {
      CodigoUsuario: usuario.CodigoUsuario,
      CodigoVeiculo: Number(veiculoSelecionado),
      CodigoProduto: produto ? Number(produto) : null,
      CodigoTransportadora: transportadora?.CodigoTransportadora || null,
      DataAgendamento: selectedDate.toISOString().split('T')[0],
      HoraAgendamento: `${horarioSelecionado.horarioInicio} - ${horarioSelecionado.horarioFim}`,
      Observacao: observacao,
      QuantidadeAgendamento: quantidade ? Number(quantidade) : null,
      ArquivoAnexado: arquivo ? arquivo.name : '',
      TipoAgendamento: tipoCarga,
      SituacaoAgendamento: 'Pendente',
    };

    console.log('Dados do Agendamento:', novoAgendamento);

    try {
      const response = await addAgendamento(accessToken!, novoAgendamento);
      console.log('Resposta do servidor após adicionar agendamento:', response);
      alert('Agendamento realizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao realizar agendamento:', error);
      alert('Erro ao realizar agendamento.');
    }
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      contentLabel="Revisar Agendamento"
      className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full h-full overflow-y-auto"
      overlayClassName="bg-black bg-opacity-50 fixed inset-0 flex justify-center items-center"
    >
      <div className="flex flex-col space-y-4 h-full">
        <h2 className="text-xl font-bold text-center">Revisar Agendamento</h2>
        
        {/* Dados Pessoais */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Dados Pessoais</h3>
          <div><strong>Nome:</strong> {usuario?.NomeCompleto || 'Não disponível'}</div>
          <div><strong>Telefone:</strong> {usuario?.NumeroCelular || 'Não disponível'}</div>
          <div><strong>CPF:</strong> {usuario?.CPF || 'Não disponível'}</div>
        </div>

        {/* Transportadora */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Transportadora</h3>
          <div><strong>Nome fantasia:</strong> {transportadora?.NomeFantasia || 'Não disponível'}</div>
          <div><strong>Empresa:</strong> {transportadora?.Nome || 'Transportadora não registrada'}</div>
          <div><strong>CPF/CNPJ:</strong> {transportadora?.CNPJ || 'Não disponível'}</div>
        </div>

        {/* Veículo */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Veículo</h3>
          <select
            className="border rounded p-2 w-full"
            value={veiculoSelecionado}
            onChange={(e) => setVeiculoSelecionado(e.target.value)}
          >
            <option value="">Selecione</option>
            {veiculos.map((veiculo) => (
              <option key={veiculo.CodigoVeiculo} value={veiculo.CodigoVeiculo}>
                {veiculo.NomeVeiculo}
              </option>
            ))}
          </select>
        </div>

        {/* Dados do Agendamento */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Dados do Agendamento</h3>
          <div><strong>Data:</strong> {selectedDate.toLocaleDateString()}</div>
          <div><strong>Horário:</strong> {horarioSelecionado.horarioInicio} - {horarioSelecionado.horarioFim}</div>
          <div>
            <label><strong>Produto (Opcional):</strong></label>
            <select className="border rounded p-2 w-full" value={produto} onChange={(e) => setProduto(e.target.value)}>
              <option value="">Selecione</option>
              <option value="1">Produto 1</option>
              <option value="2">Produto 2</option>
            </select>
          </div>
          <div>
            <label><strong>Tipo da carga (Opcional):</strong></label>
            <select className="border rounded p-2 w-full" value={tipoCarga} onChange={(e) => setTipoCarga(e.target.value)}>
              <option value="">Selecione</option>
              <option value="Tipo1">Tipo 1</option>
              <option value="Tipo2">Tipo 2</option>
            </select>
          </div>
          <div>
            <label><strong>Quantidade (Opcional):</strong></label>
            <input
              type="text"
              className="border rounded p-2 w-full"
              placeholder="Quantidade"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>
          <div>
            <label><strong>Observação:</strong></label>
            <textarea
              className="border rounded p-2 w-full"
              placeholder="Insira uma observação"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label><strong>Upload de Arquivo:</strong></label>
            <input type="file" className="border rounded p-2 w-full" onChange={(e) => setArquivo(e.target.files?.[0] || null)} />
          </div>
        </div>

        <button
          onClick={handleAgendar}
          className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
        >
          Confirmar Agendamento
        </button>
      </div>
    </Modal>
  );
};

export default RevisarDadosAgendamento;
