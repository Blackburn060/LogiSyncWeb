import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { redefinirSenha } from '../services/usuarioService';
import { Toaster, toast } from 'react-hot-toast';
import logoHorizontal from '../assets/images/Logo-LogiSync-Horizontal-02-SF.webp';
import { FaSpinner } from 'react-icons/fa';

const RedefinirSenha: React.FC = () => {
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRedefinirSenha = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = searchParams.get('token');
        const id = searchParams.get('id');

        if (novaSenha !== confirmarSenha) {
            toast.error('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        try {
            await redefinirSenha(token!, Number(id), novaSenha);
            toast.success('Senha redefinida com sucesso.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            toast.error('Erro ao redefinir a senha. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-white">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="bg-logisync-color-blue-400 p-8 rounded shadow-md w-full max-w-sm">
                <img src={logoHorizontal} alt="LogiSync Logo" className="w-48 mx-auto pb-6 object-contain" />
                <h2 className="text-3xl font-extrabold text-center mb-6 text-white">Redefinir Senha</h2>
                <form onSubmit={handleRedefinirSenha}>
                    <div className="mb-4">
                        <label htmlFor="novaSenha" className="block text-base font-bold text-white">Nova Senha:</label>
                        <input
                            type="password"
                            id="novaSenha"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            className="w-full p-2 border border-logisync-color-blue-400 rounded mt-1"
                            placeholder="Digite sua nova senha"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmarSenha" className="block text-base font-bold text-white">Confirmar Senha:</label>
                        <input
                            type="password"
                            id="confirmarSenha"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            className="w-full p-2 border border-logisync-color-blue-400 rounded mt-1"
                            placeholder="Confirme sua nova senha"
                            required
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-logisync-color-blue-50 text-lg text-white font-extrabold rounded hover:bg-logisync-color-blue-200 transition duration-200 flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <FaSpinner className="animate-spin text-2xl" />
                        ) : (
                            'Redefinir Senha'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RedefinirSenha;
