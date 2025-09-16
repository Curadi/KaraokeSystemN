import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';

export default function DesktopPlayer() {
    const [status, setStatus] = useState('waiting');
    const [currentSong, setCurrentSong] = useState(null);
    const [countdown, setCountdown] = useState(20);
    const [error, setError] = useState('');
    const router = useRouter();
    const videoRef = useRef(null);
    const videoUrlRef = useRef(null);

    const fetchNextSong = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) { router.push('/'); return; }

        console.log('A verificar a fila...');
        try {
            const response = await fetch('http://localhost:7001/api/player/peek-next', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);

            const data = await response.json();
            if (data && data.songName) {
                setCurrentSong(data);
                setStatus('confirming');
                setCountdown(data.confirmationTimeout);
            } else {
                setStatus('waiting');
            }
        } catch (err) {
            console.error('Falha ao verificar a fila:', err);
            setStatus('waiting');
        }
    };

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
            if (status === 'waiting' && !document.hidden) {
                fetchNextSong();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [status, router]);

    useEffect(() => {
        if (status !== 'confirming') return;
        if (countdown === 0) {
            handleSkip();
            return;
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [status, countdown]);

    const handleConfirm = async () => {
        const token = localStorage.getItem('authToken');
        setStatus('playing');
        try {
            const response = await fetch(`http://localhost:7001/api/player/play-next`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Não foi possível confirmar a música para tocar.');

            const songToPlay = await response.json();
            setCurrentSong(songToPlay);

            const videoResponse = await fetch(`http://localhost:7001/api/videos/${encodeURIComponent(songToPlay.songName)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!videoResponse.ok) throw new Error('Não foi possível carregar o vídeo.');

            const videoBlob = await videoResponse.blob();
            if (videoRef.current) {
                const newVideoUrl = URL.createObjectURL(videoBlob);
                if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
                videoUrlRef.current = newVideoUrl;
                videoRef.current.src = newVideoUrl;
                videoRef.current.play();
            }
        } catch (err) {
            setError('Erro ao carregar o vídeo. A voltar ao início.');
            setTimeout(resetPlayer, 3000);
        }
    };

    const informBackendPlayerIsFree = async (skipped = false) => {
        const token = localStorage.getItem('authToken');
        try {
            await fetch('http://localhost:7001/api/player/finished', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!skipped && currentSong) {
                await fetch('http://localhost:7001/api/played-song-log/log', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ songName: currentSong.songName }),
                });
            }
        } catch (err) {
            console.error("Erro ao finalizar o ciclo do vídeo:", err);
        }
    };

    const handleVideoEnd = async () => {
        await informBackendPlayerIsFree(false);
        resetPlayer();
    };

    const handleSkip = async () => {
        await informBackendPlayerIsFree(true);
        resetPlayer();
    };

    const resetPlayer = () => {
        setStatus('waiting');
        setCurrentSong(null);
        if (videoUrlRef.current) {
            URL.revokeObjectURL(videoUrlRef.current);
            videoUrlRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.src = '';
        }
        setError('');
    };

    if (error) return <div className="flex items-center justify-center min-h-screen bg-black text-white text-2xl">{error}</div>;

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white relative">
            {status === 'waiting' && <h1 className="text-4xl">A aguardar o próximo cantor...</h1>}
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
                onError={(e) => { setError('Ocorreu um erro ao tentar reproduzir o vídeo.'); handleSkip(); }}
                className={`w-full h-full ${status === 'playing' ? 'block' : 'hidden'}`}
            />
        </div>
    );
}

