import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Compass, LogOut, User, Menu, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase().trim();
    setIsSearchOpen(false);
    setSearchQuery('');
    setMobileMenuOpen(false);

    // Dynamic routing search matches
    if (query.includes('varkala')) {
      navigate('/explore/varkala');
    } else if (query.includes('kovalam')) {
      navigate('/explore/kovalam');
    } else if (query.includes('marari')) {
      navigate('/explore/marari');
    } else if (query.includes('cherai')) {
      navigate('/explore/cherai');
    } else if (query.includes('fort') || query.includes('kochi')) {
      navigate('/explore/fort-kochi');
    } else if (query.includes('muzhappilangad')) {
      navigate('/explore/muzhappilangad');
    } else if (query.includes('bekal')) {
      navigate('/explore/bekal');
    } else if (query.includes('alappuzha') || query.includes('alleppey')) {
      navigate('/district/alappuzha');
    } else if (query.includes('trivandrum') || query.includes('thiruvananthapuram')) {
      navigate('/district/trivandrum');
    } else if (query.includes('ernakulam')) {
      navigate('/district/ernakulam');
    } else if (query.includes('kozhikode')) {
      navigate('/district/kozhikode');
    } else if (query.includes('kannur')) {
      navigate('/district/kannur');
    } else if (query.includes('kasaragod')) {
      navigate('/district/kasaragod');
    } else {
      // Direct beach search fallback
      navigate('/explore/varkala');
    }
  };

  const handleMoodSelect = (mood) => {
    setIsSearchOpen(false);
    setMobileMenuOpen(false);
    navigate('/', { state: { filterMood: mood } });

    // Scroll to District/Beaches section
    setTimeout(() => {
      const el = document.getElementById('districts-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <Compass className="w-8 h-8 text-teal-400 group-hover:rotate-45 transition-transform duration-500" />
          <span className="font-extrabold text-lg sm:text-xl tracking-wider bg-gradient-to-r from-white via-slate-100 to-teal-400 bg-clip-text text-transparent">
            Coastal Tourism Kerala
          </span>
        </Link>

        {/* NAVIGATION MENUS (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({
                top: 0,
                behavior: "smooth"
              });
            }}
          >
            Home
          </a>
          <a href="#districts-section" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('districts-section')?.scrollIntoView({ behavior: 'smooth' }), 50) }} className="text-slate-300 hover:text-white hover:shadow-[0_2px_0_#14b8a6] pb-1 transition-all">Districts</a>
          <a href="#explore-section" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' }), 50) }} className="text-slate-300 hover:text-white hover:shadow-[0_2px_0_#14b8a6] pb-1 transition-all">Explore</a>
          <a href="#activities-section" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('activities-section')?.scrollIntoView({ behavior: 'smooth' }), 50) }} className="text-slate-300 hover:text-white hover:shadow-[0_2px_0_#14b8a6] pb-1 transition-all">Activities</a>
          <a href="#gallery-section" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' }), 50) }} className="text-slate-300 hover:text-white hover:shadow-[0_2px_0_#14b8a6] pb-1 transition-all">Gallery</a>
        </nav>

        {/* CONTROLS & AUTH (Desktop) */}
        <div className="hidden md:flex items-center gap-5">
          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 text-slate-300 hover:text-teal-400 hover:bg-slate-800/40 rounded-full transition-all cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 text-xs font-semibold tracking-wide transition-all"
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 font-semibold text-xs tracking-wider text-white shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 transition-all scale-100 hover:scale-105 active:scale-95"
            >
              Login
            </Link>
          )}
        </div>

        {/* MOBILE MENU TRIGGER */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 text-slate-300 hover:text-teal-400 hover:bg-slate-800/40 rounded-full transition-all cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/40 transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* SEARCH OVERLAY PORTAL */}
      {isSearchOpen && (
        <div className="absolute top-20 left-0 w-full bg-ocean-dark/95 border-b border-teal-500/20 backdrop-blur-xl animate-fade-in py-8 px-4 z-50">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="relative flex items-center mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coastal districts or beaches (e.g. Varkala, Cherai, Alappuzha)..."
                className="w-full bg-slate-900 border border-teal-500/30 rounded-2xl px-6 py-4 pr-16 text-slate-100 focus:outline-none focus:border-teal-400 placeholder-slate-500 shadow-inner"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-4 p-2 bg-teal-500 hover:bg-teal-400 text-white rounded-xl shadow transition-all cursor-pointer active:scale-95"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* MOOD SEARCH PANEL */}
            <div>
              <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
                Or Search by AI Travel Mood:
              </h4>
              <div className="flex flex-wrap gap-3">
                {['romantic', 'peaceful', 'adventure', 'budget'].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => handleMoodSelect(mood)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/15 hover:border-teal-400/50 text-teal-400 cursor-pointer capitalize transition-all"
                  >
                    ✨ {mood} Trips
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE RESPONSIVE NAVIGATION */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-t border-teal-500/10 px-4 pt-4 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-teal-900/20 text-sm font-medium"
          >
            Home
          </Link>
          <a
            href="#districts-section"
            onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigate('/'); setTimeout(() => document.getElementById('districts-section')?.scrollIntoView({ behavior: 'smooth' }), 50) }}
            className="block px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-teal-900/20 text-sm font-medium"
          >
            Districts
          </a>
          <a
            href="#explore-section"
            onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigate('/'); setTimeout(() => document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' }), 50) }}
            className="block px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-teal-900/20 text-sm font-medium"
          >
            Explore
          </a>
          <a
            href="#activities-section"
            onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigate('/'); setTimeout(() => document.getElementById('activities-section')?.scrollIntoView({ behavior: 'smooth' }), 50) }}
            className="block px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-teal-900/20 text-sm font-medium"
          >
            Activities
          </a>
          <a
            href="#gallery-section"
            onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigate('/'); setTimeout(() => document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' }), 50) }}
            className="block px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-teal-900/20 text-sm font-medium"
          >
            Gallery
          </a>

          {user ? (
            <div className="pt-4 border-t border-teal-500/10 space-y-3">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-teal-500/10 text-teal-400 text-sm font-semibold"
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/5 text-rose-400 text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-teal-500/10">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 font-semibold text-xs tracking-wider text-white"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
