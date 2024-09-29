import React, { useEffect, useState } from 'react';
import { getProdutos, updateProduto, deleteProduto, addProduto } from '../services/produtoService';
import { Produto } from '../models/Produto';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, RowSelectionOptions } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import toast, { Toaster } from 'react-hot-toast';
import Modal from 'react-modal';
import { FaSpinner } from 'react-icons/fa';

const GerenciarProdutos: React.FC = () => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [modifiedRows, setModifiedRows] = useState<{ [key: number]: boolean }>({});
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [newProduto, setNewProduto] = useState<Produto>({
        CodigoProduto: 0,
        DescricaoProduto: '',
        Categoria: '',
        SituacaoProduto: 1,
        DataGeracao: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { token, user } = useAuth();

    const [columnDefs] = useState<ColDef<Produto>[]>([
        { headerName: 'Descrição', field: 'DescricaoProduto', sortable: true, filter: true, editable: true },
        { headerName: 'Categoria', field: 'Categoria', sortable: true, filter: true, editable: true },
        { headerName: 'Data de Geração', field: 'DataGeracao', sortable: true, filter: true, editable: false },
    ]);

    const [defaultColDef] = useState<ColDef>({
        flex: 1,
        minWidth: 150,
        filter: true,
        sortable: true,
        editable: true,
    });

    const [rowSelection] = useState<RowSelectionOptions | "single" | "multiple">(() => {
        return {
            mode: "multiRow",
        };
    });

    // Regras para destacar uma linha inteira quando ela for modificada
    const rowClassRules = {
        'bg-yellow-200': (params: any) => modifiedRows[params.data.CodigoProduto],
    };

    // Textos traduzidos para português
    const localeText = {
        page: 'Página',
        more: 'Mais',
        to: 'até',
        of: 'de',
        next: 'Próximo',
        last: 'Último',
        first: 'Primeiro',
        previous: 'Anterior',
        filterOoo: 'Filtrar...',
        applyFilter: 'Aplicar Filtro...',
        equals: 'Igual a',
        notEqual: 'Diferente de',
        lessThan: 'Menor que',
        greaterThan: 'Maior que',
        lessThanOrEqual: 'Menor ou igual a',
        greaterThanOrEqual: 'Maior ou igual a',
        inRange: 'No intervalo',
        contains: 'Contém',
        notContains: 'Não contém',
        startsWith: 'Começa com',
        endsWith: 'Termina com',
        loadingOoo: 'Carregando...',
        noRowsToShow: 'Nenhum dado para mostrar',
        pinColumn: 'Fixar Coluna',
        autoSizeThisColumn: 'Auto-ajustar esta Coluna',
        autoSizeAllColumns: 'Auto-ajustar todas as Colunas',
        resetColumns: 'Redefinir Colunas',
        export: 'Exportar',
        csvExport: 'Exportar CSV',
        excelExport: 'Exportar Excel',
        blank: 'Vazio',
        notBlank: 'Não vazio',
        pageSize: 'Itens por Página',
    };

    // Função para buscar produtos ativos
    const fetchProdutos = async () => {
        if (!token) {
            toast.error('Token não encontrado');
            return;
        }

        try {
            setIsLoading(true);
            const response = await getProdutos(token);
            const produtosAtivos = response.filter(produto => produto.SituacaoProduto === 1);
            setProdutos(produtosAtivos);
        } catch (error) {
            toast.error('Erro ao buscar produtos');
        } finally {
            setIsLoading(false);
        }
    };

    // Carregar produtos ao iniciar a página
    useEffect(() => {
        fetchProdutos();
    }, [token]);

    // Controla quando uma célula é alterada
    const handleCellValueChanged = (params: any) => {
        const { data, colDef, newValue, oldValue } = params;
        if (newValue !== oldValue) {
            setModifiedRows((prev) => ({
                ...prev,
                [data.CodigoProduto]: true,
            }));
        }
    };

    // Controla a seleção dos produtos
    const handleSelectionChanged = (event: any) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedIds = selectedNodes.map((node: any) => node.data.CodigoProduto);
        setSelectedProducts(selectedIds);
    };

    // Função para abrir o modal de salvar
    const openSaveModal = () => {
        setIsSaveModalOpen(true);
    };

    // Função para fechar o modal de salvar
    const closeSaveModal = () => {
        setIsSaveModalOpen(false);
    };

    // Função para abrir o modal de exclusão
    const openDeleteModal = () => {
        setIsModalOpen(true);
    };

    // Função para fechar o modal de exclusão
    const closeDeleteModal = () => {
        setIsModalOpen(false);
    };

    // Função para abrir o modal de novo produto
    const openNewModal = () => {
        setIsNewModalOpen(true);
    };

    // Função para fechar o modal de novo produto
    const closeNewModal = () => {
        setIsNewModalOpen(false);
    };

    // Função para salvar produtos alterados
    const handleSave = async () => {
        if (!token || !user) return;

        setIsSaving(true);
        const modifiedProducts = produtos.filter((produto) => modifiedRows[produto.CodigoProduto]);

        if (modifiedProducts.length === 0) {
            toast.error('Nenhum produto foi alterado.');
            setIsSaving(false);
            return;
        }

        try {
            await Promise.all(
                modifiedProducts.map(async (produto) => {
                    await updateProduto(token, { ...produto, UsuarioAlteracao: user.id }, produto.CodigoProduto);
                })
            );
            toast.success('Produtos atualizados com sucesso!');
            setModifiedRows({});
            closeSaveModal();
            await fetchProdutos();
        } catch (error) {
            toast.error('Erro ao atualizar produtos');
        } finally {
            setIsSaving(false);
        }
    };

    // Função para deletar produtos
    const handleDelete = async () => {
        if (!token || selectedProducts.length === 0) return;

        setIsDeleting(true);
        try {
            await Promise.all(
                selectedProducts.map(async (id) => {
                    await deleteProduto(token, id);
                })
            );
            toast.success('Produtos deletados com sucesso!');
            setSelectedProducts([]);
            closeDeleteModal();
            await fetchProdutos(); // Atualizar produtos após exclusão
        } catch (error) {
            toast.error('Erro ao deletar produtos');
        } finally {
            setIsDeleting(false);
        }
    };

    // Função para adicionar um novo produto
    const handleAddProduto = async () => {
        if (!token || !user) return;

        setIsSaving(true);
        try {
            await addProduto(token, { ...newProduto, UsuarioAlteracao: user.id });
            toast.success('Produto adicionado com sucesso!');
            setNewProduto({ CodigoProduto: 0, DescricaoProduto: '', Categoria: '', SituacaoProduto: 1, DataGeracao: '' });
            closeNewModal();
            await fetchProdutos();
        } catch (error) {
            toast.error('Erro ao adicionar produto');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Toaster position="top-right" />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Gerenciar Produtos</h1>

                <div className="flex justify-between mb-4">
                    <button onClick={openNewModal} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Novo Produto
                    </button>
                </div>

                <div>
                    <div className="ag-theme-quartz" style={{ height: 500, width: '100%' }}>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <l-helix size="45" speed="2.5" color="black"></l-helix>
                            </div>
                        ) : (
                            <AgGridReact
                                rowData={produtos}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                rowSelection={rowSelection}
                                rowClassRules={rowClassRules}
                                pagination={true}
                                paginationPageSize={20}
                                onCellValueChanged={handleCellValueChanged}
                                onSelectionChanged={handleSelectionChanged}
                                localeText={localeText}
                            />
                        )}
                    </div>

                    <div className="mt-4 flex gap-4">
                        <button
                            onClick={openSaveModal}
                            className={`${Object.keys(modifiedRows).length > 0
                                ? 'bg-logisync-color-blue-50 hover:bg-logisync-color-blue-400'
                                : 'bg-gray-300 cursor-not-allowed'
                                } text-white font-bold py-2 px-4 rounded`}
                            disabled={Object.keys(modifiedRows).length === 0}
                        >
                            Salvar Alterações
                        </button>
                        <button
                            onClick={openDeleteModal}
                            className={`${selectedProducts.length > 0
                                ? 'bg-red-600 hover:bg-red-800'
                                : 'bg-gray-300 cursor-not-allowed'
                                } text-white font-bold py-2 px-4 rounded`}
                            disabled={selectedProducts.length === 0}
                        >
                            Deletar Produtos
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmação para Salvar Alterações */}
            <Modal isOpen={isSaveModalOpen} onRequestClose={closeSaveModal} contentLabel="Confirmar Salvamento" className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" overlayClassName="fixed inset-0 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                    <h2 className="text-xl font-bold mb-4">Confirmar Salvamento</h2>
                    <p>Tem certeza que deseja salvar as alterações nos produtos modificados?</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            onClick={closeSaveModal}
                            className="bg-gray-400 text-white font-bold py-2 px-4 rounded"
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-logisync-color-blue-50 text-white font-bold py-2 px-4 rounded hover:bg-logisync-color-blue-400 flex items-center"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <FaSpinner className="animate-spin text-3xl" />
                            ) : (
                                "Confirmar"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal de Confirmação para Exclusão */}
            <Modal isOpen={isModalOpen} onRequestClose={closeDeleteModal} contentLabel="Confirmar Exclusão" className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" overlayClassName="fixed inset-0 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                    <h2 className="text-xl font-bold mb-4">Confirmar Exclusão</h2>
                    <p>Tem certeza que deseja excluir os produtos selecionados?</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            onClick={closeDeleteModal}
                            className="bg-gray-400 text-white font-bold py-2 px-4 rounded"
                            disabled={isDeleting}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-800 flex items-center"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <FaSpinner className="animate-spin text-3xl" />
                            ) : (
                                "Confirmar"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal para adicionar novo produto */}
            <Modal isOpen={isNewModalOpen} onRequestClose={closeNewModal} contentLabel="Novo Produto" className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" overlayClassName="fixed inset-0 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                    <h2 className="text-xl font-bold mb-4">Novo Produto</h2>
                    <div>
                        <input
                            type="text"
                            placeholder="Descrição do Produto"
                            value={newProduto.DescricaoProduto}
                            onChange={(e) => setNewProduto({ ...newProduto, DescricaoProduto: e.target.value })}
                            className="w-full p-2 mb-4 border border-gray-300 rounded"
                        />
                        <input
                            type="text"
                            placeholder="Categoria"
                            value={newProduto.Categoria}
                            onChange={(e) => setNewProduto({ ...newProduto, Categoria: e.target.value })}
                            className="w-full p-2 mb-4 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            onClick={closeNewModal}
                            className="bg-gray-400 text-white font-bold py-2 px-4 rounded"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAddProduto}
                            className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-800 flex items-center"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <FaSpinner className="animate-spin text-3xl" />
                            ) : (
                                "Adicionar"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GerenciarProdutos;
