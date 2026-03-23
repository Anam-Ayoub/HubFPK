import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Award, MessageSquare, BookOpen, Calendar } from 'lucide-react';

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

  if (loading) return <div className="text-center py-20">Chargement du profil...</div>;
  if (!profile) return <div className="text-center py-20">Utilisateur introuvable.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1a5c3a]/5 rounded-bl-full"></div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-24 h-24 rounded-full bg-amber-400 flex items-center justify-center text-[#1a5c3a] text-3xl font-extrabold ring-4 ring-gray-50">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              profile.username.substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900">{profile.username}</h1>
            <p className="text-gray-500 font-medium italic">{profile.bio || "Aucune bio renseignée."}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                <Award className="w-4 h-4" /> {profile.karma || 0} Karma
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#1a5c3a] bg-[#1a5c3a]/5 px-3 py-1.5 rounded-full border border-[#1a5c3a]/10">
                <Calendar className="w-4 h-4" /> Membre depuis {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Threads */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 px-2">
            <BookOpen className="w-5 h-5 text-amber-500" /> Discussions lancées
          </h2>
          <div className="space-y-3">
            {profile.threads?.length === 0 ? (
              <p className="text-gray-400 text-sm italic px-2">Aucune discussion pour le moment.</p>
            ) : (
              profile.threads?.map(thread => (
                <Link 
                  key={thread.id} 
                  to={`/thread/${thread.id}`}
                  className="block bg-white p-4 rounded-xl border border-gray-100 hover:border-[#1a5c3a] transition-all"
                >
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{thread.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                    <span className="text-[#1a5c3a]">{thread.categories?.name}</span>
                    <span>•</span>
                    <span>il y a {formatDistanceToNow(new Date(thread.created_at), { locale: fr })}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* User Replies */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 px-2">
            <MessageSquare className="w-5 h-5 text-blue-500" /> Réponses récentes
          </h2>
          <div className="space-y-3">
            {profile.posts?.length === 0 ? (
              <p className="text-gray-400 text-sm italic px-2">Aucune réponse pour le moment.</p>
            ) : (
              profile.posts?.map(post => (
                <Link 
                  key={post.id} 
                  to={`/thread/${post.threads?.id}`}
                  className="block bg-white p-4 rounded-xl border border-gray-100 hover:border-[#1a5c3a] transition-all"
                >
                  <p className="text-sm text-gray-600 line-clamp-2 italic mb-2">"{post.content}"</p>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">
                    Dans : <span className="text-gray-900">{post.threads?.title}</span>
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
