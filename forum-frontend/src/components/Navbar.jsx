import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useEffect, useState } from 'react';
import { 
  Search, Bell, User, LogOut, PlusCircle, 
  MessageSquare, Star, Zap, ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
  };

  const fetchNotifications = async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    setNotifications(data || []);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
        fetchNotifications(currentUser.id);
        
        // Subscribe to notifications
        const channel = supabase
          .channel(`notifs:${currentUser.id}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUser.id}` },
            (payload) => {
              setNotifications(prev => [payload.new, ...prev]);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
        fetchNotifications(currentUser.id);
      } else {
        setProfile(null);
        setNotifications([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <nav className="bg-[#1a5c3a] text-white sticky top-0 z-50 shadow-2xl shadow-[#1a5c3a]/20 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-amber-400 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <Zap className="w-6 h-6 text-[#1a5c3a] fill-[#1a5c3a]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter leading-none">Hub<span className="text-amber-400">FPK</span></span>
              <span className="text-[9px] uppercase font-black tracking-[0.2em] text-white/60">Community</span>
            </div>
          </Link>

          {/* Search Bar Section */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-12 relative group">
            <input
              type="text"
              placeholder="Rechercher sur le Hub..."
              className="w-full bg-white/10 border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 focus:bg-white focus:text-gray-900 focus:ring-4 focus:ring-amber-400/20 focus:outline-none transition-all placeholder:text-white/40 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-4 top-3 w-5 h-5 text-white/30 group-focus-within:text-[#1a5c3a] transition-colors" />
            <div className="absolute right-3 top-2.5 px-2 py-0.5 bg-white/5 rounded text-[10px] font-black text-white/40 border border-white/10 group-focus-within:hidden">
              CTRL + K
            </div>
          </form>

          {/* Actions Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Desktop "New" button */}
                <Link 
                  to="/new-thread" 
                  className="hidden sm:flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-[#1a5c3a] px-5 py-2.5 rounded-2xl text-sm font-black transition-all shadow-lg shadow-amber-400/20 hover:-translate-y-0.5"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Publier</span>
                </Link>

                {/* Notifications Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`p-3 rounded-2xl transition-all relative ${isNotifOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
                  >
                    <Bell className="w-6 h-6" />
                    {notifications.length > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1a5c3a] animate-bounce"></span>
                    )}
                  </button>
                  
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 py-4 text-gray-900 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-6 py-2 border-b border-gray-50 flex justify-between items-center mb-2">
                        <h3 className="font-black text-sm uppercase tracking-widest text-gray-400">Notifications</h3>
                        {notifications.length > 0 && <button className="text-[10px] font-black text-[#1a5c3a] hover:underline">Tout marquer lu</button>}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-6 py-8 text-center">
                            <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Bell className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-sm font-bold text-gray-400">Aucune nouvelle notification</p>
                          </div>
                        ) : (
                          notifications.map(n => (
                            <button key={n.id} className="w-full px-6 py-4 hover:bg-gray-50 text-left transition-colors flex gap-4">
                              <div className="bg-amber-100 p-2 rounded-xl h-fit mt-1">
                                <MessageSquare className="w-4 h-4 text-amber-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold leading-tight">Nouveau message sur votre discussion</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Il y a 2 min</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Section */}
                <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                  <div className="hidden lg:flex flex-col items-end mr-2">
                    <span className="text-xs font-black">@{profile?.username}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-black text-amber-400">{profile?.karma || 0} Karma</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="w-12 h-12 rounded-2xl bg-amber-400 p-0.5 transition-all hover:rotate-3"
                    >
                      <div className="w-full h-full rounded-[14px] bg-[#1a5c3a] flex items-center justify-center font-black text-[#1a5c3a] overflow-hidden">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-amber-400 flex items-center justify-center">
                            {profile?.username?.substring(0,1).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-4 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 py-2 text-gray-900 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-gray-50 mb-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Connecté en tant que</p>
                          <p className="font-black text-sm text-[#1a5c3a]">@{profile?.username}</p>
                        </div>
                        <Link to={`/profile/${profile?.username}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm font-bold transition-colors">
                          <User className="w-4 h-4 text-gray-400" /> Mon Profil
                        </Link>
                        <button 
                          onClick={() => supabase.auth.signOut()}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm font-bold text-red-500 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-black hover:text-amber-400 transition-colors">Connexion</Link>
                <Link to="/register" className="bg-white text-[#1a5c3a] px-6 py-3 rounded-2xl text-sm font-black hover:bg-gray-100 transition-all shadow-xl shadow-black/10">S'inscrire</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
