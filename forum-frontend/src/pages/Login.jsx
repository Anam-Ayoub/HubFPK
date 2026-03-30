import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, GraduationCap } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegisterPage = location.pathname === '/register';

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(isRegisterPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state with URL if it changes
  useEffect(() => {
    setIsRegister(location.pathname === '/register');
  }, [location.pathname]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        if (!username.trim()) throw new Error("Le nom d'utilisateur est requis");
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              username: username.trim()
            }
          }
        });
        if (error) throw error;
        alert('Inscription réussie ! Vérifiez vos emails.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-[#1a5c3a] p-8 text-center text-white">
        <div className="bg-amber-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1a5c3a]">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">
          {isRegister ? "Rejoindre HubFPK" : "Espace Étudiant HubFPK"}
        </h2>
        <p className="text-[#1a5c3a] bg-amber-400/90 text-[10px] font-extrabold uppercase tracking-[0.2em] px-3 py-1 rounded-full inline-block mt-3 shadow-sm">
          Faculté Polydisciplinaire de Khouribga
        </p>
      </div>

      <div className="p-8">
        <form onSubmit={handleAuth} className="space-y-5">
          {isRegister && (
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-widest pl-1">Nom d'utilisateur</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1a5c3a]/20 outline-none transition-all font-medium text-sm"
                  placeholder="Choisissez un pseudo..."
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
                <UserPlus className="w-4 h-4 text-gray-400 absolute left-3.5 top-4" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-500 uppercase tracking-widest pl-1">Email académique</label>
            <div className="relative">
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1a5c3a]/20 outline-none transition-all font-medium text-sm"
                placeholder="nom.prenom@fpk.ac.ma"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-4" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-500 uppercase tracking-widest pl-1">Mot de passe</label>
            <div className="relative">
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1a5c3a]/20 outline-none transition-all font-medium text-sm"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-4" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100 animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a5c3a] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#14472d] transition-all shadow-lg shadow-[#1a5c3a]/20 disabled:bg-gray-400"
          >
            {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            {loading ? "Traitement en cours..." : isRegister ? "S'inscrire" : "Se connecter"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <button
            onClick={() => navigate(isRegister ? '/login' : '/register')}
            className="text-sm font-bold text-[#1a5c3a] hover:underline"
          >
            {isRegister ? "Déjà un compte ? Connectez-vous" : "Pas encore inscrit ? Créer un compte"}
          </button>
        </div>
      </div>
    </div>
  );
}
