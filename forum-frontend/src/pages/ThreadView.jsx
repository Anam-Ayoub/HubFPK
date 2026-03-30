import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ChevronUp, ChevronDown, MessageSquare, Share2, 
  CornerDownRight, MoreHorizontal, Flag, 
  CheckCircle2, Clock, User
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import Skeleton from '../components/Skeleton';

const API_URL = import.meta.env.VITE_API_URL;

export default function ThreadView() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

    // Real-time subscription for new posts
    const channel = supabase
      .channel(`thread:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts', filter: `thread_id=eq.${id}` },
        () => {
          fetchThread(); // Simplest way to keep everything in sync (votes, profiles, etc.)
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, fetchThread]);

  const handleVote = async (targetId, targetType, value) => {
    if (!user) return alert('Veuillez vous connecter pour voter');
    try {
      const { error } = await supabase
        .from('votes')
        .upsert([{
          user_id: user.id,
          target_id: targetId,
          target_type: targetType,
          value: value
        }], { onConflict: 'user_id, target_id' });

      if (error) throw error;
      
      // Update karma of the target user (Simplified)
      // In a real app, this would be a database trigger
      const targetUser = targetType === 'thread' ? thread.user_id : thread.posts.find(p => p.id === targetId).user_id;
      if (targetUser !== user.id) {
        await supabase.rpc('increment_karma', { user_id: targetUser, amount: value });
      }

      fetchThread();
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!user) return alert('Connectez-vous pour répondre');
    if (!replyContent.trim()) return;

    setSubmitting(true);
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
      // fetchThread() is called by the real-time channel
    } catch (err) {
      console.error('Error replying:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getScore = (votes) => {
    if (!votes) return 0;
    return votes.reduce((acc, v) => acc + v.value, 0);
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Skeleton className="h-64 rounded-3xl" />
      <Skeleton className="h-32 rounded-3xl" />
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-2xl w-full" />
        <Skeleton className="h-24 rounded-2xl w-full" />
      </div>
    </div>
  );
  
  if (!thread) return (
    <div className="text-center py-24 space-y-4">
      <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-400">
        <Flag className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-black text-gray-900">Discussion introuvable</h2>
      <p className="text-gray-500">Elle a peut-être été supprimée ou déplacée.</p>
      <Link to="/" className="inline-block bg-[#1a5c3a] text-white px-6 py-2 rounded-xl font-bold">Retour à l'accueil</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* Thread Header & Content */}
      <article className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          
          {/* Side Voting (Desktop) */}
          <div className="hidden sm:flex w-16 bg-gray-50/50 flex-col items-center py-8 gap-2 border-r border-gray-100">
            <button 
              onClick={() => handleVote(thread.id, 'thread', 1)}
              className="p-2 hover:bg-amber-100 rounded-xl text-gray-400 hover:text-amber-600 transition-all active:scale-90"
            >
              <ChevronUp className="w-8 h-8" />
            </button>
            <span className="font-black text-lg text-gray-900">{getScore(thread.votes)}</span>
            <button 
              onClick={() => handleVote(thread.id, 'thread', -1)}
              className="p-2 hover:bg-blue-100 rounded-xl text-gray-400 hover:text-blue-600 transition-all active:scale-90"
            >
              <ChevronDown className="w-8 h-8" />
            </button>
          </div>

          <div className="flex-1 p-8 sm:p-10">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-8 text-[11px] font-black uppercase tracking-widest">
              <span className="bg-amber-400 text-[#1a5c3a] px-3 py-1 rounded-full shadow-sm">
                {thread.tag}
              </span>
              <span className="text-[#1a5c3a] bg-[#1a5c3a]/5 px-3 py-1 rounded-full">
                {thread.categories?.name}
              </span>
              <div className="flex items-center gap-2 text-gray-400 ml-auto">
                <Clock className="w-3.5 h-3.5" />
                Il y a {formatDistanceToNow(new Date(thread.created_at), { locale: fr })}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8 leading-[1.15] tracking-tight">
              {thread.title}
            </h1>

            <div className="prose prose-slate max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-lg prose-headings:font-black prose-a:text-[#1a5c3a] mb-10">
              <ReactMarkdown>{thread.body}</ReactMarkdown>
            </div>

            {/* Author & Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1a5c3a] flex items-center justify-center text-white font-black shadow-lg shadow-[#1a5c3a]/20 overflow-hidden">
                  {thread.profiles?.avatar_url ? (
                    <img src={thread.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Posté par</p>
                  <p className="text-gray-900 font-bold hover:text-[#1a5c3a] transition-colors cursor-pointer">
                    @{thread.profiles?.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // toast here later
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  <Share2 className="w-4 h-4" /> Partager
                </button>
                <button className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-50">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Replies Header */}
      <div className="flex items-center justify-between px-4">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <MessageSquare className="text-amber-500 w-7 h-7" />
          Réponses <span className="text-gray-300 font-medium">({thread.posts?.length || 0})</span>
        </h2>
      </div>

      {/* Reply Form */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#1a5c3a] to-amber-400 rounded-[2rem] blur opacity-10 group-focus-within:opacity-20 transition duration-500"></div>
        <form onSubmit={submitReply} className="relative bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/30 space-y-6">
          {!user ? (
            <div className="text-center py-6 space-y-4">
              <p className="text-gray-500 font-bold">Connectez-vous pour rejoindre la discussion</p>
              <Link to="/login" className="inline-block bg-[#1a5c3a] text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-[#1a5c3a]/20">Se connecter</Link>
            </div>
          ) : (
            <>
              {replyTo && (
                <div className="flex items-center justify-between bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100 text-sm">
                  <div className="flex items-center gap-2 text-amber-800 font-bold">
                    <CornerDownRight className="w-4 h-4" />
                    Réponse en cours à un commentaire...
                  </div>
                  <button type="button" onClick={() => setReplyTo(null)} className="text-amber-600 font-black hover:underline">Annuler</button>
                </div>
              )}
              <textarea
                className="w-full p-6 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#1a5c3a]/5 focus:outline-none transition-all resize-none h-40 text-lg placeholder:text-gray-300"
                placeholder="Votre message ici..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="flex justify-end">
                <button 
                  disabled={submitting || !replyContent.trim()}
                  className="bg-[#1a5c3a] disabled:bg-gray-200 text-white px-8 py-4 rounded-2xl font-black hover:bg-[#14472d] transition-all shadow-xl shadow-[#1a5c3a]/20 active:scale-95"
                >
                  {submitting ? 'Envoi...' : 'Publier ma réponse'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {/* Posts List */}
      <div className="space-y-8 pl-2 sm:pl-0">
        {thread.posts?.filter(p => !p.parent_post_id).map(post => (
          <div key={post.id} className="space-y-6">
            
            {/* Main Post Card */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex gap-6 hover:shadow-md transition-shadow group">
              {/* Vote vertical */}
              <div className="flex flex-col items-center gap-1 mt-1">
                <button onClick={() => handleVote(post.id, 'post', 1)} className="text-gray-300 hover:text-amber-600 transition-colors"><ChevronUp className="w-6 h-6" /></button>
                <span className="text-sm font-black text-gray-900">{getScore(post.votes)}</span>
                <button onClick={() => handleVote(post.id, 'post', -1)} className="text-gray-300 hover:text-blue-600 transition-colors"><ChevronDown className="w-6 h-6" /></button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center font-black text-[10px] text-[#1a5c3a]">
                    {post.profiles?.username?.substring(0,1).toUpperCase()}
                  </div>
                  <span className="font-black text-gray-900">@{post.profiles?.username}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-400 font-bold">{formatDistanceToNow(new Date(post.created_at), { locale: fr, addSuffix: true })}</span>
                  {post.user_id === thread.user_id && (
                    <span className="bg-[#1a5c3a]/10 text-[#1a5c3a] px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">Auteur</span>
                  )}
                </div>
                
                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
                
                <div className="mt-6 flex items-center gap-4">
                  <button 
                    onClick={() => { setReplyTo(post.id); window.scrollTo({ top: document.querySelector('form')?.offsetTop - 150, behavior: 'smooth' }); }}
                    className="text-xs font-black text-[#1a5c3a] bg-[#1a5c3a]/5 hover:bg-[#1a5c3a] hover:text-white px-4 py-2 rounded-xl transition-all"
                  >
                    Répondre
                  </button>
                  <button className="p-2 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Nested Replies (1 level) */}
            <div className="space-y-4 ml-8 sm:ml-16">
              {thread.posts?.filter(p => p.parent_post_id === post.id).map(child => (
                <div key={child.id} className="relative bg-gray-50/50 p-6 rounded-[1.5rem] border border-gray-100 flex gap-4 animate-in slide-in-from-left-4 duration-500">
                  <div className="absolute top-0 left-0 h-full w-1 bg-gray-200 rounded-full -ml-4"></div>
                  <CornerDownRight className="w-5 h-5 text-gray-300 mt-1 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 text-xs">
                      <span className="font-black text-gray-900">@{child.profiles?.username}</span>
                      <span className="text-gray-400 font-bold">{formatDistanceToNow(new Date(child.created_at), { locale: fr, addSuffix: true })}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{child.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
