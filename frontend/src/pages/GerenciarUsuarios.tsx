import React, { useEffect, useState } from 'react';
import { getAllUsuarios, updateUsuario, checkEmailExists, resetarSenhaUsuario } from '../services/usuarioService';
import { Usuario } from '../models/Usuario';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, RowSelectionOptions } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import toast, { Toaster } from 'react-hot-toast';
import Modal from 'react-modal';
import { FaSpinner } from 'react-icons/fa';

const GerenciarUsuarios: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [modifiedRows, setModifiedRows] = useState<{ [key: number]: boolean }>({});
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const { token, user } = useAuth();
    const [originalEmails, setOriginalEmails] = useState<{ [key: number]: string }>({});

    // Configuração das colunas da AG Grid
    const [columnDefs] = useState<ColDef<Usuario>[]>([
        { headerName: 'Nome Completo', field: 'NomeCompleto', sortable: true, filter: true, editable: true },
        { headerName: 'Email', field: 'Email', sortable: true, filter: true, editable: true },
        { headerName: 'CPF', field: 'CPF', sortable: true, filter: true },
        { headerName: 'Número Celular', field: 'NumeroCelular', sortable: true, filter: true, editable: true },
        {
            headerName: 'Tipo de Usuário',
            field: 'TipoUsuario',
            sortable: true,
            filter: true,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['administrador', 'gerente', 'portaria', 'patio', 'motorista'],
            },
            cellRenderer: (params: any) => {
                switch (params.value) {
                    case 'administrador':
                        return 'Administrador';
                    case 'gerente':
                        return 'Gerente';
                    case 'portaria':
                        return 'Portaria';
                    case 'patio':
                        return 'Pátio';
                    case 'motorista':
                        return 'Motorista';
                    default:
                        return params.value;
                }
            },
        },
        {
            headerName: 'Situação',
            field: 'SituacaoUsuario',
            sortable: true,
            filter: true,
            editable: false,
            cellRenderer: (params: any) => {
                const isChecked = params.value === 1;
                return (
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                            const newValue = isChecked ? 0 : 1;
                            params.node.setDataValue(params.colDef.field, newValue);
                        }}
                    />
                );
            },
            cellStyle: (params: any) => {
                return {
                    color: params.value === 1 ? 'green' : 'red',
                    fontWeight: 'bold',
                };
            },
        },
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
        'bg-yellow-200': (params: any) => modifiedRows[params.data.CodigoUsuario],
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

    // Busca todos os usuários ao carregar o componente
    useEffect(() => {
        const fetchUsuarios = async () => {
            if (!token) {
                console.error('Token não encontrado');
                return;
            }

            try {
                setIsLoading(true);
                const response = await getAllUsuarios(token);
                setUsuarios(response);

                // Armazena os e-mails originais
                const emailMap = response.reduce((acc, usuario) => {
                    acc[usuario.CodigoUsuario] = usuario.Email;
                    return acc;
                }, {} as { [key: number]: string });
                setOriginalEmails(emailMap);

            } catch (error) {
                console.error('Erro ao buscar usuários', error);
                toast.error('Erro ao buscar usuários');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsuarios();
    }, [token]);

    // Função para verificar se o e-mail já está em uso
    const checkEmailBeforeSave = async (usuario: Partial<Usuario>): Promise<boolean> => {
        const originalEmail = originalEmails[usuario.CodigoUsuario!];

        if (!usuario.Email || usuario.Email === originalEmail) {
            return true;
        }

        try {
            const emailExists = await checkEmailExists(usuario.Email, token!);
            if (emailExists) {
                toast.error(<span>O e-mail <strong>{usuario.Email}</strong> já está em uso por outro usuário.</span>);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Erro ao verificar e-mail:', error);
            toast.error('Erro ao verificar e-mail.');
            return false;
        }
    };

    // Função para editar um usuário (atualiza o estado local)
    const handleEdit = (usuario: Partial<Usuario>) => {
        setUsuarios((prevUsuarios) =>
            prevUsuarios.map((u) => (u.CodigoUsuario === usuario.CodigoUsuario ? { ...u, ...usuario } : u))
        );
        toast.success('Usuário atualizado localmente. Salve para persistir.');
    };

    // Verifica se o e-mail foi alterado e se já está em uso
    const handleCellValueChanged = async (params: any) => {
        const { data, colDef, newValue, oldValue } = params;

        if (colDef.field === 'Email' && newValue !== oldValue) {
            const isEmailValid = await checkEmailBeforeSave(data);

            if (!isEmailValid) {
                params.node.setDataValue(colDef.field, oldValue);
            } else {
                setModifiedRows((prev) => ({
                    ...prev,
                    [data.CodigoUsuario]: true,
                }));
            }
        } else {
            setModifiedRows((prev) => ({
                ...prev,
                [data.CodigoUsuario]: true,
            }));
            handleEdit(data);
        }
    };

    // Controla a seleção dos usuários
    const handleSelectionChanged = (event: any) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedIds = selectedNodes.map((node: any) => node.data.CodigoUsuario);
        setSelectedUsers(selectedIds);
    };

    const openSaveModal = () => {
        setIsSaveModalOpen(true);
    };

    const closeSaveModal = () => {
        setIsSaveModalOpen(false);
    };

    const handleSave = async () => {
        if (!token || !user) {
            console.error('Token ou usuário logado não encontrados');
            return;
        }

        setIsSaving(true);
        const modifiedUsers = usuarios.filter((usuario) => modifiedRows[usuario.CodigoUsuario]);

        if (modifiedUsers.length === 0) {
            toast.error('Nenhum usuário foi alterado.');
            setIsSaving(false);
            return;
        }

        try {
            await Promise.all(
                modifiedUsers.map(async (usuario) => {
                    const usuarioAtualizado = { ...usuario };
                    delete usuarioAtualizado.Senha;
                    usuarioAtualizado.UsuarioAlteracao = user.id;

                    await updateUsuario(token, usuario.CodigoUsuario!, usuarioAtualizado);
                })
            );
            toast.success('Usuários modificados foram atualizados com sucesso!');
            setModifiedRows({});
            closeSaveModal();
        } catch (error) {
            console.error('Erro ao atualizar usuários', error);
            toast.error('Erro ao atualizar usuários.');
        } finally {
            setIsSaving(false);
        }
    };

    // Função para abrir o modal de reset de senha
    const openResetModal = () => {
        setIsModalOpen(true);
    };

    // Função para fechar o modal de reset de senha
    const closeResetModal = () => {
        setIsModalOpen(false);
    };

    // Função para resetar as senhas dos usuários selecionados
    const handleResetSenha = async () => {
        setIsResetting(true);
        try {
            await resetarSenhaUsuario(token!, selectedUsers);
            toast.success('Senhas resetadas e e-mails enviados!');
            setSelectedUsers([]);
            closeResetModal();
        } catch (error) {
            console.error('Erro ao resetar as senhas', error);
            toast.error('Erro ao resetar as senhas.');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Toaster position="top-right" />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Gerenciar Usuários</h1>

                <div>
                    <div className="ag-theme-quartz" style={{ height: 500, width: '100%' }}>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <l-helix size="45" speed="2.5" color="black"></l-helix>
                            </div>
                        ) : (
                            <AgGridReact
                                rowData={usuarios}
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
                            onClick={openResetModal}
                            className={`${selectedUsers.length > 0
                                ? 'bg-red-500 hover:bg-red-700'
                                : 'bg-gray-300 cursor-not-allowed'
                                } text-white font-bold py-2 px-4 rounded`}
                            disabled={selectedUsers.length === 0}
                        >
                            Resetar Senhas
                        </button>
                    </div>
                </div>

            </div>

            {/* Modal de Confirmação para Salvar Alterações */}
            <Modal isOpen={isSaveModalOpen} onRequestClose={closeSaveModal} contentLabel="Confirmar Salvamento" className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" overlayClassName="fixed inset-0 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                    <h2 className="text-xl font-bold mb-4">Confirmar Salvamento</h2>
                    <p>Tem certeza que deseja salvar as alterações nos usuários modificados?</p>
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

            {/* Modal de Confirmação para Resetar Senhas */}
            <Modal isOpen={isModalOpen} onRequestClose={closeResetModal} contentLabel="Confirmar Reset de Senha" className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" overlayClassName="fixed inset-0 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                    <h2 className="text-xl font-bold mb-4">Confirmar Reset de Senha</h2>
                    <p>Tem certeza que deseja resetar a senha dos usuários selecionados?</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            onClick={closeResetModal}
                            className="bg-gray-400 text-white font-bold py-2 px-4 rounded"
                            disabled={isResetting}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleResetSenha}
                            className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-800 flex items-center"
                            disabled={isResetting}
                        >
                            {isResetting ? (
                                <FaSpinner className="animate-spin text-3xl" />
                            ) : (
                                "Confirmar"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

export default GerenciarUsuarios;
