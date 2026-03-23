import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useEffect, useState } from 'react';
import { Search, Bell, User, LogOut, Menu, X, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  const getInitials = (name) => {
    return name?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <nav className="bg-[#1a5c3a] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">Hub<span className="text-amber-400">FPK</span></span>
            <span className="hidden md:block text-[10px] uppercase tracking-widest opacity-80 border-l border-white/20 pl-2 mt-1">
              La communauté étudiante
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Rechercher une discussion..."
              className="w-full bg-white/10 border border-white/20 rounded-lg py-1.5 pl-10 pr-4 focus:bg-white focus:text-gray-900 focus:outline-none transition-all placeholder:text-white/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2 w-5 h-5 text-white/50 pointer-events-none" />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <>
                <Link to="/new-thread" className="hidden md:flex items-center gap-1 bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                  <PlusCircle className="w-4 h-4" /> Nouveau
                </Link>
                <button className="p-2 hover:bg-white/10 rounded-full relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a5c3a]"></span>
                </button>
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/20">
                  <Link to={`/profile/${profile?.username}`} className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-[#1a5c3a] font-bold text-xs ring-2 ring-white/20 group-hover:ring-amber-400 transition-all">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(profile?.username)
                      )}
                    </div>
                    <span className="hidden lg:block text-sm font-medium hover:text-amber-400 transition-colors">
                      {profile?.username}
                    </span>
                  </Link>
                  <button onClick={() => supabase.auth.signOut()} className="p-2 hover:text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium hover:text-amber-400 px-3 py-2">Connexion</Link>
                <Link to="/login" className="bg-white text-[#1a5c3a] px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-all">S'inscrire</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
