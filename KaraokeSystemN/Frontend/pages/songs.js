import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const formatSongName = (fileName) => {
    if (!fileName) return '';
    return fileName.replace(/\.[^/.]+$/, "");
};

export default function Songs() {
    const [songs, setSongs] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSong, setSelectedSong] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [username, setUsername] = useState('');
    const [userSongsInQueue, setUserSongsInQueue] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const storedUsername = localStorage.getItem('karaoke_username');

        if (!token) {
            router.push('/');
            return;
        }
        setUsername(storedUsername || 'Utilizador');

        const fetchData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const [videosResponse, mySongResponse] = await Promise.all([
                    fetch('http://localhost:7001/api/videos', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (!videosResponse.ok) throw new Error('Não foi possível carregar as músicas.');
                const videosData = await videosResponse.json();
                setSongs(videosData);
                setFilteredSongs(videosData);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [router]);

    useEffect(() => {
        const results = songs.filter(song =>
            formatSongName(song).toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSongs(results);
    }, [searchTerm, songs]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('karaoke_username');
        router.push('/');
    };

    const handleSubmitSong = async () => {
        if (!selectedSong) return;

        setIsSubmitting(true);
        setError('');
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch('http://localhost:7001/api/queue/set-song', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ songName: selectedSong }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Ocorreu um erro.');
            }

            router.push('/queue');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <p className="text-center mt-10">A carregar...</p>;

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
            <main className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl relative">
                <div className="absolute top-4 right-4">
                    <span className="text-gray-600 mr-2">Olá, {username}!</span>
                    <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 hover:underline font-semibold">
                        Sair
                    </button>
                </div>

                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 pt-8">
                    Selecione uma Música
                </h1>

                {error && <p className="mb-4 p-2 text-center rounded-md bg-red-100 text-red-700">{error}</p>}

                {userSongsInQueue.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h2 className="font-semibold text-center text-blue-800 mb-2">As suas músicas na fila:</h2>
                        <ul className="list-disc list-inside text-center">
                            {userSongsInQueue.map((song, index) => (
                                <li key={index} className="font-bold text-blue-700">
                                    {formatSongName(song.songName)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div>
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
                            onClick={handleSubmitSong}
                            disabled={!selectedSong || isSubmitting}
                            className="bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {isSubmitting ? 'A aguardar...' : 'Confirmar Música'}
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto mb-6 border rounded-md">
                        <ul>
                            {filteredSongs.map((song, index) => (
                                <li key={index} onClick={() => { setSelectedSong(song); setSearchTerm(formatSongName(song)); }}
                                    className={`p-3 cursor-pointer hover:bg-blue-100 border-b last:border-b-0 transition-colors ${selectedSong === song ? 'bg-blue-600 text-white font-bold' : ''}`}>
                                    {formatSongName(song)}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                    <button
                        onClick={() => router.push('/home')}
                        className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        &larr; Voltar ao Menu
                    </button>
                    <button
                        onClick={() => router.push('/queue')}
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Ver Fila de Espera &rarr;
                    </button>
                </div>
            </main>
        </div>
    );
}

