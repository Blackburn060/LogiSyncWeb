import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Horario } from '../models/Horario';
import { getUsuario } from '../services/usuarioService';
import { getVeiculos } from '../services/veiculoService';
import { getTransportadora } from '../services/transportadoraService';
import { addAgendamento } from '../services/agendamentoService';
import { getProdutos } from '../services/produtoService';  // Importando o serviço de produtos
import { useAuth } from '../context/AuthContext';
import { Usuario } from '../models/Usuario';
import { Veiculo } from '../models/Veiculo';
import { Transportadora } from '../models/Transportadora';
import { Produto } from '../models/Produto';  // Importando o modelo de produtos

interface RevisarDadosAgendamentoProps {
  selectedDate: Date;
  horarioSelecionado: Horario;
  onClose: () => void;
}

const RevisarDadosAgendamento: React.FC<RevisarDadosAgendamentoProps> = ({ selectedDate, horarioSelecionado, onClose }) => {
  const { token, user } = useAuth();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [transportadora, setTransportadora] = useState<Transportadora | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);  // Estado para armazenar os produtos
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<string>('');
  const [produto, setProduto] = useState<string>('');
  const [quantidade, setQuantidade] = useState<string>('');
  const [observacao, setObservacao] = useState<string>('');
  const [arquivo, setArquivo] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (token && user) {
        try {
          const usuarioData = await getUsuario(token, Number(user.id));
          setUsuario(usuarioData);

          const veiculosData = await getVeiculos(token);
          setVeiculos(veiculosData.filter(veiculo => veiculo.SituacaoVeiculo === 1));

          const produtosData = await getProdutos(token);
          setProdutos(produtosData);  

          if (usuarioData.CodigoTransportadora) {
            const transportadoraData = await getTransportadora(token, usuarioData.CodigoTransportadora);
            setTransportadora(transportadoraData);
          }
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
        }
      }
    };

    fetchData();
  }, [token, user]);

  const handleAgendar = async () => {
    if (!usuario || !veiculoSelecionado || !selectedDate || !horarioSelecionado) {
      return alert('Preencha todos os campos obrigatórios!');
    }

    const tipoAgendamento = localStorage.getItem('TipoAgendamento') || 'carga';

    const novoAgendamento = {
      CodigoUsuario: usuario.CodigoUsuario,
      CodigoVeiculo: Number(veiculoSelecionado),
      CodigoProduto: produto ? Number(produto) : null,
      CodigoTransportadora: transportadora?.CodigoTransportadora || null,
      DataAgendamento: selectedDate.toISOString().split('T')[0],
      HoraAgendamento: `${horarioSelecionado.horarioInicio} - ${horarioSelecionado.horarioFim}`,
      Observacao: observacao,
      QuantidadeAgendamento: quantidade ? Number(quantidade) : null,
      ArquivoAnexado: arquivo || null,  // Aqui, você envia o arquivo como Blob ou null se não existir
      TipoAgendamento: tipoAgendamento,
      SituacaoAgendamento: 'Pendente',
      DiaTodo: false,

    };


    try {
      const response = await addAgendamento(token!, novoAgendamento);
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
  className="bg-white p-2 rounded-lg shadow-lg max-w-2xl w-full max-h-[calc(95vh-01px)] overflow-y-auto z-[1050] mt-3"
  overlayClassName="bg-black bg-opacity-50 fixed inset-0 flex justify-center items-start z-[1040]"
>
  <div className="flex flex-col h-full">
    {/* Cabeçalho Fixo */}
    <div className="sticky top-0 bg-white z-[1060] p-4 border-b border-gray-200 flex justify-between items-center">
      <h2 className="text-xl font-bold">Revisar Agendamento</h2>
      <button
        onClick={onClose}
        className="bg-red-600 text-white font-bold border border-red-600 rounded px-2 py-1 hover:bg-red-700 transition"
      >
        Fechar
      </button>
    </div>
    
    {/* Conteúdo Rolável */}
    <div className="flex flex-col space-y-2 p-4">
      {/* Dados Pessoais */}
      <div className="border p-3 rounded-lg">
        <h3 className="text-lg font-semibold mb-1">Dados Pessoais</h3>
        <div><strong>Nome:</strong> {usuario?.NomeCompleto || 'Não disponível'}</div>
        <div><strong>Telefone:</strong> {usuario?.NumeroCelular || 'Não disponível'}</div>
        <div><strong>CPF:</strong> {usuario?.CPF || 'Não disponível'}</div>
      </div>

      {/* Transportadora */}
      <div className="border p-3 rounded-lg">
        <h3 className="text-lg font-semibold mb-1">Transportadora</h3>
        <div><strong>Nome fantasia:</strong> {transportadora?.NomeFantasia || 'Não disponível'}</div>
        <div><strong>Empresa:</strong> {transportadora?.Nome || 'Transportadora não registrada'}</div>
        <div><strong>CPF/CNPJ:</strong> {transportadora?.CNPJ || 'Não disponível'}</div>
      </div>

      {/* Veículo */}
      <div className="border p-3 rounded-lg">
        <h3 className="text-lg font-semibold mb-1">Veículo</h3>
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
      <div className="border p-3 rounded-lg">
  <h3 className="text-lg font-semibold mb-1">Dados do Agendamento</h3>
  <div className="flex space-x-2 mb-4"> {/* Adiciona uma margem inferior */}
    <div><strong>Data:</strong> {selectedDate.toLocaleDateString()}</div>
    <div><strong>Horário:</strong> {horarioSelecionado.horarioInicio} - {horarioSelecionado.horarioFim}</div>
  </div>
  <div className="mb-2"> {/* Adiciona margem superior para afastar o campo do conteúdo acima */}
    <label><strong>Produto:</strong></label>
    <select className="border rounded p-1 w-full" value={produto} onChange={(e) => setProduto(e.target.value)}>
      <option value="">Selecione</option>
      {produtos.map((produto) => (
        <option key={produto.CodigoProduto} value={produto.CodigoProduto}>
          {produto.DescricaoProduto}
        </option>
      ))}
    </select>
  </div>
  <div>
    <label><strong>Quantidade:</strong></label>
    <input
      type="text"
      className="border rounded p-1 w-full"
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
  </div>
</Modal>

  
  
  );
};

export default RevisarDadosAgendamento;
