import React, { useEffect, useState, useRef } from "react";
import Modal from "react-modal";
import { Horario } from "../models/Horario";
import { getUsuarioById } from "../services/usuarioService";
import { getVeiculos } from "../services/veiculoService";
import { getTransportadora } from "../services/transportadoraService";
import { addAgendamento } from "../services/agendamentoService";
import { getProdutos } from "../services/produtoService";
import { getSafras } from "../services/safraService";
import { useAuth } from "../context/AuthContext";
import { Usuario } from "../models/Usuario";
import { Veiculo } from "../models/Veiculo";
import { Transportadora } from "../models/Transportadora";
import { Produto } from "../models/Produto";
import { Safra } from "../models/Safra";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "../../firebaseConfig";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaTimes } from "react-icons/fa";

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
  const [safras, setSafras] = useState<Safra[]>([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<string>("");
  const [produto, setProduto] = useState<string>("");
  const [quantidade, setQuantidade] = useState<string>("");
  const [safraSelecionada, setSafraSelecionada] = useState<string>("");
  const [observacao, setObservacao] = useState<string>("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadTask, setUploadTask] = useState<any>(null);
  const [arquivoUrl, setArquivoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleRemoveArquivo = () => {
    setArquivo(null);
    setArquivoUrl(null);
    setUploadProgress(0);
    setUploadTask(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

          const safrasData = await getSafras(token);
          setSafras(safrasData);

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

  const tipoAgendamento = localStorage.getItem("TipoAgendamento") || "carga";

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
        "Tipo de arquivo não permitido. Tipos permitidos: .jpg, .png, .pdf, .docx, .xls e .xlsx."
      );
      return false;
    }

    if (file.size > maxSize) {
      toast.error("O arquivo deve ter no máximo 10 MB.");
      return false;
    }

    return true;
  };

  const handlePrepareUpload = (file: File) => {
    if (!validateFile(file)) return;

    const storageRef = ref(storage, `uploads/${file.name}`);
    const task = uploadBytesResumable(storageRef, file, { cacheControl: 'no-store' });
    setUploadTask(task);

    task.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error: unknown) => {
        console.error("Erro ao preparar upload:", error);
        toast.error("Erro ao preparar upload do arquivo.");
      }
    );
  };

  const finalizeUpload = async (): Promise<string | null> => {
    if (!uploadTask) return null;

    return new Promise<string | null>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error: unknown) => {
          console.error("Erro ao finalizar upload:", error);
          toast.error("Erro ao finalizar upload do arquivo.");
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

  // Quando um novo arquivo é selecionado, ele automaticamente inicia o pré-processamento
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setArquivo(file);
    if (file) {
      handlePrepareUpload(file);
    }
  };

  const handleAgendar = async () => {
    if (isSubmitting) return;

    if (!usuario || !veiculoSelecionado || !selectedDate || !horarioSelecionado) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    setIsSubmitting(true);

    let urlArquivo: string | null = null;
    if (uploadTask) {
      urlArquivo = await finalizeUpload();
      if (!urlArquivo) {
        setIsSubmitting(false);
        return;
      }
    }

    const novoAgendamento = {
      CodigoUsuario: usuario.CodigoUsuario,
      CodigoVeiculo: Number(veiculoSelecionado),
      CodigoProduto: produto ? Number(produto) : null,
      CodigoSafra: Number(safraSelecionada),
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

    try {
      await addAgendamento(token!, novoAgendamento);
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
      <Toaster position="top-right" containerClassName='mt-20' />
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

            {/* Dados do Agendamento */}
            <div className="border p-3 rounded-lg relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Dados do Agendamento</h3>
                <div
                  className={`w-16 h-9 ${corTipoAgendamento} rounded border border-gray-300 flex items-center justify-center text-white font-bold text-sm`}
                >
                  {tipoAgendamento === "carga" ? "Carga" : "Descarga"}
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <div>
                  <strong>Data:</strong> {selectedDate.toLocaleDateString()}
                </div>
                <div>
                  <strong>Horário:</strong> {horarioSelecionado.horarioInicio} -{" "}
                  {horarioSelecionado.horarioFim}
                </div>
              </div>

              <div className="mt-2">
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

              <div className="mt-2">
                <label>
                  <strong>Safra:</strong>
                </label>
                <select
                  className="border rounded p-2 w-full"
                  value={safraSelecionada}
                  onChange={(e) => setSafraSelecionada(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Selecione a Safra</option>
                  {safras
                    .filter((safra) => safra.SituacaoSafra === 1)
                    .map((safra) => (
                      <option key={safra.CodigoSafra} value={safra.CodigoSafra}>
                        {safra.AnoSafra}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mt-2">
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

              <div className="mt-2">
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

              {/* Upload de Arquivo */}
              <div className="mb-4">
                <label>
                  <strong>Upload de Arquivo:</strong>
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    className="border rounded p-2 w-full"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={isSubmitting}
                  />
                  {arquivo && (
                    <button
                      onClick={handleRemoveArquivo}
                      className="ml-2 text-red-600 hover:text-red-800"
                      title="Remover arquivo"
                    >
                      <FaTimes size={18} />
                    </button>
                  )}
                </div>

                {arquivo && (
                  <div className="mt-2">
                    <p>Progresso do upload: {uploadProgress}%</p>
                    {arquivoUrl && (
                      <p className="mt-1">
                        Arquivo disponível em:{" "}
                        <a
                          href={arquivoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-blue-600"
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
              className={`bg-blue-500 text-white py-2 px-4 rounded mt-4 flex items-center justify-center ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? <FaSpinner className="animate-spin text-2xl" /> : "Confirmar Agendamento"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RevisarDadosAgendamento;