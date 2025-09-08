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
            if (Array.isArray(data)) {
                setQueue(data);
            } else {
                setQueue([]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            if (isLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000);
        return () => clearInterval(interval);
    }, [router]);

    // --- NOVA FUNÇÃO PARA REMOVER UM ITEM DA FILA ---
    const handleRemove = async (id) => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`http://localhost:7001/api/queue/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Não foi possível remover o item.');
            }

            // Força a atualização da lista imediatamente após a remoção
            await fetchQueue();
        } catch (err) {
            setError(err.message);
            // Limpa a mensagem de erro após alguns segundos
            setTimeout(() => setError(''), 5000);
        }
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
                                (item && item.id) && (
                                    <li key={item.id} className="p-4 flex justify-between items-center group">
                                        <div className="flex items-center">
                                            <span className="text-lg font-bold text-blue-600 mr-4 w-8 text-center">{item.position}º</span>
                                            <div>
                                                <p className="font-semibold text-gray-800">{item.songName}</p>
                                                <p className="text-sm text-gray-500">por: {item.userName}</p>
                                            </div>
                                        </div>
                                        {/* O botão agora aparece para o admin em qualquer posição */}
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                className="bg-red-500 text-white font-bold py-1 px-3 rounded-md hover:bg-red-600 transition-opacity opacity-0 group-hover:opacity-100"
                                                title="Remover da fila"
                                            >
                                                Remover
                                            </button>
                                        )}
                                    </li>
                                )
                            ))}
                        </ul>
                    ) : (
                        <p className="p-4 text-center text-gray-500">A fila está vazia.</p>
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

