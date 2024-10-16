import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { Horario } from "../models/Horario";
import { getUsuarioById } from "../services/usuarioService";
import { getVeiculos } from "../services/veiculoService";
import { getTransportadora } from "../services/transportadoraService";
import { addAgendamento } from "../services/agendamentoService";
import { getProdutos } from "../services/produtoService";
import { getSafras } from "../services/safraService"; // Importar o serviço de safras
import { useAuth } from "../context/AuthContext";
import { Usuario } from "../models/Usuario";
import { Veiculo } from "../models/Veiculo";
import { Transportadora } from "../models/Transportadora";
import { Produto } from "../models/Produto";
import { Safra } from "../models/Safra"; // Importar o modelo de Safra
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "../../firebaseConfig";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface RevisarDadosAgendamentoProps {
  selectedDate: Date;
  horarioSelecionado: Horario;
  onClose: () => void;
}

const RevisarDadosAgendamento: React.FC<RevisarDadosAgendamentoProps> = ({
  selectedDate,
  horarioSelecionado,
  onClose,
}) => {
  const { token, user } = useAuth();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [transportadora, setTransportadora] = useState<Transportadora | null>(
    null
  );
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [safras, setSafras] = useState<Safra[]>([]); // Estado para armazenar as safras
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<string>("");
  const [produto, setProduto] = useState<string>("");
  const [quantidade, setQuantidade] = useState<string>("");
  const [safraSelecionada, setSafraSelecionada] = useState<string>(""); // Armazena a safra selecionada
  const [observacao, setObservacao] = useState<string>("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [arquivoUrl, setArquivoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (token && user) {
        try {
          const usuarioData = await getUsuarioById(token, Number(user.id));
          setUsuario(usuarioData);

          const veiculosData = await getVeiculos(token);
          setVeiculos(
            veiculosData.filter((veiculo) => veiculo.SituacaoVeiculo === 1)
          );

          const produtosData = await getProdutos(token);
          setProdutos(produtosData);

          const safrasData = await getSafras(token); // Buscar safras do serviço
          setSafras(safrasData); // Armazena as safras no estado

          if (usuarioData.CodigoTransportadora) {
            const transportadoraData = await getTransportadora(
              token,
              usuarioData.CodigoTransportadora
            );
            setTransportadora(transportadoraData);
          }
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        }
      }
    };

    fetchData();
  }, [token, user]);

  // Define o tipo de agendamento com base em uma informação existente ou armazenada
  const tipoAgendamento = localStorage.getItem("TipoAgendamento") || "carga";

  // Escolha uma cor diferente para cada tipo de agendamento
  const corTipoAgendamento =
    tipoAgendamento === "carga" ? "bg-blue-500" : "bg-green-500";

  const validateFile = (file: File | null): boolean => {
    if (!file) return false;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      toast.error(
        "Tipo de arquivo não permitido. Aceitamos apenas .jpg, .png, .pdf, .docx, .xls e .xlsx."
      );
      return false;
    }

    if (file.size > maxSize) {
      toast.error("O arquivo deve ter no máximo 10 MB.");
      return false;
    }

    return true;
  };

  const handleUploadArquivo = async (): Promise<string | null> => {
    if (!arquivo || !validateFile(arquivo)) return null;

    const storageRef = ref(storage, `uploads/${arquivo.name}`);
    const uploadTask = uploadBytesResumable(storageRef, arquivo);

    return new Promise<string | null>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot: UploadTaskSnapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error: unknown) => {
          console.error("Erro ao fazer upload:", error);
          toast.error("Erro ao fazer upload do arquivo.");
          reject(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL: string) => {
              setArquivoUrl(downloadURL);
              resolve(downloadURL);
            })
            .catch((error: unknown) => {
              console.error("Erro ao obter URL do download:", error);
              toast.error("Erro ao obter URL do arquivo.");
              reject(null);
            });
        }
      );
    });
  };

  const handleAgendar = async () => {
    if (isSubmitting) return;

    if (
      !usuario ||
      !veiculoSelecionado ||
      !selectedDate ||
      !horarioSelecionado ||
      !safraSelecionada
    ) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    let urlArquivo: string | null = null;

    if (arquivo) {
      try {
        urlArquivo = await handleUploadArquivo();
        if (!urlArquivo) {
          throw new Error("Falha no upload do arquivo.");
        }
      } catch (error) {
        setIsSubmitting(false);
        return;
      }
    }

    const novoAgendamento = {
      CodigoUsuario: usuario.CodigoUsuario,
      CodigoVeiculo: Number(veiculoSelecionado),
      CodigoProduto: produto ? Number(produto) : null,
      CodigoSafra: Number(safraSelecionada), // Adicionando o código da safra
      CodigoTransportadora: transportadora?.CodigoTransportadora || null,
      DataAgendamento: selectedDate.toISOString().split("T")[0],
      HoraAgendamento: `${horarioSelecionado.horarioInicio} - ${horarioSelecionado.horarioFim}`,
      Observacao: observacao,
      QuantidadeAgendamento: quantidade ? Number(quantidade) : null,
      ArquivoAnexado: urlArquivo || null,
      TipoAgendamento: tipoAgendamento,
      SituacaoAgendamento: "Pendente",
      DiaTodo: false,
    };

    setIsSubmitting(true);

    try {
      const response = await addAgendamento(token!, novoAgendamento);
      toast.success("Agendamento realizado com sucesso!");
      navigate("/agendamentos");
    } catch (error) {
      console.error("Erro ao realizar agendamento:", error);
      toast.error("Erro ao realizar agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
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
              <div>
                <strong>Nome:</strong>{" "}
                {usuario?.NomeCompleto || "Não disponível"}
              </div>
              <div>
                <strong>Telefone:</strong>{" "}
                {usuario?.NumeroCelular || "Não disponível"}
              </div>
              <div>
                <strong>CPF:</strong> {usuario?.CPF || "Não disponível"}
              </div>
            </div>

            {/* Transportadora */}
            <div className="border p-3 rounded-lg">
              <h3 className="text-lg font-semibold mb-1">Transportadora</h3>
              <div>
                <strong>Nome fantasia:</strong>{" "}
                {transportadora?.NomeFantasia || "Não disponível"}
              </div>
              <div>
                <strong>Empresa:</strong>{" "}
                {transportadora?.Nome || "Transportadora não registrada"}
              </div>
              <div>
                <strong>CPF/CNPJ:</strong>{" "}
                {transportadora?.CNPJ || "Não disponível"}
              </div>
            </div>

            {/* Veículo */}
            <div className="border p-3 rounded-lg">
              <h3 className="text-lg font-semibold mb-1">Veículo</h3>
              <select
                className="border rounded p-2 w-full"
                value={veiculoSelecionado}
                onChange={(e) => setVeiculoSelecionado(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Selecione</option>
                {veiculos.map((veiculo) => (
                  <option
                    key={veiculo.CodigoVeiculo}
                    value={veiculo.CodigoVeiculo}
                  >
                    {veiculo.NomeVeiculo}
                  </option>
                ))}
              </select>
            </div>

            {/* Safra */}
            <div className="border p-3 rounded-lg">
              <h3 className="text-lg font-semibold mb-1">Safra</h3>
              <select
                className="border rounded p-2 w-full"
                value={safraSelecionada}
                onChange={(e) => setSafraSelecionada(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Selecione a Safra</option>
                {safras
                  .filter((safra) => safra.SituacaoSafra === 1) // Apenas safras ativas
                  .map((safra) => (
                    <option key={safra.CodigoSafra} value={safra.CodigoSafra}>
                      {safra.AnoSafra} {/* Exibe apenas o ano */}
                    </option>
                  ))}
              </select>
            </div>

            {/* Dados do Agendamento */}
            <div className="border p-3 rounded-lg relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Dados do Agendamento</h3>
                {/* Indicador do Tipo de Agendamento como quadrado à direita */}
                <div
                  className={`w-16 h-9 ${corTipoAgendamento} rounded border border-gray-300 flex items-center justify-center text-white font-bold text-sm`}
                >
                  {tipoAgendamento === "carga" ? "Carga" : "Descarga"}
                </div>
              </div>

              <div className="flex space-x-2 mb-4">
                <div>
                  <strong>Data:</strong> {selectedDate.toLocaleDateString()}
                </div>
                <div>
                  <strong>Horário:</strong> {horarioSelecionado.horarioInicio} -{" "}
                  {horarioSelecionado.horarioFim}
                </div>
              </div>

              <div className="mb-2">
                <label>
                  <strong>Produto:</strong>
                </label>
                <select
                  className="border rounded p-1 w-full"
                  value={produto}
                  onChange={(e) => setProduto(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Selecione</option>
                  {produtos.map((produto) => (
                    <option
                      key={produto.CodigoProduto}
                      value={produto.CodigoProduto}
                    >
                      {produto.DescricaoProduto}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>
                  <strong>Quantidade:</strong>
                </label>
                <input
                  type="text"
                  className="border rounded p-1 w-full"
                  placeholder="Quantidade"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label>
                  <strong>Observação:</strong>
                </label>
                <textarea
                  className="border rounded p-2 w-full"
                  placeholder="Insira uma observação"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  disabled={isSubmitting}
                ></textarea>
              </div>
              <div>
                <label>
                  <strong>Upload de Arquivo:</strong>
                </label>
                <input
                  type="file"
                  className="border rounded p-2 w-full"
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                  disabled={isSubmitting}
                />
                {arquivo && (
                  <div className="mt-2">
                    <p>Progresso do upload: {uploadProgress}%</p>
                    {arquivoUrl && (
                      <p>
                        Arquivo disponível em:{" "}
                        <a
                          href={arquivoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {arquivoUrl}
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleAgendar}
              className={`bg-blue-500 text-white py-2 px-4 rounded mt-4 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Aguarde..." : "Confirmar Agendamento"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RevisarDadosAgendamento;
