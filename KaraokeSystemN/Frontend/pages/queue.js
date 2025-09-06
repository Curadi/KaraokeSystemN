import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';

export default function Queue() {
    const [queue, setQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    // Efeito para verificar a role do utilizador
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setIsAdmin(decodedToken.role === 'admin');
            } catch (e) {
                console.error("Token inválido:", e);
            }
        }
    }, []);

    // Função unificada para buscar os dados da fila
    const fetchQueue = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/');
            return;
        }
        try {
            const response = await fetch('http://localhost:7001/api/queue', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error('Não foi possível carregar a fila.');
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                setQueue(data);
            } else {
                setQueue([]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            // Garante que o estado de 'loading' seja desativado após a primeira busca
            if (isLoading) {
                setIsLoading(false);
            }
        }
    };

    // Efeito para o carregamento inicial e para as atualizações automáticas
    useEffect(() => {
        // Busca os dados imediatamente quando a página carrega
        fetchQueue();

        // Inicia um ciclo que chama a função de busca a cada 5 segundos
        const interval = setInterval(fetchQueue, 5000);

        // Função de limpeza: para o ciclo quando o utilizador sai da página
        return () => clearInterval(interval);
    }, [router]); // A dependência no router garante que o ciclo recomece se a rota mudar.

    const handlePlayClick = (song) => {
        // Leva o admin para a página do player, passando os detalhes da música.
        // CORREÇÃO: Usando as propriedades corretas com letra minúscula
        router.push(`/desktop-player?songName=${encodeURIComponent(song.songName)}&userName=${encodeURIComponent(song.userName)}`);
    };

    if (isLoading) return <p className="text-center mt-10">A carregar a fila...</p>;
    if (error) return <p className="text-center mt-10 text-red-600">Erro: {error}</p>;

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
            <main className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Fila de Músicas</h1>
                <div className="mb-6">
                    {queue.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {queue.map(item => (
                                (item && item.id) && ( // Usamos 'id' minúsculo para a chave
                                    <li key={item.id} className="p-4 flex justify-between items-center">
                                        <div className="flex items-center">
                                            {/* CORREÇÃO: A propriedade da posição também é minúscula ('position') */}
                                            <span className="text-lg font-bold text-blue-600 mr-4 w-8 text-center">{item.position}º</span>
                                            <div>
                                                {/* CORREÇÃO: Usando as propriedades corretas com letra minúscula */}
                                                <p className="font-semibold text-gray-650">{item.userName}</p>
                                                <p className="text-sm text-gray-800">{item.songName}</p>
                                            </div>
                                        </div>
                                    </li>
                                )
                            ))}
                        </ul>
                    ) : (
                        <p className="p-4 text-center text-gray-500">A fila está vazia. Seja o primeiro a adicionar uma música!</p>
                    )}
                </div>
                <div className="mt-6 flex justify-center">
                    <button onClick={() => router.push('/songs')} className="text-blue-600 hover:underline">
                        &larr; Voltar para a Seleção
                    </button>
                </div>
            </main>
        </div>
    );
}

