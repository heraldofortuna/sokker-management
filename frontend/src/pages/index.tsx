import { Geist, Geist_Mono } from "next/font/google";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Interfaz para los datos del jugador
interface Player {
  name: string;
  age: string;
  value: string;
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos del servicio
  const fetchPlayerData = async () => {
    setTimeout(() => {
      if (loading) {
        setError('Request is taking too long. The server might be waking up.');
        setLoading(false);
      }
    }, 10000);

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headless: true,
          screenshot: false
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setPlayers(data.players || []);
      } else {
        throw new Error(data.message || 'Error en el servidor');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} font-sans min-h-screen p-8 pb-20`}
    >
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">
          Sokker Management
        </h1>
        <p className="text-lg text-center mb-8 max-w-[600px] mx-auto">
          Manage your Sokker teams efficiently with our comprehensive tool.
          Track player stats, team performance, and more all in one place.
        </p>

        {/* Botón para obtener datos */}
        <div className="text-center mb-8">
          <button
            onClick={fetchPlayerData}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Get Team Data'}
          </button>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2">Connecting to Sokker.org...</p>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Tabla de jugadores */}
        {players.length > 0 && (
          <div className="overflow-x-auto">
            <h2 className="text-2xl font-semibold mb-4">Team Players</h2>
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Age</th>
                  <th className="py-2 px-4 border-b">Value</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 px-4 border-b">{player.name}</td>
                    <td className="py-2 px-4 border-b">{player.age}</td>
                    <td className="py-2 px-4 border-b">{player.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mensaje cuando no hay datos */}
        {!loading && players.length === 0 && !error && (
          <div className="text-center py-8 text-gray-500">
            <p>Click "Get Team Data" to load your player information</p>
          </div>
        )}
      </main>
      
      <footer className="mt-12 text-center text-gray-500">
        <p>Data sourced from Sokker.org</p>
      </footer>
    </div>
  );
}