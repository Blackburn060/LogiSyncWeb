import React, { useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { getAllUsuarios, updateUsuario } from '../services/usuarioService';
import { Usuario } from '../models/Usuario';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import UsuarioForm from '../components/UsuarioForm';
import toast, { Toaster } from 'react-hot-toast';

const GerenciarUsuarios: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [selectedUsuario, setSelectedUsuario] = useState<Partial<Usuario> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { token, user } = useAuth();

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
            } catch (error) {
                console.error('Erro ao buscar usuários', error);
                toast.error('Erro ao buscar usuários');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsuarios();
    }, [token]);

    // Função para salvar as alterações de um usuário editado
    const handleSave = async (usuario: Partial<Usuario>) => {
        if (!token || !usuario.CodigoUsuario || !user) {
            console.error('Token ou usuário logado não encontrados ou Código de usuário ausente');
            return;
        }

        try {
            const usuarioAtualizado = {
                ...usuario,
                UsuarioAlteracao: user.id
            };

            await updateUsuario(token, usuario.CodigoUsuario, usuarioAtualizado);
            toast.success('Usuário atualizado com sucesso!');
            setUsuarios((prevUsuarios) =>
                prevUsuarios.map((u) => (u.CodigoUsuario === usuario.CodigoUsuario ? { ...u, ...usuarioAtualizado } : u))
            );
            setSelectedUsuario(null);
        } catch (error) {
            console.error('Erro ao atualizar usuário', error);
            toast.error('Erro ao atualizar usuário');
        }
    };

    const handleCancel = () => {
        setSelectedUsuario(null);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Toaster position="top-right" />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Gerenciar Usuários</h1>

                {/* Exibe o formulário de edição se houver um usuário selecionado */}
                {selectedUsuario ? (
                    <UsuarioForm
                        usuario={selectedUsuario}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                ) : (
                    <>
                        {isLoading ? (
                            <p>Carregando usuários...</p>
                        ) : usuarios.length === 0 ? (
                            <p>Nenhum usuário encontrado.</p>
                        ) : (
                            <table className="min-w-full bg-white border">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 border-b">Nome Completo</th>
                                        <th className="py-2 px-4 border-b">Email</th>
                                        <th className="py-2 px-4 border-b">CPF</th>
                                        <th className="py-2 px-4 border-b">Número Celular</th>
                                        <th className="py-2 px-4 border-b">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map((usuario) => (
                                        <tr key={usuario.CodigoUsuario}>
                                            <td className="py-2 px-4 border-b">{usuario.NomeCompleto}</td>
                                            <td className="py-2 px-4 border-b">{usuario.Email}</td>
                                            <td className="py-2 px-4 border-b">{usuario.CPF}</td>
                                            <td className="py-2 px-4 border-b">{usuario.NumeroCelular}</td>
                                            <td className="py-2 px-4 border-b">
                                                <button
                                                    className="text-blue-500 mr-2"
                                                    onClick={() => setSelectedUsuario(usuario)}
                                                >
                                                    <FaEdit />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default GerenciarUsuarios;
