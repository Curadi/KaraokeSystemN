import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Endereço da sua API de backend
const API_URL = 'http://localhost:7001/api/auth';

// Componente para o formulário de login
const LoginComponent = ({ setLoggedIn, setMessage }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const router = useRouter();

    // Efeito para cuidar do contador e redirecionamento
    useEffect(() => {
        if (!isRedirecting) return;

        if (countdown === 0) {
            router.push('/home');
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        // Limpa o timer se o componente for desmontado
        return () => clearTimeout(timer);
    }, [isRedirecting, countdown, router]);


    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Credenciais inválidas.');
            }

            const data = await response.json();
            localStorage.setItem('authToken', data.token); // Renomeado para consistência
            localStorage.setItem('karaoke_username', data.username);

            setLoggedIn(true);
            setMessage(`Login bem-sucedido! Redirecionando em ${countdown}...`);
            setIsRedirecting(true); // Inicia o processo de redirecionamento

        } catch (error) {
            console.error('Erro no login:', error.message);
            setMessage(`Erro: ${error.message}`);
            setLoading(false);
        }
        // Não definimos setLoading(false) no sucesso, pois a tela vai mudar
    };

    // Se estiver redirecionando, mostra a mensagem com o contador
    if (isRedirecting) {
        return (
            <div className="text-center">
                <p className="p-2 rounded-md bg-green-100 text-green-700">
                    Login bem-sucedido! Redirecionando em {countdown}...
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
            <input
                type="text"
                placeholder="Nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <button
                type="submit"
                className="bg-blue-600 text-white font-bold p-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
            >
                {loading ? 'Entrando...' : 'Entrar'}
            </button>
        </form>
    );
};

// Componente para o formulário de registro
const RegisterComponent = ({ setMessage, setIsLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const text = await response.text();
                try {
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.message || 'Não foi possível registrar.');
                } catch {
                    throw new Error(`Erro inesperado do servidor: ${text}`);
                }
            }

            setMessage('Usuário cadastrado com sucesso! Faça o login para continuar.');
            // Após o sucesso, muda para a tela de login
            setIsLogin(true);

        } catch (error) {
            console.error('Erro no cadastro:', error.message);
            setMessage(`Erro: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleRegister} className="flex flex-col space-y-4">
            <input
                type="text"
                placeholder="Nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
            />
            <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
            />
            <button
                type="submit"
                className="bg-green-600 text-white font-bold p-3 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={loading}
            >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
        </form>
    );
};

// Página principal que renderiza os componentes
export default function Home() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    // Verifica se o usuário já está logado ao carregar a página
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            router.push('/home'); // Se já tem token, vai direto para a home
        }
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Head>
                <title>Karaokê System</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
                <div>
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">
                        Bem-vindo ao <span className="text-blue-600">Karaokê</span>!
                    </h1>
                    <p className="mb-6 text-gray-600">
                        Faça login ou cadastre-se para entrar na fila de músicas.
                    </p>

                    {message && (
                        <p className={`mb-4 p-2 rounded-md ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {message}
                        </p>
                    )}

                    {isLogin ?
                        <LoginComponent setLoggedIn={setLoggedIn} setMessage={setMessage} /> :
                        <RegisterComponent setMessage={setMessage} setIsLogin={setIsLogin} />
                    }

                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setMessage(''); // Limpa a mensagem ao alternar.
                        }}
                        className="mt-6 text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                    >
                        {isLogin ? 'Não tem uma conta? Cadastre-se agora!' : 'Já tem uma conta? Faça login'}
                    </button>
                </div>
            </main>
        </div>
    );
}
