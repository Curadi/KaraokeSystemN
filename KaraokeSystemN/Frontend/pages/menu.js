import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Menu() {
    const [pdfUrl, setPdfUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/');
            return;
        }

        const fetchPdf = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:7001/api/assets/menu', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Não foi possível carregar o cardápio.');
                }

                const pdfBlob = await response.blob();
                const url = URL.createObjectURL(pdfBlob);
                setPdfUrl(url);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPdf();

        // Limpa a URL de objeto quando o utilizador sai da página para libertar memória
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [router]);

    return (
        <div className="flex flex-col h-screen bg-gray-200">
            <header className="bg-white shadow-md p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Cardápio</h1>
                <button onClick={() => router.back()} className="text-blue-600 hover:underline">
                    &larr; Voltar
                </button>
            </header>
            <main className="flex-grow">
                {isLoading && <p className="text-center mt-10">A carregar o cardápio...</p>}
                {error && <p className="text-center mt-10 text-red-600">Erro: {error}</p>}
                {pdfUrl && !error && (
                    <iframe
                        src={pdfUrl}
                        title="Cardápio"
                        className="w-full h-full border-none"
                    />
                )}
            </main>
        </div>
    );
}
