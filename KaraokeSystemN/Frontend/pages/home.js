import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';

export default function Home() {
    const [username, setUsername] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            setUsername(decodedToken.unique_name || 'Utilizador');
            setIsAdmin(decodedToken.role === 'admin');
        } catch (e) {
            console.error("Token inválido:", e);
            localStorage.removeItem('authToken');
            router.push('/');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        router.push('/');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <main className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg text-center">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">
                    Bem-vindo, <span className="text-blue-600">{username}</span>!
                </h1>
                <p className="mb-8 text-gray-600">O que gostaria de fazer agora?</p>

                <div className="space-y-4">
                    <button
                        onClick={() => router.push('/songs')}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 transition-colors text-lg"
                    >
                        Selecionar Música
                    </button>
                    <button
                        onClick={() => router.push('/queue')}
                        className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-md hover:bg-gray-700 transition-colors text-lg"
                    >
                        Ver Fila de Espera
                    </button>
                    <button
                        onClick={() => router.push('/menu')}
                        className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-md hover:bg-orange-600 transition-colors text-lg"
                    >
                        Ver Cardápio
                    </button>

                    {isAdmin && (
                        <div className="pt-4 border-t mt-4 space-y-4">
                            <button
                                onClick={() => router.push('/systemsettings')}
                                className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-md hover:bg-purple-700 transition-colors text-lg"
                            >
                                Configurações do Sistema
                            </button>
                            <button
                                onClick={() => window.open('/desktop-player', '_blank')}
                                className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-md hover:bg-teal-700 transition-colors text-lg"
                            >
                                Video Player
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleLogout}
                        className="bg-gray-200 text-red-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                        Sair
                    </button>
                </div>
            </main>
        </div>
    );
}

