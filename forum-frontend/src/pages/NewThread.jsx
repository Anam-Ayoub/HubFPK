import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../supabaseClient';
import { Save, Eye, Edit3 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function NewThread() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category_id: '',
    tag: 'Discussion'
  });
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      setUser(session?.user);
    });

    axios.get(`${API_URL}/api/categories`).then(res => setCategories(res.data));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.body || !formData.category_id) {
      return alert('Veuillez remplir tous les champs');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('threads')
        .insert([{
          ...formData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      navigate(`/thread/${data.id}`);
    } catch (err) {
      console.error('Error creating thread:', err);
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a5c3a]">Nouvelle Discussion</h1>
        <p className="text-gray-500 font-medium">Partagez une question, une ressource ou lancez un débat avec vos camarades.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <input
              type="text"
              placeholder="Titre de votre discussion..."
              className="w-full text-xl font-bold p-0 border-none focus:ring-0 placeholder:text-gray-300"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
            <hr />
            
            <div className="flex items-center gap-4 mb-2">
              <button 
                type="button" 
                onClick={() => setIsPreview(false)}
                className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-bold ${!isPreview ? 'bg-[#1a5c3a] text-white' : 'text-gray-500'}`}
              >
                <Edit3 className="w-4 h-4" /> Éditeur
              </button>
              <button 
                type="button" 
                onClick={() => setIsPreview(true)}
                className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-bold ${isPreview ? 'bg-[#1a5c3a] text-white' : 'text-gray-500'}`}
              >
                <Eye className="w-4 h-4" /> Aperçu
              </button>
            </div>

            {isPreview ? (
              <div className="min-h-[400px] p-4 bg-gray-50 rounded-xl prose prose-slate max-w-none">
                <ReactMarkdown>{formData.body || '*Rien à prévisualiser pour le moment...*'}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                placeholder="Écrivez ici... Vous pouvez utiliser le format Markdown (# Titre, **Gras**, etc.)"
                className="w-full h-[400px] p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#1a5c3a]/20 resize-none font-mono text-sm"
                value={formData.body}
                onChange={e => setFormData({...formData, body: e.target.value})}
              />
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Département</label>
              <select 
                className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-[#1a5c3a] outline-none"
                value={formData.category_id}
                onChange={e => setFormData({...formData, category_id: e.target.value})}
              >
                <option value="">Sélectionner...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tag</label>
              <div className="grid grid-cols-2 gap-2">
                {['Question', 'Discussion', 'Ressource', 'Annonce'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFormData({...formData, tag})}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${formData.tag === tag ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a5c3a] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#14472d] transition-all shadow-lg shadow-[#1a5c3a]/20 disabled:bg-gray-400"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Publication...' : 'Publier sur HubFPK'}
            </button>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <h4 className="font-bold text-amber-800 text-sm mb-2">Conseils d'écriture</h4>
            <ul className="text-xs text-amber-700 space-y-2 list-disc pl-4">
              <li>Soyez précis dans votre titre.</li>
              <li>Utilisez des blocs de code pour la programmation.</li>
              <li>Restez courtois et académique.</li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}
