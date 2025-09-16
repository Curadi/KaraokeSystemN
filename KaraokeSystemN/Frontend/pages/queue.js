import { useState, useEffect, Fragment } from 'react'; 
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';

const ChangeSongModal = ({ isOpen, onClose, songToChange, onSongChanged }) => {
    const [allSongs, setAllSongs] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSong, setSelectedSong] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const formatSongName = (fileName) =>
        fileName ? fileName.replace(/\.[^/.]+$/, "") : '';

    useEffect(() => {
        if (!isOpen) return;

        const token = localStorage.getItem('authToken');
        const fetchAllSongs = async () => {
            try {
                const response = await fetch('http://localhost:7001/api/videos', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Não foi possível carregar a lista de músicas.');
                const data = await response.json();
                setAllSongs(data);
                setFilteredSongs(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchAllSongs();
    }, [isOpen]);

    useEffect(() => {
        const results = allSongs.filter(song =>
            formatSongName(song).toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSongs(results);
    }, [searchTerm, allSongs]);

    const handleConfirmChange = async () => {
        if (!selectedSong) return;

        setIsSubmitting(true);
        setError('');
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`http://localhost:7001/api/queue/change/${songToChange.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ songName: selectedSong }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao trocar de música.');
            }

            onSongChanged(); 
            onClose();       
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Trocar Música</h2>
                <p className="mb-4">
                    A sua música atual é:{" "}
                    <span className="font-semibold">
                        {formatSongName(songToChange.songName)}
                    </span>
                </p>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <div className="flex items-center gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Escolha a nova música..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow p-2 border rounded-md"
                    />
                </div>

                <div className="max-h-60 overflow-y-auto border rounded-md mb-4">
                    <ul>
                        {filteredSongs.map((song, index) => (
                            <li
                                key={index}
                                onClick={() => setSelectedSong(song)}
                                className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedSong === song ? 'bg-blue-500 text-white' : ''
                                    }`}
                            >
                                {formatSongName(song)}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 text-black px-4 py-2 rounded-md"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirmChange}
                        disabled={!selectedSong || isSubmitting}
                        className="bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                    >
                        {isSubmitting ? 'Trocando...' : 'Confirmar Troca'}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function Queue() {
    const [queue, setQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUsername, setCurrentUsername] = useState('');
    const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
    const [songToChange, setSongToChange] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setIsAdmin(decodedToken.role === 'admin');
                setCurrentUsername(decodedToken.unique_name);
            } catch (e) { console.error("Token inválido:", e); }
        }
    }, []);

    const fetchQueue = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) { router.push('/'); return; }

        try {
            const response = await fetch('http://localhost:7001/api/queue', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Não foi possível carregar a fila.');
            const data = await response.json();
            setQueue(Array.isArray(data) ? data : []);
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

            await fetchQueue();
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(''), 5000); 
        }
    };

    const openChangeModal = (songItem) => {
        setSongToChange(songItem);
        setIsChangeModalOpen(true);
    };

    const closeChangeModal = () => {
        setIsChangeModalOpen(false);
        setSongToChange(null);
    };

    if (isLoading) return <p className="text-center mt-10">A carregar a fila...</p>;
    if (error) return <p className="text-center mt-10 text-red-600">Erro: {error}</p>;

    return (
        <Fragment>
            <ChangeSongModal
                isOpen={isChangeModalOpen}
                onClose={closeChangeModal}
                songToChange={songToChange}
                onSongChanged={fetchQueue} 
            />
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
                                                    <p className="font-semibold text-gray-800">{item.songName.replace(/\.[^/.]+$/, "")}</p>
                                                    <p className="text-sm text-gray-500">por: {item.userName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.userName === currentUsername && !isAdmin && (
                                                    <button
                                                        onClick={() => openChangeModal(item)}
                                                        className="bg-yellow-500 text-white font-bold py-1 px-3 rounded-md hover:bg-yellow-600 transition-opacity opacity-0 group-hover:opacity-100"
                                                        title="Trocar de Música"
                                                    >
                                                        Trocar
                                                    </button>
                                                )}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleRemove(item.id)}
                                                        className="bg-red-500 text-white font-bold py-1 px-3 rounded-md hover:bg-red-600 transition-opacity opacity-0 group-hover:opacity-100"
                                                        title="Remover da fila"
                                                    >
                                                        Remover
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    )
                                ))}
                            </ul>
                        ) : (
                            <p className="p-4 text-center text-gray-500">A fila está vazia.</p>
                        )}
                    </div>
                    <div className="mt-6 flex justify-center">
                        <button onClick={() => router.push('/songs')}
                            className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                            &larr; Voltar para a Seleção
                        </button>
                    </div>
                </main>
            </div>
        </Fragment>
    );
}

