import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ThreadView from './pages/ThreadView';
import CategoryView from './pages/CategoryView';
import Login from './pages/Login';
import NewThread from './pages/NewThread';
import Profile from './pages/Profile';
import SearchResults from './pages/SearchResults';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-gray-900">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<CategoryView />} />
            <Route path="/thread/:id" element={<ThreadView />} />
            <Route path="/new-thread" element={<NewThread />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        
        <footer className="bg-white border-t py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm font-medium">HubFPK — La communauté étudiante de la Faculté Polydisciplinaire de Khouribga</p>
            <div className="flex justify-center gap-6 mt-4">
              <a href="https://www.fpk.ac.ma/" target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Site officiel FPK</a>
              <span className="text-gray-300">|</span>
              <p className="text-xs text-gray-400">&copy; 2026 Tous droits réservés</p>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
