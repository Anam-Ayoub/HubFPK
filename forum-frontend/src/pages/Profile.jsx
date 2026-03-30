import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Award, MessageSquare, BookOpen, Calendar, 
  User, Shield, TrendingUp, ChevronRight, SearchX
} from 'lucide-react';
import Skeleton from '../components/Skeleton';

const API_URL = import.meta.env.VITE_API_URL;

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/profiles/${username}`);
        setProfile(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Skeleton className="h-64 rounded-[2.5rem]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="h-96 rounded-[2rem]" />
        <Skeleton className="h-96 rounded-[2rem]" />
      </div>
    </div>
  );

  if (!profile) return (
    <div className="text-center py-24 space-y-4">
      <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-400">
        <SearchX className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-black text-gray-900">Utilisateur introuvable</h2>
      <Link to="/" className="inline-block bg-[#1a5c3a] text-white px-6 py-2 rounded-xl font-bold">Retour à l'accueil</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* Profile Header Hero */}
      <div className="relative bg-white p-10 sm:p-14 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1a5c3a]/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#1a5c3a] to-amber-400 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative w-32 h-32 rounded-full bg-white p-1">
              <div className="w-full h-full rounded-full bg-amber-400 flex items-center justify-center text-[#1a5c3a] text-4xl font-black shadow-inner overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.username.substring(0, 1).toUpperCase()
                )}
              </div>
            </div>
            {profile.karma > 100 && (
              <div className="absolute -bottom-2 -right-2 bg-[#1a5c3a] text-white p-2 rounded-xl shadow-lg border-2 border-white">
                <Shield className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">@{profile.username}</h1>
              <p className="text-lg text-gray-500 font-medium italic">"{profile.bio || "Étudiant à la FPK Khouribga"}"</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm">
                <Award className="w-4 h-4" /> {profile.karma || 0} Karma
              </div>
              <div className="flex items-center gap-2 bg-[#1a5c3a]/5 text-[#1a5c3a] px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest">
                <Calendar className="w-4 h-4" /> Membre depuis {new Date(profile.created_at).getFullYear()}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-gray-50 p-6 rounded-3xl text-center border border-gray-100">
              <p className="text-2xl font-black text-gray-900 leading-none">{profile.threads?.length || 0}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase mt-2 tracking-widest">Sujets</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl text-center border border-gray-100">
              <p className="text-2xl font-black text-gray-900 leading-none">{profile.posts?.length || 0}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase mt-2 tracking-widest">Réponses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* User's Threads */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-3 px-4 text-gray-900">
            <div className="p-2 bg-amber-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            Discussions lancées
          </h2>
          <div className="space-y-4">
            {profile.threads?.length === 0 ? (
              <div className="bg-white p-12 rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
                <p className="text-gray-400 font-bold italic">Aucune discussion lancée pour le moment.</p>
              </div>
            ) : (
              profile.threads?.map(thread => (
                <Link 
                  key={thread.id} 
                  to={`/thread/${thread.id}`}
                  className="group block bg-white p-6 rounded-[2rem] border border-gray-100 hover:border-[#1a5c3a] hover:shadow-xl hover:shadow-[#1a5c3a]/5 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-[#1a5c3a] uppercase tracking-widest bg-[#1a5c3a]/5 px-2 py-1 rounded">
                      {thread.categories?.name || 'Discussion'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {formatDistanceToNow(new Date(thread.created_at), { locale: fr, addSuffix: true })}
                    </span>
                  </div>
                  <h3 className="font-black text-gray-900 group-hover:text-[#1a5c3a] transition-colors leading-tight mb-4">
                    {thread.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-black text-[#1a5c3a] opacity-0 group-hover:opacity-100 transition-opacity">
                    Voir la discussion <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* User's Replies */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-3 px-4 text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            Contributions récentes
          </h2>
          <div className="space-y-4">
            {profile.posts?.length === 0 ? (
              <div className="bg-white p-12 rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
                <p className="text-gray-400 font-bold italic">Aucune contribution pour le moment.</p>
              </div>
            ) : (
              profile.posts?.map(post => (
                <Link 
                  key={post.id} 
                  to={`/thread/${post.threads?.id}`}
                  className="group block bg-gray-50/50 p-6 rounded-[2rem] border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                >
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    <MessageSquare className="w-3 h-3 text-blue-500" />
                    Réponse dans : <span className="text-gray-900">{post.threads?.title}</span>
                  </div>
                  <p className="text-gray-600 font-medium line-clamp-2 leading-relaxed italic">"{post.content}"</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {formatDistanceToNow(new Date(post.created_at), { locale: fr, addSuffix: true })}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
