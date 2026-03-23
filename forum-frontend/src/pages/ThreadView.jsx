import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronUp, ChevronDown, MessageSquare, Share2, Award, CornerDownRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

export default function ThreadView() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyTo, setReplyTo] = useState(null); // ID of post being replied to

  const fetchThread = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/threads/${id}`);
      setThread(res.data);
    } catch (err) {
      console.error('Error fetching thread:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    fetchThread();
  }, [id, fetchThread]);

  const handleVote = async (targetId, targetType, value) => {
    if (!user) return alert('Veuillez vous connecter pour voter');
    try {
      // Upsert vote (Supabase will handle the unique constraint based on setup.sql)
      const { error } = await supabase
        .from('votes')
        .upsert([{
          user_id: user.id,
          target_id: targetId,
          target_type: targetType,
          value: value
        }], { onConflict: 'user_id, target_id' });

      if (error) throw error;
      fetchThread(); // Refresh to show new counts
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!user) return alert('Connectez-vous pour répondre');
    if (!replyContent.trim()) return;

    try {
      const { error } = await supabase
        .from('posts')
        .insert([{
          content: replyContent,
          thread_id: id,
          user_id: user.id,
          parent_post_id: replyTo
        }]);

      if (error) throw error;
      setReplyContent('');
      setReplyTo(null);
      fetchThread();
    } catch (err) {
      console.error('Error replying:', err);
    }
  };

  const getScore = (votes) => {
    if (!votes) return 0;
    return votes.reduce((acc, v) => acc + v.value, 0);
  };

  if (loading) return <div className="text-center py-20">Chargement de la discussion...</div>;
  if (!thread) return <div className="text-center py-20">Discussion introuvable.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Thread Header & Body */}
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex">
          {/* Side Vote Bar */}
          <div className="w-12 bg-gray-50 flex flex-col items-center py-4 border-r gap-1">
            <button 
              onClick={() => handleVote(thread.id, 'thread', 1)}
              className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-amber-600 transition-colors"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <span className="font-bold text-sm">{getScore(thread.votes)}</span>
            <button 
              onClick={() => handleVote(thread.id, 'thread', -1)}
              className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 text-xs">
              <span className="bg-[#1a5c3a] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                {thread.categories?.name}
              </span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                {thread.tag}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">Posté par <strong>{thread.profiles?.username}</strong></span>
              <span className="text-gray-400">il y a {formatDistanceToNow(new Date(thread.created_at), { locale: fr })}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
              {thread.title}
            </h1>

            <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
              <ReactMarkdown>{thread.body}</ReactMarkdown>
            </div>

            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-gray-50">
              <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#1a5c3a] transition-colors">
                <MessageSquare className="w-4 h-4" /> {thread.posts?.length || 0} Réponses
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Lien copié !');
                }}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#1a5c3a] transition-colors"
              >
                <Share2 className="w-4 h-4" /> Partager
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Replies Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 px-2">Réponses</h2>
        
        {/* Reply Form */}
        {user ? (
          <form onSubmit={submitReply} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            {replyTo && (
              <div className="flex items-center justify-between bg-blue-50 px-4 py-2 rounded-lg text-sm text-blue-700">
                <span>Répondre à un commentaire</span>
                <button type="button" onClick={() => setReplyTo(null)} className="font-bold underline">Annuler</button>
              </div>
            )}
            <textarea
              className="w-full p-4 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1a5c3a] focus:outline-none transition-all resize-none h-32"
              placeholder="Partagez votre avis ou aidez ce camarade..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div className="flex justify-end">
              <button className="bg-[#1a5c3a] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#14472d] transition-colors shadow-lg shadow-[#1a5c3a]/20">
                Publier la réponse
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-100 p-8 rounded-xl text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-600 font-medium mb-4">Vous devez être connecté pour participer à la discussion.</p>
            <Link to="/login" className="bg-[#1a5c3a] text-white px-6 py-2 rounded-lg font-bold">Se connecter</Link>
          </div>
        )}

        {/* List of Posts */}
        <div className="space-y-4">
          {thread.posts?.filter(p => !p.parent_post_id).map(post => (
            <div key={post.id} className="space-y-4">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                {/* Vote vertical */}
                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => handleVote(post.id, 'post', 1)} className="text-gray-400 hover:text-amber-600"><ChevronUp className="w-5 h-5" /></button>
                  <span className="text-xs font-bold">{getScore(post.votes)}</span>
                  <button onClick={() => handleVote(post.id, 'post', -1)} className="text-gray-400 hover:text-blue-600"><ChevronDown className="w-5 h-5" /></button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 text-xs">
                    <span className="font-bold text-gray-900">{post.profiles?.username}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{formatDistanceToNow(new Date(post.created_at), { locale: fr, addSuffix: true })}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                  <button 
                    onClick={() => { setReplyTo(post.id); window.scrollTo({ top: document.querySelector('form')?.offsetTop - 100, behavior: 'smooth' }); }}
                    className="mt-4 text-xs font-bold text-[#1a5c3a] hover:underline"
                  >
                    Répondre
                  </button>
                </div>
              </div>

              {/* Nested Replies (1 level) */}
              {thread.posts?.filter(p => p.parent_post_id === post.id).map(child => (
                <div key={child.id} className="ml-12 bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-4">
                  <CornerDownRight className="w-4 h-4 text-gray-300 mt-1 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 text-xs">
                      <span className="font-bold text-gray-900">{child.profiles?.username}</span>
                      <span className="text-gray-500">{formatDistanceToNow(new Date(child.created_at), { locale: fr, addSuffix: true })}</span>
                    </div>
                    <p className="text-sm text-gray-600">{child.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
