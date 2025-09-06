import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';

export default function DesktopPlayer() {
    const [status, setStatus] = useState('waiting'); // waiting, confirming, playing
    const [currentSong, setCurrentSong] = useState(null);
    const [countdown, setCountdown] = useState(20);
    const [error, setError] = useState('');
    const router = useRouter();
    const videoRef = useRef(null);

    // Função para buscar a próxima música
    const fetchNextSong = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/');
            return;
        }
        console.log('A verificar a fila...');
        try {
            const response = await fetch('http://localhost:7001/api/queue/next', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error(`Erro na resposta da API: ${response.statusText}`);
            }
            const data = await response.json();
            if (data && data.songName) {
                setCurrentSong(data);
                setStatus('confirming');
                setCountdown(20);
            }
        } catch (err) {
            console.error('Falha ao verificar a fila:', err);
        }
    };

    // Efeito para a contagem decrescente
    useEffect(() => {
        if (status !== 'confirming') return;
        if (countdown === 0) {
            handleSkip();
            return;
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [status, countdown]);

    // Efeito para verificar a fila periodicamente
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const decodedToken = jwtDecode(token);
            if (decodedToken.role !== 'admin') {
                setError('Acesso negado.');
                return;
            }
        } catch (e) {
            router.push('/');
            return;
        }
        const interval = setInterval(() => {
            if (status === 'waiting') {
                fetchNextSong();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [status, router]);

    const handleVideoEnd = async () => {
        const token = localStorage.getItem('authToken');
        try {
            await fetch('http://localhost:7001/api/played-song-log/log', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ songName: currentSong.songName }),
            });
        } catch (err) {
            console.error('ERRO ao registar a música como tocada:', err);
        }
        resetPlayer();
    };

    const handleConfirm = async () => {
        setStatus('playing');
        const token = localStorage.getItem('authToken');
        try {
            const safeSongName = encodeURIComponent(currentSong.songName);
            const response = await fetch(`http://localhost:7001/api/videos/${safeSongName}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error(`Não foi possível carregar o vídeo (status: ${response.status})`);
            }
            const videoBlob = await response.blob();
            if (videoRef.current) {
                if (videoRef.current.src) {
                    URL.revokeObjectURL(videoRef.current.src);
                }
                videoRef.current.src = URL.createObjectURL(videoBlob);
                videoRef.current.play();
            }
        } catch (err) {
            setError('Erro ao carregar o vídeo. A voltar ao início.');
            setTimeout(resetPlayer, 3000);
        }
    };

    const handleSkip = () => {
        resetPlayer();
    };

    const resetPlayer = () => {
        setStatus('waiting');
        setCurrentSong(null);
        if (videoRef.current && videoRef.current.src) {
            URL.revokeObjectURL(videoRef.current.src);
            videoRef.current.src = '';
        }
        setError('');
    };

    if (error) return <div className="flex items-center justify-center min-h-screen bg-black text-white text-2xl">{error}</div>;

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white relative">
            {status === 'waiting' && <h1 className="text-4xl">Aguardando o próximo cantor...</h1>}
            {status === 'confirming' && currentSong && (
                <div className="text-center">
                    <h2 className="text-2xl mb-2">A seguir:</h2>
                    <h1 className="text-6xl font-bold mb-4">{currentSong.songName}</h1>
                    <h3 className="text-3xl mb-8">Cantor: {currentSong.userName}</h3>
                    <div className="flex gap-4 justify-center">
                        <button onClick={handleConfirm} className="bg-green-600 px-8 py-4 rounded-lg text-2xl font-bold hover:bg-green-700">Confirmar ({countdown})</button>
                        <button onClick={handleSkip} className="bg-red-600 px-8 py-4 rounded-lg text-2xl font-bold hover:bg-red-700">Pular</button>
                    </div>
                </div>
            )}
            <video
                ref={videoRef}
                controls
                onEnded={handleVideoEnd}
                className={`w-full h-full ${status === 'playing' ? 'block' : 'hidden'}`}
            />
        </div>
    );
}

