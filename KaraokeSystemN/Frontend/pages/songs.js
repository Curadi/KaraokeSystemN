import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Songs() {
    const [songs, setSongs] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSong, setSelectedSong] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [username, setUsername] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const storedUsername = localStorage.getItem('karaoke_username');

        if (!token) {
            router.push('/');
            return;
        }

        setUsername(storedUsername || 'Usuário');

        fetch('http://localhost:7001/api/videos', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(async res => {
                if (res.status === 401) {
                    localStorage.removeItem('authToken');
                    router.push('/');
                    throw new Error('A sua sessão expirou. Por favor, faça o login novamente.');
                }
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Erro do servidor (${res.status}): ${errorText}`);
                }
                return res.json();
            })
            .then(data => {
                setSongs(data);
                setFilteredSongs(data);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    }, [router]);

    useEffect(() => {
        const results = songs.filter(song =>
            song.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSongs(results);
    }, [searchTerm, songs]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('karaoke_username');
        router.push('/');
    };

    const handleAddToQueue = async () => {
        if (!selectedSong) return;

        setIsAdding(true);
        setError('');
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch('http://localhost:7001/api/queue/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ songName: selectedSong }),
            });

            // --- ESTA É A ALTERAÇÃO ---
            // O código agora verifica se o erro é um 409 (Conflito), que é a nossa
            // nova regra de "usuário já na fila". Se for, ele extrai a mensagem 
            // específica do backend ("Você já possui uma música na fila.")
            if (!response.ok) {
                if (response.status === 409) {
                    const errorData = await response.json();
                    throw new Error(errorData.message);
                }
                throw new Error('Não foi possível adicionar a música à fila.');
            }

            router.push('/queue');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsAdding(false);
        }
    };

    if (isLoading) return <p className="text-center mt-10">A carregar músicas...</p>;

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
            <main className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl relative">
                <div className="absolute top-4 right-4">
                    <span className="text-gray-600 mr-2">Olá, {username}!</span>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-500 hover:text-red-700 hover:underline font-semibold"
                    >
                        Sair
                    </button>
                </div>

                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 pt-8">Selecione uma Música</h1>

                {error && <p className="mb-4 p-2 text-center rounded-md bg-red-100 text-red-700">{error}</p>}

                <div className="flex items-center gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Digite para procurar uma música..."
                        value={searchTerm}
                        onChange={e => {
                            setSearchTerm(e.target.value);
                            setSelectedSong(null);
                        }}
                        className="flex-grow p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleAddToQueue}
                        disabled={!selectedSong || isAdding}
                        className="bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {isAdding ? 'A adicionar...' : 'Confirmar Música'}
                    </button>
                </div>

                <div className="max-h-96 overflow-y-auto mb-6 border rounded-md">
                    {filteredSongs.length > 0 ? (
                        <ul>
                            {filteredSongs.map((song, index) => (
                                <li
                                    key={index}
                                    onClick={() => {
                                        setSelectedSong(song);
                                        setSearchTerm(song);
                                    }}
                                    className={`p-3 cursor-pointer hover:bg-blue-100 border-b last:border-b-0 transition-colors ${selectedSong === song ? 'bg-blue-600 text-white font-bold' : ''}`}
                                >
                                    {song}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-4 text-center text-gray-500">Nenhuma música encontrada.</p>
                    )}
                </div>

                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => router.push('/home')}
                        className="text-blue-600 hover:underline"
                    >
                        &larr; Voltar ao Menu
                    </button>
                </div>
            </main>
        </div>
    );
}

