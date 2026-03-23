import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as LucideIcons from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function CategoryView() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const catRes = await axios.get(`${API_URL}/api/categories/${slug}`);
        setCategory(catRes.data);
        
        const threadsRes = await axios.get(`${API_URL}/api/threads?category_id=${catRes.data.id}`);
        setThreads(threadsRes.data);
      } catch (err) {
        console.error('Error fetching category threads:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryData();
  }, [slug]);

  const IconComponent = ({ name, ...props }) => {
    const Icon = LucideIcons[name] || LucideIcons.HelpCircle;
    return <Icon {...props} />;
  };

  if (loading) return <div className="text-center py-20">Chargement du département...</div>;
  if (!category) return <div className="text-center py-20">Département introuvable.</div>;

  return (
    <div className="space-y-8">
      {/* Category Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
        <div className="p-4 bg-[#1a5c3a]/10 rounded-2xl">
          <IconComponent name={category.icon} className="w-10 h-10 text-[#1a5c3a]" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{category.name}</h1>
          <p className="text-gray-500 font-medium mt-1">{category.description}</p>
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-bold text-gray-800">Toutes les discussions</h2>
          <Link to="/new-thread" className="text-sm font-bold text-[#1a5c3a] hover:underline">+ Créer un sujet</Link>
        </div>

        {threads.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-100 text-center">
            <p className="text-gray-400 font-medium">Aucune discussion dans ce département pour le moment.</p>
            <Link to="/new-thread" className="inline-block mt-4 text-[#1a5c3a] font-bold">Soyez le premier à poster !</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y">
            {threads.map(thread => (
              <Link 
                key={thread.id} 
                to={`/thread/${thread.id}`}
                className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-all group"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {thread.is_pinned && <LucideIcons.Pin className="w-3 h-3 text-red-500 fill-red-500" />}
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-tighter">{thread.tag}</span>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1a5c3a] transition-colors">{thread.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="font-medium text-gray-600">Par {thread.profiles?.username}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(thread.created_at), { locale: fr, addSuffix: true })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-center text-gray-400 mr-4">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{thread.view_count || 0}</p>
                    <p className="text-[10px] uppercase">Vues</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-gray-900">{getScore(thread.votes)}</p>
                    <p className="text-[10px] uppercase">Votes</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function (since it's used in CategoryView too)
function getScore(votes) {
  if (!votes) return 0;
  return votes.reduce((acc, v) => acc + v.value, 0);
}
