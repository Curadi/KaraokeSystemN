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

    const fetchNextSong = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/');
            return;
        }
        console.log('A verificar o player...');
        try {
            const response = await fetch('http://localhost:7001/api/player/next', {
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
            console.error('Falha ao verificar o player:', err);
        }
    };

    useEffect(() => {
        if (status !== 'confirming') return;
        if (countdown === 0) {
            handleSkip();
            return;
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [status, countdown]);

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

    const informBackendVideoFinished = async () => {
        const token = localStorage.getItem('authToken');
        try {
            await fetch('http://localhost:7001/api/player/finished', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Erro ao informar o fim do vídeo:", err);
        }
    };

    const handleVideoEnd = async () => {
        console.log(`O vídeo "${currentSong.songName}" terminou.`);
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

        await informBackendVideoFinished();
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
                // Revoga a URL antiga se ela existir, para libertar memória
                if (videoRef.current.src) {
                    URL.revokeObjectURL(videoRef.current.src);
                }
                // Cria e atribui a nova URL
                videoRef.current.src = URL.createObjectURL(videoBlob);
                videoRef.current.load(); // Ajuda a garantir que o novo source é carregado
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error("Erro na reprodução automática:", error);
                        // Fornece um erro mais amigável se o autoplay falhar
                        setError("Não foi possível iniciar a reprodução. Clique no play.");
                    });
                }
            }

        } catch (err) {
            console.error("Erro detalhado ao carregar o vídeo:", err);
            setError('Erro ao carregar o vídeo. A voltar ao início.');
            setTimeout(resetPlayer, 3000);
        }
    };

    const handleSkip = async () => {
        await informBackendVideoFinished();
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

    if (error) {
        return <div className="flex items-center justify-center min-h-screen bg-black text-white text-2xl">{error}</div>;
    }

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
                onError={(e) => {
                    // Adiciona um log de erro mais detalhado na consola do navegador
                    const videoError = e.target.error;
                    console.error('Erro no elemento de vídeo:', videoError);
                    let errorMessage = 'Ocorreu um erro ao tentar reproduzir o vídeo.';
                    if (videoError) {
                        switch (videoError.code) {
                            case videoError.MEDIA_ERR_DECODE:
                                errorMessage = 'Ocorreu um erro na descodificação do vídeo. O ficheiro pode estar corrompido ou num formato não suportado.';
                                break;
                            case videoError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                errorMessage = 'O formato do vídeo não é suportado.';
                                break;
                            default:
                                errorMessage = 'Ocorreu um erro desconhecido no vídeo.';
                                break;
                        }
                    }
                    setError(errorMessage);
                    handleSkip();
                }}
                className={`w-full h-full ${status === 'playing' ? 'block' : 'hidden'}`}
            />
        </div>
    );
}

