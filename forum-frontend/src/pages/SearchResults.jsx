import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL;

export default function SearchResults() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/threads?query=${encodeURIComponent(query)}`);
        setThreads(res.data);
      } catch (err) {
        console.error('Error searching:', err);
      } finally {
        setLoading(false);
      }
    };
    if (query) fetchResults();
  }, [query]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#1a5c3a]/10 rounded-xl">
          <Search className="w-8 h-8 text-[#1a5c3a]" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Résultats pour "{query}"</h1>
          <p className="text-gray-500 font-medium">{threads.length} discussions trouvées</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Recherche en cours...</div>
        ) : threads.length === 0 ? (
          <div className="p-12 text-center text-gray-400 italic">Aucun résultat trouvé pour votre recherche.</div>
        ) : (
          threads.map(thread => (
            <Link 
              key={thread.id} 
              to={`/thread/${thread.id}`}
              className="block p-6 hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#1a5c3a]/10 text-[#1a5c3a] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                  {thread.categories?.name}
                </span>
                <span className="text-amber-600 text-[10px] font-bold uppercase">{thread.tag}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{thread.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {thread.body.replace(/[#*`]/g, '')}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="font-bold text-gray-700">{thread.profiles?.username}</span>
                <span>•</span>
                <span>il y a {formatDistanceToNow(new Date(thread.created_at), { locale: fr })}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
