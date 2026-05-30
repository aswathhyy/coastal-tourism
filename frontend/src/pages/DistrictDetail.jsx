import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Compass, Sparkles, MapPin, Award, ArrowLeft, Sun, Waves, ShieldAlert, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DistrictDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_BASE_URL, user, toggleFavoriteDistrict } = useAuth();

  const [district, setDistrict] = useState(null);
  const [beaches, setBeaches] = useState([]);
  const [aiDesc, setAiDesc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistrictDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/beaches/districts/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDistrict(data.district);
          setBeaches(data.beaches);

          // Fetch or generate AI description
          const aiRes = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `Generate a gorgeous, luxury clifftop traveler introduction for the Kerala coastal district of ${data.district.name}. Make it highly descriptive and concise (about 3 sentences).` })
          });
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            setAiDesc(aiData.reply);
          } else {
            setAiDesc(data.district.description);
          }
        }
      } catch (err) {
        console.error("Failed to load district detail", err);
      }
      setLoading(false);
    };

    fetchDistrictDetails();
  }, [id, API_BASE_URL]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 bg-ocean-dark min-h-screen text-slate-400">
        <div className="w-12 h-12 rounded-full border-t-2 border-teal-400 animate-spin"></div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-teal-400">Navigating Shoreline...</p>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="flex flex-col justify-center items-center py-40 bg-ocean-dark min-h-screen text-slate-400 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h3 className="text-2xl font-bold text-white">District Not Found</h3>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-2.5 rounded-full bg-teal-500 text-white font-bold text-xs tracking-wider cursor-pointer">
          Return Home
        </button>
      </div>
    );
  }

  const activityIcons = {
    surfing: { label: '🏄‍♂️ Surfing', activeColor: 'text-teal-400 bg-teal-950/40 border-teal-500/20' },
    boating: { label: '⛵ Boating', activeColor: 'text-sky-400 bg-sky-950/40 border-sky-500/20' },
    kayaking: { label: '🛶 Kayaking', activeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20' },
    seafood: { label: '🐟 Seafood', activeColor: 'text-amber-400 bg-amber-950/40 border-amber-500/20' },
    sunset: { label: '🌅 Sunset', activeColor: 'text-orange-400 bg-orange-950/40 border-orange-500/20' }
  };

  return (
    <div className="font-sans relative bg-ocean-dark min-h-screen pb-24 text-slate-200">

      {/* 1. LARGE BANNER HEADER */}
      <div className="h-[60vh] w-full relative overflow-hidden flex items-end">
        <img
          src={district.image}
          alt={district.name}
          className="w-full h-full object-cover absolute top-0 left-0 z-0 animate-fade-in"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-dark via-ocean-dark/45 to-transparent z-10"></div>

        {/* Floating Auth controls */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Coastline</span>
          </button>
        </div>

        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => toggleFavoriteDistrict(district.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer font-bold text-xs ${user?.favoriteDistricts?.includes(district.id)
                ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:text-rose-400'
              }`}
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>{user?.favoriteDistricts?.includes(district.id) ? 'Favorited' : 'Bookmark District'}</span>
          </button>
        </div>

        {/* Banner details */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-20 pb-12 flex flex-col justify-end">
          <span className="text-xs font-bold text-teal-400 tracking-widest uppercase">Kerala Coastal District</span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mt-2 tracking-tight">
            {district.name}
          </h1>
          <p className="text-sm sm:text-base text-teal-200 mt-2 font-medium">
            🌴 {district.tagline}
          </p>
        </div>
      </div>

      {/* 2. AI GENERATED DESCRIPTION PANEL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="glass-card p-8 rounded-3xl border border-teal-400/30 relative overflow-hidden">
          {/* Neon backdrop orb */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>

          <div className="flex gap-4 items-start">
            <div className="p-3 bg-teal-500/20 border border-teal-400/40 text-teal-400 rounded-2xl animate-pulse-glow mt-1">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-widest text-teal-400 uppercase">AI-Generated District Overview</h3>
              <p className="text-base sm:text-lg text-slate-200 font-light mt-3 leading-relaxed tracking-wide italic">
                "{aiDesc}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ZIG-ZAG BEACHES DISPLAY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        <div className="text-center mb-20">
          <h4 className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Coastline Inventory</h4>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Beaches of {district.name}</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-teal-400 to-transparent mx-auto mt-4 rounded-full"></div>
        </div>

        {beaches.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 rounded-2xl">
            <p>No coastal beaches currently cataloged in this district.</p>
          </div>
        ) : (
          <div className="space-y-36">
            {beaches.map((b, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={b.id}
                  className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}
                >

                  {/* Left Column: Custom angled image */}
                  <div className="w-full lg:w-1/2">
                    <div className="relative overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(3,21,37,0.5)] group aspect-[4/3] border border-teal-500/10">
                      <img
                        src={b.image}
                        alt={b.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ocean-dark/40 to-transparent opacity-80 group-hover:opacity-90"></div>

                      {/* Floating Rating Badge */}
                      <span className="absolute bottom-5 left-5 z-20 text-[10px] font-bold bg-teal-950/80 border border-teal-400/30 text-teal-300 px-3 py-1 rounded-full uppercase tracking-wider shadow">
                        ⭐ {b.rating} Rating
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Beach Details */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                      <MapPin className="w-4 h-4 text-teal-400" />
                      <span>{b.location}</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white hover:text-teal-300 transition-colors tracking-tight">
                      {b.name}
                    </h3>

                    <p className="text-sm sm:text-base text-slate-350 font-light mt-5 leading-relaxed tracking-wide">
                      {b.shortDescription}
                    </p>

                    {/* Dynamic Activity Icons */}
                    <div className="mt-8">
                      <h5 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
                        Featured Activities:
                      </h5>
                      <div className="flex flex-wrap gap-2.5">
                        {Object.keys(activityIcons).map((actKey) => {
                          const iconObj = activityIcons[actKey];
                          const isActive = b.activities.includes(actKey);

                          return (
                            <span
                              key={actKey}
                              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all select-none ${isActive
                                  ? iconObj.activeColor
                                  : 'text-slate-500 bg-slate-900/10 border-slate-800 opacity-40'
                                }`}
                            >
                              {iconObj.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explore More button */}
                    <div className="mt-10">
                      <button
                        onClick={() => navigate(`/explore/${b.id}`)}
                        className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 font-bold text-xs uppercase tracking-wider text-white rounded-xl shadow-lg shadow-teal-500/10 hover:shadow-teal-500/25 transition-all scale-100 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                      >
                        Explore More & Book
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
