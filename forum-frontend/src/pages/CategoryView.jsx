import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as LucideIcons from 'lucide-react';
import Skeleton from '../components/Skeleton';

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

  const getScore = (votes) => {
    if (!votes) return 0;
    return votes.reduce((acc, v) => acc + v.value, 0);
  };

  if (loading) return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Skeleton className="h-48 rounded-3xl" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
    </div>
  );

  if (!category) return (
    <div className="text-center py-24 space-y-4">
      <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-400">
        <LucideIcons.SearchX className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-black text-gray-900">Département introuvable</h2>
      <Link to="/" className="inline-block bg-[#1a5c3a] text-white px-6 py-2 rounded-xl font-bold">Retour à l'accueil</Link>
    </div>
  );

  return (
    <div className="space-y-12 pb-20 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* Category Header Card */}
      <div className="relative bg-[#1a5c3a] p-10 sm:p-14 rounded-[2.5rem] shadow-2xl shadow-[#1a5c3a]/20 overflow-hidden text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-400 rounded-full blur-3xl opacity-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl">
            <IconComponent name={category.icon} className="w-12 h-12 text-amber-400" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="bg-amber-400 text-[#1a5c3a] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-400/20">
                Département
              </span>
              <span className="text-white/60 text-xs font-bold uppercase tracking-widest">• {threads.length} Sujets ouverts</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">{category.name}</h1>
            <p className="text-lg text-white/70 font-medium max-w-2xl">{category.description}</p>
          </div>
          <div className="pt-4">
            <Link to="/new-thread" className="bg-white text-[#1a5c3a] hover:bg-amber-400 hover:text-[#1a5c3a] px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-black/10 flex items-center gap-2 group">
              <LucideIcons.PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Nouveau sujet
            </Link>
          </div>
        </div>
      </div>

      {/* Threads List */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <LucideIcons.LayoutList className="text-amber-500 w-7 h-7" />
            Discussions récentes
          </h2>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            {['Plus récents', 'Plus vus', 'Top votes'].map(filter => (
              <button key={filter} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filter === 'Plus récents' ? 'bg-[#1a5c3a] text-white shadow-lg shadow-[#1a5c3a]/20' : 'text-gray-400 hover:bg-gray-50'}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        {threads.length === 0 ? (
          <div className="bg-white p-20 rounded-[2.5rem] border-4 border-dashed border-gray-100 text-center space-y-6">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
              <LucideIcons.MessageSquareX className="w-12 h-12 text-gray-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900">Aucune discussion ici</h3>
              <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm">Soyez le premier à lancer un débat ou poser une question dans ce département.</p>
            </div>
            <Link to="/new-thread" className="inline-block bg-[#1a5c3a] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-[#1a5c3a]/20">
              Lancer la discussion
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {threads.map(thread => (
              <Link 
                key={thread.id} 
                to={`/thread/${thread.id}`}
                className="flex flex-col sm:flex-row items-center gap-6 p-8 hover:bg-gray-50/80 transition-all group"
              >
                <div className="flex-1 w-full space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {thread.is_pinned && <LucideIcons.Pin className="w-4 h-4 text-red-500 fill-red-500" />}
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      thread.tag === 'Annonce' ? 'bg-red-100 text-red-600' :
                      thread.tag === 'Ressource' ? 'bg-blue-100 text-blue-600' :
                      thread.tag === 'Question' ? 'bg-amber-100 text-amber-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {thread.tag}
                    </span>
                    <h3 className="font-black text-xl text-gray-900 group-hover:text-[#1a5c3a] transition-colors leading-tight">
                      {thread.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center font-black text-[10px] text-[#1a5c3a]">
                        {thread.profiles?.username?.substring(0,1).toUpperCase()}
                      </div>
                      <span className="text-gray-900 font-bold hover:underline cursor-pointer">@{thread.profiles?.username}</span>
                    </div>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <LucideIcons.Calendar className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(thread.created_at), { locale: fr, addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end sm:border-l border-gray-100 sm:pl-8">
                  <div className="text-center group-hover:scale-110 transition-transform">
                    <p className="text-lg font-black text-gray-900 leading-none">{thread.view_count || 0}</p>
                    <p className="text-[10px] uppercase font-black text-gray-400 mt-1">Vues</p>
                  </div>
                  <div className="text-center group-hover:scale-110 transition-transform">
                    <p className="text-lg font-black text-gray-900 leading-none">{getScore(thread.votes)}</p>
                    <p className="text-[10px] uppercase font-black text-gray-400 mt-1">Votes</p>
                  </div>
                  <LucideIcons.ChevronRight className="w-6 h-6 text-gray-200 group-hover:text-[#1a5c3a] group-hover:translate-x-1 transition-all hidden sm:block" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
