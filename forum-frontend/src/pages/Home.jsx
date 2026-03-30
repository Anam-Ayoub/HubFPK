import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as LucideIcons from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Skeleton from '../components/Skeleton';

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [recentThreads, setRecentThreads] = useState([]);
  const [stats, setStats] = useState({ users: 0, threads: 0, posts: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, threadsRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/api/categories`),
          axios.get(`${API_URL}/api/threads?limit=10`),
          axios.get(`${API_URL}/api/stats`)
        ]);
        setCategories(catsRes.data);
        setRecentThreads(threadsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const IconComponent = ({ name, ...props }) => {
    const Icon = LucideIcons[name] || LucideIcons.HelpCircle;
    return <Icon {...props} />;
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Enhanced Hero Section */}
      <section className="relative py-16 px-6 overflow-hidden rounded-3xl bg-[#1a5c3a] text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-amber-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-white rounded-full blur-3xl opacity-10"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Tout l'univers <span className="text-amber-400">FPK</span> au même endroit.
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-medium max-w-2xl mx-auto">
              Rejoignez la plus grande communauté d'entraide étudiante de Khouribga. Posez vos questions, partagez vos cours et restez informés.
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto group">
            <input
              type="text"
              placeholder="Rechercher un cours, un sujet ou un camarade..."
              className="w-full bg-white text-gray-900 rounded-2xl py-5 pl-14 pr-6 shadow-2xl focus:ring-4 focus:ring-amber-400/30 outline-none transition-all text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <LucideIcons.Search className="absolute left-5 top-5.5 w-6 h-6 text-gray-400 group-focus-within:text-[#1a5c3a] transition-colors" />
            <button className="absolute right-3 top-2.5 bg-[#1a5c3a] hover:bg-[#14472d] text-white px-5 py-3 rounded-xl font-bold transition-all">
              Rechercher
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Populaire :</span>
            {['Annonces', 'Informatique', 'Examens', 'Stage'].map(tag => (
              <Link key={tag} to={`/search?q=${tag}`} className="text-sm font-bold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors">
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Categories & Recent */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Categories Grid */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black flex items-center gap-3 text-gray-900">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <LucideIcons.LayoutGrid className="text-amber-600 w-6 h-6" />
                </div>
                Explorer par Département
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading ? (
                [...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
              ) : (
                categories.map(cat => (
                  <Link 
                    key={cat.id} 
                    to={`/category/${cat.slug}`}
                    className="group relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-[#1a5c3a] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 group-hover:bg-[#1a5c3a]/5 transition-colors"></div>
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-[#1a5c3a] group-hover:text-white transition-all duration-300">
                        <IconComponent name={cat.icon} className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#1a5c3a] transition-colors">{cat.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">{cat.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#1a5c3a] bg-[#1a5c3a]/5 px-2 py-1 rounded">
                            {cat.thread_count || 0} Discussions
                          </span>
                        </div>
                      </div>
                      <LucideIcons.ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-[#1a5c3a] transition-all" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Recent Threads */}
          <section className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black flex items-center gap-3 text-gray-900">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <LucideIcons.Clock className="text-blue-600 w-6 h-6" />
                </div>
                Dernières Discussions
              </h2>
              <Link to="/new-thread" className="text-sm font-bold text-[#1a5c3a] hover:underline flex items-center gap-1">
                Toutes les discussions <LucideIcons.ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y overflow-hidden">
              {loading ? (
                [...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)
              ) : (
                recentThreads.map((thread) => (
                  <Link 
                    key={thread.id} 
                    to={`/thread/${thread.id}`}
                    className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-all group"
                  >
                    <div className="hidden sm:flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-white transition-colors">
                      <LucideIcons.MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-[#1a5c3a]" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-bold text-gray-900 group-hover:text-[#1a5c3a] transition-colors leading-tight">
                        {thread.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="bg-[#1a5c3a] text-white px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
                          {thread.categories?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <LucideIcons.User className="w-3 h-3" /> {thread.profiles?.username}
                        </span>
                        <span>• {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true, locale: fr })}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">{thread.view_count || 0}</p>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Vues</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            <Link to="/new-thread" className="flex items-center justify-center gap-2 py-6 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 hover:border-[#1a5c3a] hover:text-[#1a5c3a] hover:bg-[#1a5c3a]/5 font-black transition-all group">
              <LucideIcons.PlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              Lancer une nouvelle discussion sur HubFPK
            </Link>
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Stats Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -mr-16 -mt-16"></div>
            <h3 className="font-black text-gray-900 text-xl mb-8 relative z-10">Activité du Hub</h3>
            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="space-y-1">
                <p className="text-3xl font-black text-[#1a5c3a]">{stats.users}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Étudiants</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-[#1a5c3a]">{stats.threads}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Sujets</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-[#1a5c3a]">{stats.posts}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Messages</p>
              </div>
              <div className="space-y-1 flex items-center">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                      {i === 2 ? '+' : 'U'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Guide Card */}
          <div className="bg-[#1a5c3a] p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-500"></div>
            <LucideIcons.BookOpen className="w-12 h-12 text-amber-400 mb-6" />
            <h3 className="font-black text-2xl mb-4 relative z-10 text-amber-400">Guide de l'étudiant</h3>
            <p className="text-white/80 leading-relaxed mb-8 relative z-10 font-medium">
              Besoin d'aide pour vos inscriptions ou vos bourses ? Consultez notre base de connaissances partagée.
            </p>
            <Link to="/category/annonces" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-[#1a5c3a] px-6 py-3 rounded-xl font-black transition-all relative z-10">
              Voir le guide <LucideIcons.ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Rules Card */}
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
            <h4 className="font-black text-gray-900 mb-6 flex items-center gap-2">
              <LucideIcons.ShieldCheck className="text-[#1a5c3a] w-5 h-5" />
              Charte de la communauté
            </h4>
            <ul className="space-y-4">
              {[
                'Respect mutuel entre étudiants',
                'Pas de spam ou de publicité',
                'Utilisez les tags appropriés',
                'Partagez des ressources vérifiées'
              ].map((rule, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600 font-medium">
                  <span className="text-amber-500 font-black">0{i+1}.</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

        </aside>
      </div>
    </div>
  );
}
