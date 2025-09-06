import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Player() {
    const router = useRouter();
    const { songName, queueId } = router.query;
    const [videoUrl, setVideoUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/');
            return;
        }

        if (songName) {
            // CORREÇÃO: Removido 'as string' para ser JavaScript válido
            setVideoUrl(`http://localhost:7001/api/videos/${encodeURIComponent(songName)}`);
        }
    }, [songName, router]);

    const handleVideoEnded = async () => {
        if (!queueId) return;

        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`http://localhost:7001/api/queue/mark-as-played/${queueId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Falha ao registar a música como tocada.');
            }

            router.push('/queue');

        } catch (err) {
            setError(err.message);
        }
    };

    if (!songName || !queueId) {
        return <p className="text-center mt-10">A carregar música...</p>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <h1 className="text-3xl font-bold mb-4">A tocar: {songName}</h1>
            {videoUrl && (
                <video
                    src={videoUrl}
                    controls
                    autoPlay
                    onEnded={handleVideoEnded}
                    className="w-full max-w-4xl rounded-lg shadow-lg"
                >
                    O seu navegador não suporta o elemento de vídeo.
                </video>
            )}
            {error && <p className="mt-4 text-red-500">Erro: {error}</p>}
            <button
                onClick={() => router.push('/queue')}
                className="mt-6 bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
                Voltar para a Fila
            </button>
        </div>
    );
}

