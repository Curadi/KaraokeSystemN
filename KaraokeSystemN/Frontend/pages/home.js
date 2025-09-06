import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// Função auxiliar para decodificar o token e extrair a role
const getUserRole = (token) => {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
    } catch (e) {
        return null;
    }
};

export default function Home() {
    const [username, setUsername] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const storedUsername = localStorage.getItem('karaoke_username');
        const role = getUserRole(token);

        if (!token) {
            router.push('/');
            return;
        }

        setUsername(storedUsername || 'Usuário');
        if (role === 'admin') {
            setIsAdmin(true);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('karaoke_username');
        router.push('/');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <main className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                <div className="absolute top-4 right-4">
                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-500 hover:text-red-700 hover:underline font-semibold"
                    >
                        Sair
                    </button>
                </div>

                <h1 className="text-3xl font-bold mb-2 text-gray-800">Olá, <span className="text-blue-600">{username}</span>!</h1>
                <p className="text-gray-600 mb-8">O que você gostaria de fazer?</p>

                <div className="flex flex-col space-y-4">
                    <Link href="/songs" passHref>
                        <a className="bg-blue-600 text-white font-bold py-4 px-6 rounded-md hover:bg-blue-700 transition-colors text-lg">
                            Selecionar Música
                        </a>
                    </Link>

                    {/* O link agora aponta para a nova página '/systemsettings' */}
                    {isAdmin && (
                        <Link href="/systemsettings" passHref>
                            <a className="bg-gray-700 text-white font-bold py-4 px-6 rounded-md hover:bg-gray-800 transition-colors text-lg">
                                Painel de Configurações
                            </a>
                        </Link>
                    )}
                </div>
            </main>
        </div>
    );
}

