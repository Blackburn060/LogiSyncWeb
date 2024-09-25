import React, { useState } from 'react';
import { solicitarRecuperacaoSenha } from '../services/usuarioService';
import { Toaster, toast } from 'react-hot-toast';
import logoHorizontal from '../assets/images/Logo-LogiSync-Horizontal-02-SF.webp';
import { FaSpinner } from 'react-icons/fa';

const RecuperarSenha: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailEnviado, setEmailEnviado] = useState(false);

    const handleRecuperarSenha = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await solicitarRecuperacaoSenha(email);
            toast.success('Se o e-mail existir, um link de recuperação foi enviado.');
            setEmailEnviado(true);
        } catch (error) {
            toast.error('Erro ao enviar e-mail de recuperação. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-white">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="bg-logisync-color-blue-400 p-8 rounded shadow-md w-full max-w-sm">
                <img src={logoHorizontal} alt="LogiSync Logo" className="w-48 mx-auto pb-6 object-contain" />
                <h2 className="text-3xl font-extrabold text-center mb-6 text-white">Recuperar Senha</h2>
                <form onSubmit={handleRecuperarSenha}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-base font-bold text-white">Digite seu e-mail:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-logisync-color-blue-400 rounded mt-1"
                            placeholder="exemplo@dominio.com"
                            required
                            disabled={emailEnviado}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-logisync-color-blue-50 text-lg text-white font-extrabold rounded hover:bg-logisync-color-blue-200 transition duration-200 flex items-center justify-center"
                        disabled={loading || emailEnviado}
                    >
                        {loading ? (
                            <FaSpinner className="animate-spin text-2xl" />
                        ) : emailEnviado ? (
                            'E-mail Enviado!'
                        ) : (
                            'Enviar'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RecuperarSenha;
