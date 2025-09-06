import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';

export default function Queue() {
    const [queue, setQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

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
            // CORREÇÃO: Verificamos se 'data' é um array antes de o definir no estado
            if (Array.isArray(data)) {
                setQueue(data);
            } else {
                setQueue([]); // Se não for um array, definimos a fila como vazia
            }
        } catch (err) {
            setError(err.message);
        } finally {
            // Apenas desliga o 'isLoading' no carregamento inicial
            if (isLoading) setIsLoading(false);
        }
    };

    // Efeito para o carregamento inicial e para as atualizações automáticas
    useEffect(() => {
        fetchQueue(); // Carregamento inicial
        const interval = setInterval(fetchQueue, 5000); // Atualização a cada 5 segundos
        return () => clearInterval(interval); // Limpa o intervalo ao sair da página
    }, [router]);

    const handlePlayClick = () => {
        router.push(`/desktop-player`);
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
                                <li key={item.Id} className="p-4 flex justify-between items-center">
                                    <div className="flex items-center">
                                        <span className="text-lg font-bold text-blue-600 mr-4 w-8 text-center">{item.Position}º</span>
                                        <div>
                                            <p className="font-semibold text-gray-800">{item.SongName}</p>
                                            <p className="text-sm text-gray-500">por: {item.UserName}</p>
                                        </div>
                                    </div>
                                    {isAdmin && item.Position === 1 && (
                                        <button
                                            onClick={handlePlayClick}
                                            className="bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                                        >
                                            Tocar
                                        </button>
                                    )}
                                </li>
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

