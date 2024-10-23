import React, { useEffect, useState } from 'react';
import { getAllUsuarios, addUsuario, checkEmailExists, updateUsuario, resetarSenhaUsuario, inactivateUsuario } from '../services/usuarioService';
import { Usuario } from '../models/Usuario';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import toast, { Toaster } from 'react-hot-toast';
import Modal from 'react-modal';
import { FaSpinner, FaEdit } from 'react-icons/fa';
import Cleave from 'cleave.js/react';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';

// Função para gerar uma senha aleatória
const generateRandomPassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
};

// Função para formatar CPF
const formatCPF = (cpf: string) => {
    return cpf.replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

// Função para formatar número de celular
const formatPhone = (phone: string) => {
    return phone.replace(/\D/g, '')
        .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

const GerenciarUsuarios: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [selectedUser, setSelectedUser] = useState<Partial<Usuario> | null>(null);
    const [originalEmail, setOriginalEmail] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    const { token, user } = useAuth();
    const [newUsuario, setNewUsuario] = useState<Partial<Usuario>>({
        NomeCompleto: '',
        Email: '',
        CPF: '',
        NumeroCelular: '',
        TipoUsuario: 'motorista',
    });
    const [emailError, setEmailError] = useState<string | null>(null);
    const [cpfError, setCpfError] = useState<string | null>(null);

    // Configuração das colunas da AG Grid
    const [columnDefs] = useState<ColDef<Usuario>[]>([
        { headerName: 'Nome Completo', field: 'NomeCompleto', sortable: true, filter: true },
        { headerName: 'Email', field: 'Email', sortable: true, filter: true },
        { headerName: 'CPF', field: 'CPF', sortable: true, filter: true, valueFormatter: (params) => formatCPF(params.value) },
        { headerName: 'Número Celular', field: 'NumeroCelular', sortable: true, filter: true, valueFormatter: (params) => formatPhone(params.value) },
        {
            headerName: 'Ações',
            cellRenderer: (params: { data: Usuario; }) => (
                <div className="flex gap-6">
                    <button
                        className="text-blue-500"
                        onClick={() => handleEdit(params.data)}
                    >
                        <FaEdit className="text-xl" />
                    </button>
                    <button
                        className={`font-bold text-${params.data.SituacaoUsuario === 1 ? 'red' : 'green'}-500`}
                        onClick={() => openConfirmationModal(params.data)}
                    >
                        {params.data.SituacaoUsuario === 1 ? 'Desativar' : 'Ativar'}
                    </button>
                </div>
            )
        }
    ]);

    const [defaultColDef] = useState<ColDef>({
        flex: 1,
        minWidth: 150,
        filter: true,
        sortable: true,
    });

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
            } catch (error) {
                console.error('Erro ao buscar usuários', error);
                toast.error('Erro ao buscar usuários');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsuarios();
    }, [token]);

    const handleEdit = (usuario: Usuario) => {
        setSelectedUser(usuario);
        setOriginalEmail(usuario.Email);
        setIsModalOpen(true);
    };

    const openConfirmationModal = (usuario: Usuario) => {
        setSelectedUser(usuario);
        setIsActivating(usuario.SituacaoUsuario === 0);
        setIsConfirmationModalOpen(true);
    };

    const resetSelectedUser = () => {
        setSelectedUser(null);
        setOriginalEmail(null);
        setEmailError(null);
        setCpfError(null);
    };

    const resetNewUserForm = () => {
        setNewUsuario({
            NomeCompleto: '',
            Email: '',
            CPF: '',
            NumeroCelular: '',
            TipoUsuario: 'motorista',
        });
        setEmailError(null);
        setCpfError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetSelectedUser();
    };

    const handleCloseNewUserModal = () => {
        setIsNewUserModalOpen(false);
        resetNewUserForm();
    };

    const handleCloseConfirmationModal = () => {
        setIsConfirmationModalOpen(false);
        resetSelectedUser();
    };

    const handleSaveUser = async () => {
        if (!selectedUser || !token || !user) return;

        if (!selectedUser.NomeCompleto || !selectedUser.Email || !selectedUser.CPF || !selectedUser.NumeroCelular || !selectedUser.TipoUsuario) {
            toast.error('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (cpfError || emailError) {
            toast.error('Erro nos dados informados.');
            return;
        }

        setIsSaving(true);

        try {
            await updateUsuario(token, selectedUser.CodigoUsuario!, {
                ...selectedUser,
                UsuarioAlteracao: user.id
            });

            toast.success('Usuário atualizado com sucesso!');
            setIsModalOpen(false);
            resetSelectedUser();

            const response = await getAllUsuarios(token);
            setUsuarios(response);
        } catch (error) {
            toast.error('Erro ao salvar alterações.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleActivationToggle = async () => {
        if (!selectedUser || !token) return;

        try {
            setIsSaving(true);

            if (isActivating) {
                // Ativar usuário
                await updateUsuario(token, selectedUser.CodigoUsuario!, {
                    SituacaoUsuario: 1,
                    UsuarioAlteracao: user!.id,
                });
                toast.success('Usuário ativado com sucesso!');
            } else {
                // Inativar usuário
                await inactivateUsuario(token, selectedUser.CodigoUsuario!);
                toast.success('Usuário desativado com sucesso!');
            }

            const response = await getAllUsuarios(token);
            setUsuarios(response);
            handleCloseConfirmationModal();
        } catch (error) {
            toast.error(`Erro ao ${isActivating ? 'ativar' : 'desativar'} o usuário.`);
        } finally {
            setIsSaving(false);
        }
    };

    // Função para resetar a senha de um usuário
    const handleResetarSenha = async () => {
        if (!selectedUser || !token) return;

        try {
            setIsSaving(true);
            await resetarSenhaUsuario(token, [selectedUser.CodigoUsuario!]);
            toast.success('Senha do usuário foi resetada com sucesso!');
        } catch (error) {
            toast.error('Erro ao resetar a senha do usuário.');
        } finally {
            setIsSaving(false);
        }
    };

    // Função para validar o CPF
    const validateCpf = (value: string) => {
        if (cpfValidator.isValid(value)) {
            setCpfError(null);
        } else {
            setCpfError('CPF inválido. Por favor, insira um CPF válido.');
        }
    };

    // Verificação do e-mail em ambos os modais
    const handleEmailBlur = async (email: string, currentEmail?: string) => {
        if (email === originalEmail) {
            setEmailError(null);
            return;
        }

        if (email && email !== currentEmail) {
            const emailExists = await checkEmailExists(email, token!);
            if (emailExists) {
                setEmailError('Este e-mail já está em uso. Por favor, use outro e-mail.');
            } else {
                setEmailError(null);
            }
        }
    };

    const handleInputChange = (field: keyof Usuario, value: string) => {
        if (field === 'CPF') {
            validateCpf(value);
        }

        if (field === 'Email' && selectedUser) {
            handleEmailBlur(value, originalEmail || undefined);
        }

        setSelectedUser((prev) => ({
            ...prev!,
            [field]: value,
        }));
    };

    // Função para adicionar um novo usuário
    const handleAddNewUser = async () => {
        if (!newUsuario.NomeCompleto || !newUsuario.Email || !newUsuario.CPF || !newUsuario.NumeroCelular || !newUsuario.TipoUsuario) {
            toast.error('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (cpfError || emailError) {
            toast.error('Erro nos dados informados.');
            return;
        }

        const senhaGerada = generateRandomPassword();
        setIsSaving(true);

        try {
            await addUsuario(token!, {
                ...newUsuario,
                Senha: senhaGerada,
                UsuarioAlteracao: user!.id,
            });

            toast.success('Usuário adicionado com sucesso!');
            handleCloseNewUserModal();

            const response = await getAllUsuarios(token!);
            setUsuarios(response);
        } catch (error) {
            toast.error('Erro ao adicionar usuário.');
        } finally {
            setIsSaving(false);
        }
    };

    // Função para verificar e validar o CPF no modal de criação
    const handleCpfChange = (cpf: string) => {
        validateCpf(cpf);
        setNewUsuario((prev) => ({ ...prev, CPF: cpf }));
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Toaster position="top-right" containerClassName='mt-20' />
            <div id="main-content" className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Gerenciar Usuários</h1>
                <div className="flex justify-between mb-4">
                    <button
                        onClick={() => setIsNewUserModalOpen(true)}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Novo Usuário
                    </button>
                </div>
                <div className="ag-theme-quartz" style={{ height: 500, width: '100%' }}>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <FaSpinner className="animate-spin text-4xl" />
                        </div>
                    ) : (
                        <AgGridReact
                            rowData={usuarios}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            pagination={true}
                            paginationPageSize={20}
                            localeText={localeText}
                        />
                    )}
                </div>
            </div>

            {/* Modal para Adicionar Novo Usuário */}
            <Modal
                isOpen={isNewUserModalOpen}
                onRequestClose={handleCloseNewUserModal}
                className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                ariaHideApp={false}
            >
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                    <h2 className="text-2xl font-bold mb-4">Adicionar Novo Usuário</h2>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleAddNewUser();
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <label htmlFor="NomeCompleto" className="block text-sm font-medium text-gray-700">
                                Nome Completo
                            </label>
                            <input
                                id="NomeCompleto"
                                type="text"
                                value={newUsuario.NomeCompleto}
                                onChange={(e) => setNewUsuario((prev) => ({ ...prev, NomeCompleto: e.target.value }))}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="Email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="Email"
                                type="email"
                                value={newUsuario.Email}
                                onChange={(e) => setNewUsuario((prev) => ({ ...prev, Email: e.target.value }))}
                                onBlur={() => handleEmailBlur(newUsuario.Email!)}
                                className={`mt-1 block w-full p-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded`}
                                required
                            />
                            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                        </div>

                        <div>
                            <label htmlFor="CPF" className="block text-sm font-medium text-gray-700">
                                CPF
                            </label>
                            <Cleave
                                id="CPF"
                                placeholder="CPF"
                                options={{ blocks: [3, 3, 3, 2], delimiters: ['.', '.', '-'], numericOnly: true }}
                                value={newUsuario.CPF}
                                onChange={(e) => handleCpfChange(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                required
                            />
                            {cpfError && <p className="text-red-500 text-sm mt-1">{cpfError}</p>}
                        </div>

                        <div>
                            <label htmlFor="NumeroCelular" className="block text-sm font-medium text-gray-700">
                                Número Celular
                            </label>
                            <Cleave
                                id="NumeroCelular"
                                placeholder="Número Celular"
                                options={{ delimiters: ['(', ') ', '-'], blocks: [0, 2, 5, 4], numericOnly: true }}
                                value={newUsuario.NumeroCelular}
                                onChange={(e) => setNewUsuario((prev) => ({ ...prev, NumeroCelular: e.target.value }))}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="TipoUsuario" className="block text-sm font-medium text-gray-700">
                                Função do Usuário
                            </label>
                            <select
                                id="TipoUsuario"
                                value={newUsuario.TipoUsuario}
                                onChange={(e) => setNewUsuario((prev) => ({ ...prev, TipoUsuario: e.target.value }))}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                required
                            >
                                <option value="administrador">Administrador</option>
                                <option value="gerente">Gerente</option>
                                <option value="portaria">Portaria</option>
                                <option value="patio">Patio</option>
                                <option value="motorista">Motorista</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={handleCloseNewUserModal}
                                className="bg-gray-400 text-white font-bold py-2 px-4 rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-800 flex items-center"
                                disabled={isSaving || emailError !== null || cpfError !== null}
                            >
                                {isSaving ? (
                                    <FaSpinner className="animate-spin text-2xl" />
                                ) : (
                                    'Adicionar'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal de Edição */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleCloseModal}
                className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                ariaHideApp={false}
            >
                {selectedUser && (
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                        <h2 className="text-2xl font-bold mb-4">Editar Usuário</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveUser();
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label htmlFor="NomeCompleto" className="block text-sm font-medium text-gray-700">
                                    Nome Completo
                                </label>
                                <input
                                    id="NomeCompleto"
                                    type="text"
                                    value={selectedUser.NomeCompleto}
                                    onChange={(e) => handleInputChange('NomeCompleto', e.target.value)}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="Email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="Email"
                                    type="email"
                                    value={selectedUser.Email}
                                    onChange={(e) => handleInputChange('Email', e.target.value)}
                                    className={`mt-1 block w-full p-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded`}
                                    required
                                />
                                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                            </div>

                            <div>
                                <label htmlFor="CPF" className="block text-sm font-medium text-gray-700">
                                    CPF
                                </label>
                                <Cleave
                                    id="CPF"
                                    placeholder="CPF"
                                    options={{ blocks: [3, 3, 3, 2], delimiters: ['.', '.', '-'], numericOnly: true }}
                                    value={selectedUser.CPF}
                                    onChange={(e) => handleInputChange('CPF', e.target.value)}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                    required
                                />
                                {cpfError && <p className="text-red-500 text-sm mt-1">{cpfError}</p>}
                            </div>

                            <div>
                                <label htmlFor="NumeroCelular" className="block text-sm font-medium text-gray-700">
                                    Número Celular
                                </label>
                                <Cleave
                                    id="NumeroCelular"
                                    placeholder="Número Celular"
                                    options={{ delimiters: ['(', ') ', '-'], blocks: [0, 2, 5, 4], numericOnly: true }}
                                    value={selectedUser.NumeroCelular}
                                    onChange={(e) => handleInputChange('NumeroCelular', e.target.value)}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="TipoUsuario" className="block text-sm font-medium text-gray-700">
                                    Função do Usuário
                                </label>
                                <select
                                    id="TipoUsuario"
                                    value={selectedUser.TipoUsuario}
                                    onChange={(e) => handleInputChange('TipoUsuario', e.target.value)}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                    required
                                >
                                    <option value="administrador">Administrador</option>
                                    <option value="gerente">Gerente</option>
                                    <option value="portaria">Portaria</option>
                                    <option value="patio">Patio</option>
                                    <option value="motorista">Motorista</option>
                                </select>
                            </div>

                            <div className="flex justify-between items-center mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="bg-gray-400 text-white font-bold py-2 px-4 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResetarSenha}
                                    className="bg-orange-500 text-white font-bold py-2 px-4 rounded"
                                >
                                    Resetar Senha
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-800 flex items-center"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <FaSpinner className="animate-spin text-2xl" />
                                    ) : (
                                        'Salvar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>

            {/* Modal de Confirmação para Ativar/Inativar Usuário */}
            <Modal
                isOpen={isConfirmationModalOpen}
                onRequestClose={handleCloseConfirmationModal}
                className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                ariaHideApp={false}
            >
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                    <h2 className="text-2xl font-bold mb-4">{isActivating ? 'Ativar Usuário' : 'Desativar Usuário'}</h2>
                    <p>{isActivating ? 'Tem certeza de que deseja ativar este usuário?' : 'Tem certeza de que deseja desativar este usuário?'}</p>

                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            type="button"
                            onClick={handleCloseConfirmationModal}
                            className="bg-gray-400 text-white font-bold py-2 px-4 rounded"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleActivationToggle}
                            className={`bg-${isActivating ? 'green' : 'red'}-600 text-white font-bold py-2 px-4 rounded`}
                            disabled={isSaving}
                        >
                            {isSaving ? <FaSpinner className="animate-spin text-2xl" /> : isActivating ? 'Ativar' : 'Desativar'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GerenciarUsuarios;