import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import * as LucideIcons from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [recentThreads, setRecentThreads] = useState([]);
  const [stats, setStats] = useState({ users: 0, threads: 0, posts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, threadsRes] = await Promise.all([
          axios.get(`${API_URL}/api/categories`),
          axios.get(`${API_URL}/api/threads?limit=5`)
        ]);
        setCategories(catsRes.data);
        setRecentThreads(threadsRes.data);
        
        // Mock stats (in real app, fetch from a stats endpoint)
        setStats({ users: 124, threads: threadsRes.data.length, posts: 450 });
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const IconComponent = ({ name, ...props }) => {
    const Icon = LucideIcons[name] || LucideIcons.HelpCircle;
    return <Icon {...props} />;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a5c3a]"></div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-[#1a5c3a] tracking-tight">
          Bienvenue sur Hub<span className="text-amber-500">FPK</span>
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          L'espace d'échange et d'entraide pour les étudiants de la Faculté Polydisciplinaire de Khouribga.
        </p>
      </section>

      {/* Categories Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LucideIcons.LayoutGrid className="text-amber-500 w-5 h-5" />
            Départements & Espaces
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <Link 
              key={cat.id} 
              to={`/category/${cat.slug}`}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-[#1a5c3a] hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-[#1a5c3a]/10 transition-colors">
                  <IconComponent name={cat.icon} className="w-6 h-6 text-[#1a5c3a]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-[#1a5c3a] transition-colors">{cat.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                  <div className="flex items-center gap-3 mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span className="flex items-center gap-1">
                      <LucideIcons.MessageSquare className="w-3 h-3" /> {cat.thread_count || 0} Discussions
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Threads */}
        <section className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LucideIcons.Clock className="text-amber-500 w-5 h-5" />
            Discussions récentes
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {recentThreads.map((thread, idx) => (
              <Link 
                key={thread.id} 
                to={`/thread/${thread.id}`}
                className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${idx !== recentThreads.length - 1 ? 'border-b' : ''}`}
              >
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{thread.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-[#1a5c3a]/10 text-[#1a5c3a] px-2 py-0.5 rounded font-bold">
                      {thread.categories?.name}
                    </span>
                    <span>• Par <strong>{thread.profiles?.username}</strong></span>
                    <span>• {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true, locale: fr })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-900">{thread.view_count || 0}</p>
                    <p className="text-[10px] uppercase">Vues</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/new-thread" className="block text-center py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-[#1a5c3a] hover:text-[#1a5c3a] font-bold transition-all">
            + Lancer une nouvelle discussion
          </Link>
        </section>

        {/* Sidebar Stats & Info */}
        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">Statistiques HubFPK</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Membres</span>
                <span className="font-bold">{stats.users}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Sujets</span>
                <span className="font-bold">{stats.threads}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Réponses</span>
                <span className="font-bold">{stats.posts}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a5c3a] p-6 rounded-xl shadow-lg text-white">
            <h3 className="font-bold mb-2">Aide & Guide</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Consultez les annonces officielles pour les dates d'examens et les actualités de la faculté.
            </p>
            <Link to="/category/annonces" className="inline-block mt-4 text-sm font-bold text-amber-400 hover:text-amber-300">
              Voir les annonces →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
