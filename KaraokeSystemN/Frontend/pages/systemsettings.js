import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';

export default function SystemSettings() {
    const [settings, setSettings] = useState({
        preventDuplicates: false,
        cooldownHours: 0,
        confirmationTimeoutSeconds: 20,
        originalVideosPath: '',
        convertedVideosPath: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [conversionStatus, setConversionStatus] = useState('Ocioso');
    const pollingIntervalRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/');
            return;
        }
        try {
            const decodedToken = jwtDecode(token);
            if (decodedToken.role !== 'admin') {
                router.push('/home');
                return;
            }
        } catch (e) {
            router.push('/');
            return;
        }

        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:7001/api/settings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Não foi possível carregar as configurações.');

                const data = await response.json();
                setSettings(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [router]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prevSettings => ({
            ...prevSettings,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) || 0 : value)
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch('http://localhost:7001/api/settings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            if (!response.ok) throw new Error('Não foi possível guardar a alteração.');
            router.push('/home');
        } catch (err) {
            setError(err.message);
            setIsSaving(false);
        }
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    const fetchConversionStatus = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch('http://localhost:7001/api/settings/convert-videos/status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setConversionStatus(data.status);
                if (data.status.includes("Concluído") || data.status.includes("Erro")) {
                    stopPolling();
                    setIsConverting(false);
                }
            }
        } catch (err) {
            console.error("Erro ao buscar estado da conversão:", err);
            setConversionStatus("Erro ao buscar estado.");
            stopPolling();
        }
    };

    const handleConvertVideos = async () => {
        setIsConverting(true);
        setConversionStatus('A iniciar o processo...');
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch('http://localhost:7001/api/settings/convert-videos', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Não foi possível iniciar a conversão.');

            pollingIntervalRef.current = setInterval(fetchConversionStatus, 3000);

        } catch (err) {
            setConversionStatus(`Erro: ${err.message}`);
            setIsConverting(false);
        }
    };

    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, []);

    if (isLoading) return <div className="text-center p-10">A carregar configurações...</div>;

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Painel de Configurações</h1>
                {error && <p className="mb-4 p-3 text-center rounded-md bg-red-100 text-red-700">{error}</p>}

                <div className="space-y-6">
                    {/* Regra de Duplicados */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-lg text-gray-700">Regras da Fila</h2>
                                <p className="text-sm text-gray-500">Impedir que o mesmo utilizador adicione mais de uma música na fila.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="preventDuplicates"
                                    checked={settings.preventDuplicates}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Regra de Cooldown */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-lg text-gray-700">Cooldown de Músicas</h2>
                                <p className="text-sm text-gray-500">Tempo (em horas) até uma música poder ser escolhida novamente.</p>
                            </div>
                            <input
                                type="number"
                                name="cooldownHours"
                                value={settings.cooldownHours}
                                onChange={handleChange}
                                className="w-20 p-2 border rounded-md text-center"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Tempo de Confirmação */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-lg text-gray-700">Tempo de Confirmação</h2>
                                <p className="text-sm text-gray-500">Tempo (em segundos) que o cantor tem para confirmar a música.</p>
                            </div>
                            <input
                                type="number"
                                name="confirmationTimeoutSeconds"
                                value={settings.confirmationTimeoutSeconds}
                                onChange={handleChange}
                                className="w-20 p-2 border rounded-md text-center"
                                min="5"
                            />
                        </div>
                    </div>

                    {/* --- BLOCO DE GESTÃO E MANUTENÇÃO DE VÍDEOS UNIFICADO --- */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="font-bold text-lg text-gray-700 mb-2">Conversor de Vídeos</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="space-y-3">
                                    <div>
                                        <label htmlFor="originalVideosPath" className="block text-sm font-medium text-gray-600">Pasta de Vídeos Originais</label>
                                        <input
                                            id="originalVideosPath"
                                            type="text"
                                            name="originalVideosPath"
                                            value={settings.originalVideosPath}
                                            onChange={handleChange}
                                            className="w-full mt-1 p-2 border rounded-md"
                                            placeholder="/app/videos"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="convertedVideosPath" className="block text-sm font-medium text-gray-600">Pasta de Vídeos Convertidos</label>
                                        <input
                                            id="convertedVideosPath"
                                            type="text"
                                            name="convertedVideosPath"
                                            value={settings.convertedVideosPath}
                                            onChange={handleChange}
                                            className="w-full mt-1 p-2 border rounded-md"
                                            placeholder="/app/videos/converted"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-500 mb-4">
                                    Clique no botão abaixo para converter todos os vídeos para um formato compatível.
                                </p>
                                <button
                                    onClick={handleConvertVideos}
                                    disabled={isConverting}
                                    className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {isConverting ? 'Conversão em progresso...' : 'Iniciar Conversão de Vídeos'}
                                </button>
                                {(isConverting || conversionStatus !== 'Ocioso') &&
                                    <p className="mt-3 text-sm text-center text-gray-600 font-medium">{conversionStatus}</p>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                    <button onClick={() => router.push('/home')} className="text-blue-600 hover:underline">
                        &larr; Voltar ao Menu Principal
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                        {isSaving ? 'Salvando...' : 'Salvar e Sair'}
                    </button>
                </div>
            </div>
        </div>
    );
}

