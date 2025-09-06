import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';

export default function SystemSettings() {
    const [settings, setSettings] = useState({
        preventDuplicates: false,
        cooldownHours: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    // Efeito para buscar as configurações iniciais quando a página carrega
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            if (decodedToken.role !== 'admin') {
                router.push('/home'); // Redireciona se não for admin
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

                if (!response.ok) {
                    throw new Error('Não foi possível carregar as configurações.');
                }

                const data = await response.json();
                setSettings({
                    preventDuplicates: data.preventDuplicates,
                    cooldownHours: data.cooldownHours
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [router]);

    // Função para lidar com a mudança nos campos
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prevSettings => ({
            ...prevSettings,
            [name]: type === 'checkbox' ? checked : parseInt(value, 10) || 0
        }));
    };

    // Função para guardar as configurações
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

            if (!response.ok) {
                throw new Error('Não foi possível guardar a alteração.');
            }

            // Se guardou com sucesso, volta para o menu
            router.push('/home');

        } catch (err) {
            setError(err.message);
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">A carregar configurações...</div>;
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Painel de Configurações</h1>

                {error && <p className="mb-4 p-3 text-center rounded-md bg-red-100 text-red-700">{error}</p>}

                {/* Regra de Duplicados */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
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

                <div className="mt-8 flex justify-between items-center">
                    <button
                        onClick={() => router.push('/home')}
                        className="text-blue-600 hover:underline"
                    >
                        &larr; Voltar ao Menu Principal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'A guardar...' : 'Guardar e Sair'}
                    </button>
                </div>
            </div>
        </div>
    );
}

