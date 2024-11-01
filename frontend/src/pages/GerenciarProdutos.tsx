import React, { useEffect, useState } from 'react';
import { getProdutos, updateProduto, deleteProduto, addProduto } from '../services/produtoService';
import { Produto } from '../models/Produto';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import toast, { Toaster } from 'react-hot-toast';
import Modal from 'react-modal';
import { FaSpinner, FaEdit } from 'react-icons/fa';

const GerenciarProdutos: React.FC = () => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newProduto, setNewProduto] = useState<Produto>({
        CodigoProduto: 0,
        DescricaoProduto: '',
        Categoria: '',
        SituacaoProduto: 1,
        DataGeracao: '',
    });
    const [selectedProduto, setSelectedProduto] = useState<Partial<Produto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { token, user } = useAuth();

    const [columnDefs] = useState<ColDef<Produto>[]>([
        { headerName: 'Descrição', field: 'DescricaoProduto', sortable: true, filter: true, editable: false },
        { headerName: 'Categoria', field: 'Categoria', sortable: true, filter: true, editable: false },
        { headerName: 'Data de Geração', field: 'DataGeracao', sortable: true, filter: true, editable: false },
        {
            headerName: 'Ações',
            filter: false,
            sortable: false,
            cellRenderer: (params: { data: Produto }) => (
                <div className="flex gap-6 justify-center items-center">
                    <button onClick={() => openEditModal(params.data)} className="text-blue-500">
                        <FaEdit className="text-2xl" />
                    </button>
                    <button
                        onClick={() => openDeleteModal(params.data.CodigoProduto)}
                        className="mt-1 flex items-center justify-center font-bold bg-red-600 rounded-lg h-8 pl-2 pr-2 text-white"
                    >
                        Excluir
                    </button>
                </div>
            ),
        },
    ]);

    const [defaultColDef] = useState<ColDef>({
        flex: 1,
        minWidth: 150,
        filter: true,
        sortable: true,
    });

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
            setProdutos(response.filter((produto) => produto.SituacaoProduto === 1));
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

    // Abre o modal de edição com o produto selecionado
    const openEditModal = (produto: Produto) => {
        setSelectedProduto(produto);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedProduto(null);
        setIsEditModalOpen(false);
    };

    const openDeleteModal = (produtoId: number) => {
        setSelectedProducts([produtoId]);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setSelectedProducts([]);
        setIsModalOpen(false);
    };

    const openNewModal = () => {
        setIsNewModalOpen(true);
    };

    const closeNewModal = () => {
        setNewProduto({
            CodigoProduto: 0,
            DescricaoProduto: '',
            Categoria: '',
            SituacaoProduto: 1,
            DataGeracao: '',
        });
        setIsNewModalOpen(false);
    };

    const handleSaveEdit = async () => {
        if (!token || !user || !selectedProduto) return;

        setIsSaving(true);
        try {
            await updateProduto(token, { ...selectedProduto, UsuarioAlteracao: user.id }, selectedProduto.CodigoProduto!);
            toast.success('Produto atualizado com sucesso!');
            closeEditModal();
            await fetchProdutos();
        } catch (error) {
            toast.error('Erro ao atualizar o produto');
        } finally {
            setIsSaving(false);
        }
    };

    // Função para adicionar um novo produto
    const handleAddProduto = async () => {
        if (!token || !user) return;

        setIsSaving(true);
        try {
            await addProduto(token, { ...newProduto, UsuarioAlteracao: user.id });
            toast.success('Produto adicionado com sucesso!');
            closeNewModal();
            await fetchProdutos();
        } catch (error) {
            toast.error('Erro ao adicionar produto');
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
            closeDeleteModal();
            await fetchProdutos();
        } catch (error) {
            toast.error('Erro ao deletar produtos');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Toaster position="top-right" containerClassName="mt-20" />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Gerenciar Produtos</h1>
                <div className="flex justify-between mb-4">
                    <button onClick={openNewModal} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Novo Produto
                    </button>
                </div>
                <div>
                    <div className="ag-theme-quartz h-[26rem] w-full">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <FaSpinner className="animate-spin text-4xl" />
                            </div>
                        ) : (
                            <AgGridReact
                                rowData={produtos}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                pagination={true}
                                paginationPageSize={20}
                                localeText={localeText}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Edição */}
            <Modal
                isOpen={isEditModalOpen}
                onRequestClose={closeEditModal}
                className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                ariaHideApp={false}
            >
                {selectedProduto && (
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                        <h2 className="text-2xl font-bold mb-4">Editar Produto</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                            <input
                                type="text"
                                value={selectedProduto.DescricaoProduto || ''}
                                onChange={(e) => setSelectedProduto({ ...selectedProduto, DescricaoProduto: e.target.value })}
                                className="w-full p-2 mb-4 border border-gray-300 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                            <input
                                type="text"
                                value={selectedProduto.Categoria || ''}
                                onChange={(e) => setSelectedProduto({ ...selectedProduto, Categoria: e.target.value })}
                                className="w-full p-2 mb-4 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={closeEditModal} className="bg-gray-600 text-white font-bold py-2 px-4 rounded">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className={`bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-800 flex items-center ${(!selectedProduto.DescricaoProduto || !selectedProduto.Categoria) && "opacity-50 cursor-not-allowed"
                                    }`}
                                disabled={!selectedProduto.DescricaoProduto || !selectedProduto.Categoria || isSaving}
                            >
                                {isSaving ? <FaSpinner className="animate-spin text-2xl" /> : 'Salvar'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>


            {/* Modal para Adicionar Novo Produto */}
            <Modal
                isOpen={isNewModalOpen}
                onRequestClose={closeNewModal}
                className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                ariaHideApp={false}
            >
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                    <h2 className="text-2xl font-bold mb-4">Novo Produto</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                        <input
                            type="text"
                            value={newProduto.DescricaoProduto}
                            onChange={(e) => setNewProduto({ ...newProduto, DescricaoProduto: e.target.value })}
                            className="w-full p-2 mb-4 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                        <input
                            type="text"
                            value={newProduto.Categoria}
                            onChange={(e) => setNewProduto({ ...newProduto, Categoria: e.target.value })}
                            className="w-full p-2 mb-4 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={closeNewModal} className="bg-gray-600 text-white font-bold py-2 px-4 rounded">
                            Cancelar
                        </button>
                        <button
                            onClick={handleAddProduto}
                            className={`bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-800 flex items-center ${(!newProduto.DescricaoProduto || !newProduto.Categoria) && "opacity-50 cursor-not-allowed"
                                }`}
                            disabled={!newProduto.DescricaoProduto || !newProduto.Categoria || isSaving}
                        >
                            {isSaving ? <FaSpinner className="animate-spin text-2xl" /> : 'Adicionar'}
                        </button>
                    </div>
                </div>
            </Modal>


            {/* Modal de Confirmação para Exclusão */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeDeleteModal}
                className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                ariaHideApp={false}
            >
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                    <h2 className="text-xl font-bold mb-4">Confirmar Exclusão</h2>
                    <p>Tem certeza que deseja excluir o produto selecionado?</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={closeDeleteModal} className="bg-gray-600 text-white font-bold py-2 px-4 rounded" disabled={isDeleting}>
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-800 flex items-center"
                            disabled={isDeleting}
                        >
                            {isDeleting ? <FaSpinner className="animate-spin text-2xl" /> : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GerenciarProdutos;