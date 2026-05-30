import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Sparkles, Anchor, MapPin, Eye, Star, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { API_BASE_URL, user, toggleFavoriteBeach } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [districts, setDistricts] = useState([]);
  const [beaches, setBeaches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mood search filtering
  const [selectedMood, setSelectedMood] = useState('');
  const [moodTips, setMoodTips] = useState('');

  // Statistics Counter State
  const [counts, setCounts] = useState({ districts: 0, beaches: 0, activities: 0 });

  useEffect(() => {
    // Check if redirect has mood filter
    if (location.state && location.state.filterMood) {
      handleMoodSearch(location.state.filterMood);
    }
  }, [location.state]);

  // Count up statistics on load
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCounts({
        districts: Math.min(Math.floor((14 / steps) * step), 14),
        beaches: Math.min(Math.floor((100 / steps) * step), 100),
        activities: Math.min(Math.floor((500 / steps) * step), 500)
      });
      if (step >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Fetch initial districts and beaches
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dRes = await fetch(`${API_BASE_URL}/beaches/districts`);
        const bRes = await fetch(`${API_BASE_URL}/beaches/beaches`);
        if (dRes.ok && bRes.ok) {
          const dData = await dRes.json();
          const bData = await bRes.json();
          setDistricts(dData);
          setBeaches(bData);
        }
      } catch (err) {
        console.error("Failed to load home details", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [API_BASE_URL]);

  const handleMoodSearch = async (mood) => {
    setSelectedMood(mood);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/mood-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood })
      });
      if (res.ok) {
        const data = await res.json();
        setMoodTips(data.aiTips);
        setBeaches(data.matchedBeaches);
      }
    } catch (err) {
      console.error("Failed to process mood search", err);
    }
    setLoading(false);
  };

  const clearMoodSearch = async () => {
    setSelectedMood('');
    setMoodTips('');
    setLoading(true);
    try {
      const bRes = await fetch(`${API_BASE_URL}/beaches/beaches`);
      if (bRes.ok) {
        const bData = await bRes.json();
        setBeaches(bData);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const scrollToDistricts = () => {
    document.getElementById('districts-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Gallery items for the interactive coastal gallery
  const galleryItems = [
    { title: 'Alappuzha Backwater Sunset', img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80', desc: 'Serene houseboats gliding on lagoons' },
    { title: 'Varkala Beach Cliffs', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80', desc: 'Spectacular geological structures rising out of the sea' },
    { title: 'Chinese Fishing Nets', img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=600&q=80', desc: 'Ancient fishing structures silhouetted at Fort Kochi' },
    { title: 'Muzhappilangad Beach Ride', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80', desc: 'Cruising directly along the gentle waves of Kannur' },
    { title: 'Historic Bekal Bastions', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', desc: 'Colossal stone fort overlooking Kasaragod shores' },
    { title: 'Prinstine Kovalam Lighthouse', img: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=600&q=80', desc: 'Sweeping view of the Kovalam crescent beaches' }
  ];

  return (
    <div className="font-sans relative min-h-screen overflow-x-hidden bg-gradient-to-b from-ocean-dark via-ocean-medium to-ocean-light">

      {/* 1. HERO SECTION WITH CINEMATIC BACKGROUND VIDEO & COASTAL IMAGE */}
      <section className="relative h-[95vh] w-full overflow-hidden flex flex-col items-center justify-center text-center px-4" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        {/* Cinematic video loop fallback */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          style={{ opacity: 0.9 }}
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-beautiful-aerial-shot-of-a-sandy-beach-with-waves-43187-large.mp4"
            type="video/mp4"
          />
        </video>

        {/* Coastal gradient overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-ocean-dark/75 via-ocean-medium/50 to-ocean-dark/80 z-10"></div>

        {/* HERO CONTENT */}
        <div className="relative z-20 max-w-4xl px-4 animate-fade-in flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse-glow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Coastal Travel Concierge</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Explore Kerala's <br />
            <span className="text-gradient">Coastal Beauty</span>
          </h1>

          <p className="text-lg sm:text-2xl font-light text-slate-300 max-w-2xl mb-10 tracking-wide">
            5+ Coastal Districts | 100+ Beaches | Food | Stay | Activities
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
            <button
              onClick={scrollToDistricts}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 font-bold text-sm tracking-widest text-white shadow-xl shadow-teal-500/10 hover:shadow-teal-500/25 transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Districts</span>
              <ArrowRight className="w-4 h-4" />
            </button>


          </div>
        </div>

        {/* STATS SECTION (Cinematic overlapping grid) */}
        <div className="absolute bottom-6 left-0 w-full z-20 px-4 md:px-8">
          <div className="max-w-5xl mx-auto glass-card rounded-2xl p-4 sm:p-6 grid grid-cols-3 divide-x divide-teal-500/20 text-center backdrop-blur-md">
            <div>
              <div className="text-xl sm:text-4xl font-extrabold text-teal-400">{counts.districts}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Districts</div>
            </div>
            <div>
              <div className="text-xl sm:text-4xl font-extrabold text-teal-400">{counts.beaches}+</div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Beaches</div>
            </div>
            <div>
              <div className="text-xl sm:text-4xl font-extrabold text-teal-400">{counts.activities}+</div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Coastal Activities</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DISTRICT SECTION (Horizontal Scrolling Row) */}
      <section id="districts-section" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-950">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Discover the Shoreline</h4>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Coastal Districts of Kerala</h2>
          </div>
          <p className="text-slate-400 text-sm max-w-md mt-4 md:mt-0 font-light">
            Scroll horizontally to explore districts. Click a card to unlock full AI description and alternating beach zigzags.
          </p>
        </div>

        {/* Horizontal Card Row */}
        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth snap-x">
          {districts.map((d) => (
            <div
              key={d.id}
              onClick={() => navigate(`/district/${d.id}`)}
              className="flex-shrink-0 w-80 h-[450px] rounded-2xl relative overflow-hidden glass-card snap-start cursor-pointer group hover:scale-[1.02] active:scale-[0.99] transition-all duration-500"
            >
              {/* Card Image */}
              <img
                src={d.image}
                alt={d.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Overlay with radial glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-dark via-ocean-dark/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

              {/* district glow effect */}
              <div className="absolute inset-0 border border-teal-500/0 group-hover:border-teal-400/50 group-hover:shadow-[inset_0_0_20px_rgba(20,184,166,0.3)] rounded-2xl transition-all duration-500"></div>

              {/* Text content */}
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-widest bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-500/20">
                  🌴 {d.placeCount} places
                </span>
                <h3 className="text-2xl font-bold text-white mt-3 group-hover:text-teal-300 transition-colors">
                  {d.name}
                </h3>
                <p className="text-xs text-slate-300 font-light mt-2 line-clamp-2">
                  {d.tagline}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  <span>Explore District</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. EXPLORE SECTION (Beaches List & Mood Filters) */}
      <section id="explore-section" className="py-24 bg-gradient-to-b from-ocean-dark to-slate-950 px-4 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">
            <h4 className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Beaches & Coastal Retreats</h4>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-1">Explore Golden Sands</h2>
            <p className="text-slate-400 max-w-xl mx-auto mt-4 font-light text-sm">
              Use our AI Travel mood filter to quickly find romantic, peaceful, adventure, or budget beach suggestions curated with custom AI tips.
            </p>

            {/* Quick Mood Filter row */}
            <div className="flex justify-center gap-3 flex-wrap mt-8">
              {['romantic', 'peaceful', 'adventure', 'budget'].map((mood) => (
                <button
                  key={mood}
                  onClick={() => handleMoodSearch(mood)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer capitalize ${selectedMood === mood
                    ? 'bg-teal-500 border-teal-400 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                    : 'bg-slate-900 border-teal-500/20 hover:border-teal-400/50 text-slate-300 hover:text-white'
                    }`}
                >
                  ✨ {mood}
                </button>
              ))}

              {selectedMood && (
                <button
                  onClick={clearMoodSearch}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-all cursor-pointer"
                >
                  Clear Filter ✕
                </button>
              )}
            </div>
          </div>

          {/* AI generated Mood tips banner */}
          {selectedMood && moodTips && (
            <div className="glass-card max-w-4xl mx-auto p-6 rounded-2xl mb-12 border border-teal-400/40 relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl"></div>
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-400 mt-1">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-teal-300 capitalize">Coastal AI Mood Suggestion ({selectedMood})</h4>
                  <p className="text-sm text-slate-200 font-light leading-relaxed mt-2" style={{ whiteSpace: 'pre-line' }}>
                    {moodTips}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Grid Layout of Beaches */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 rounded-full border-t-2 border-teal-400 animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {beaches.map((b) => (
                <div
                  key={b.id}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col border border-teal-500/10 group"
                >
                  {/* Image container */}
                  <div className="h-56 relative overflow-hidden">
                    <img
                      src={b.image}
                      alt={b.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 z-20">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteBeach(b.id) }}
                        className={`p-2.5 rounded-full border backdrop-blur-md transition-all cursor-pointer ${user?.favoriteBeaches?.includes(b.id)
                          ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:text-rose-400 hover:bg-slate-800'
                          }`}
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                      <span className="text-[9px] font-semibold bg-teal-950/80 border border-teal-500/40 text-teal-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        ⭐ {b.rating} Rating
                      </span>
                      <span className="text-[9px] font-semibold bg-slate-950/80 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        💰 {b.priceRange}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
                        <MapPin className="w-3.5 h-3.5 text-teal-400" />
                        <span>{b.location}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                        {b.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-light mt-3 leading-relaxed">
                        {b.shortDescription}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-teal-500/10 flex items-center justify-between">
                      <div className="flex gap-1.5 overflow-hidden">
                        {b.activities.slice(0, 3).map((act, i) => (
                          <span
                            key={i}
                            className="text-[9px] font-medium text-slate-300 bg-teal-900/20 border border-teal-500/10 px-2.5 py-1 rounded-md capitalize"
                          >
                            {act}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => navigate(`/explore/${b.id}`)}
                        className="px-4 py-2 text-xs font-bold bg-teal-500/10 hover:bg-teal-500 hover:text-white border border-teal-500/20 hover:border-teal-500 text-teal-400 rounded-lg tracking-wider transition-all cursor-pointer active:scale-95"
                      >
                        Explore More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. ACTIVITIES SECTION (Visual grid showcase) */}
      <section id="activities-section" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center mb-16">
          <h4 className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Marine Adventures</h4>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-1">Coastal Ocean Activities</h2>
          <p className="text-slate-400 max-w-md mx-auto mt-4 font-light text-sm">
            Experience high-octane paragliding, professional surfing, backwater kayaking, and traditional deep-sea fishing.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Cliff Paragliding', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZcIRRwwgqWlScXaTfExAPhVOMWky-ZyTCLQ&s', tag: 'Varkala' },
            { name: 'Surfing Training', img: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=80', tag: 'Kovalam' },
            { name: 'Lagoon Kayaking', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80', tag: 'Cherai' },
            { name: 'Ocean Jet Skiing', img: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=400&q=80', tag: 'Muzhappilangad' }
          ].map((act, idx) => (
            <div
              key={idx}
              className="h-72 rounded-2xl relative overflow-hidden group glass-card border border-teal-500/10 cursor-pointer shadow-lg"
            >
              <img
                src={act.img}
                alt={act.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-dark via-ocean-dark/20 to-transparent"></div>
              <div className="absolute bottom-5 left-5 z-20">
                <span className="text-[9px] font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/20 uppercase tracking-widest">
                  {act.tag}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white mt-2 group-hover:text-teal-300 transition-colors">
                  {act.name}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE COASTAL GALLERY */}
      <section id="gallery-section" className="py-24 bg-gradient-to-t from-ocean-dark to-slate-950 px-4 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h4 className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Visual Journey</h4>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-1">Interactive Coastal Gallery</h2>
            <p className="text-slate-400 max-w-xl mx-auto mt-4 font-light text-sm">
              Take a virtual walkthrough of breathtaking Kerala beaches, sunsets, houseboats, and colossal marine forts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((g, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl overflow-hidden relative group cursor-pointer shadow-md h-80"
              >
                <img
                  src={g.img}
                  alt={g.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Hover slide up detail */}
                <div className="absolute inset-0 bg-gradient-to-t from-ocean-dark via-ocean-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                  <h4 className="text-lg font-bold text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {g.title}
                  </h4>
                  <p className="text-xs text-slate-300 font-light mt-1.5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    {g.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
