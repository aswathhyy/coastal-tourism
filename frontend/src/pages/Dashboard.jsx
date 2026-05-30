import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Compass, ShieldAlert, Sparkles, User, LogOut, Star, MapPin, Heart, ShoppingBag, Waves, Home as HomeIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, token, API_BASE_URL, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [favoriteBeachesList, setFavoriteBeachesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Fetch user bookings
        const bRes = await fetch(`${API_BASE_URL}/beaches/my-bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // 2. Fetch all beaches to match favorites
        const beachRes = await fetch(`${API_BASE_URL}/beaches/beaches`);

        if (bRes.ok && beachRes.ok) {
          const bData = await bRes.json();
          const allBeaches = await beachRes.json();

          setBookings(bData);

          // Match favorite beach IDs with actual beach details
          if (user?.favoriteBeaches) {
            const matched = allBeaches.filter(b => user.favoriteBeaches.includes(b.id));
            setFavoriteBeachesList(matched);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, [token, user, API_BASE_URL, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 bg-ocean-dark min-h-screen text-slate-400">
        <div className="w-12 h-12 rounded-full border-t-2 border-teal-400 animate-spin"></div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-teal-400">Loading Traveler Ledger...</p>
      </div>
    );
  }

  // Separate hotel and activity bookings
  const lodgingBookings = bookings.filter(b => b.type === 'hotel');
  const activityBookings = bookings.filter(b => b.type === 'activity');

  return (
    <div className="font-sans relative bg-ocean-dark min-h-screen pb-32 text-slate-200">

      {/* Dashboard Top Hero */}
      <div className="bg-gradient-to-b from-ocean-medium/80 to-ocean-dark pt-16 pb-12 border-b border-teal-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 font-extrabold text-2xl shadow-inner animate-pulse-glow">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <span className="text-[10px] text-teal-400 uppercase tracking-widest font-bold block">Verified Traveler Dashboard</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Ayubowan, {user?.name}!</h1>
              <p className="text-xs text-slate-400 font-light mt-1.5">{user?.email} | {user?.phone || 'No phone registered'}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/" className="px-5 py-2.5 bg-slate-900 border border-slate-700 text-slate-350 hover:text-white rounded-xl text-xs font-semibold tracking-wider flex items-center gap-2 cursor-pointer">
              <HomeIcon className="w-4 h-4" />
              <span>Back Home</span>
            </Link>
            <button onClick={logout} className="px-5 py-2.5 bg-rose-500/15 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-semibold tracking-wider flex items-center gap-2 cursor-pointer transition-all">
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* STATS COUNT OVERLAY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Bookings', val: bookings.length },
            { label: 'Hotel Bookings', val: lodgingBookings.length },
            { label: 'Booked Watersports', val: activityBookings.length },
            { label: 'Bookmarked Beaches', val: favoriteBeachesList.length }
          ].map((stat, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-5 border border-teal-500/10 text-center">
              <div className="text-3xl font-extrabold text-teal-400">{stat.val}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

          {/* LEFT 2 COLUMNS: BOOKING LEDGER */}
          <div className="lg:col-span-2 space-y-12">

            {/* 1. HOTEL BOOKINGS */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-teal-500/10">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-5 h-5 text-teal-400 animate-bounce" />
                <h2 className="text-xl font-bold text-slate-100">Reserved Accommodations</h2>
              </div>

              {lodgingBookings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-light border border-dashed border-teal-500/20 rounded-2xl text-xs">
                  No active hotel bookings. Let's find your dream Ayurvedic sanctuary stay!
                  <div className="mt-4">
                    <Link to="/" className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-white rounded-lg border border-teal-500/25 text-[10px] font-bold uppercase tracking-wider transition-all">Browse Hotels</Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {lodgingBookings.map((b) => (
                    <div key={b.id} className="p-4 bg-slate-900/60 border border-teal-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] text-teal-400 font-bold uppercase tracking-widest block">Confirmed Stay</span>
                        <h3 className="text-base font-bold text-slate-100 mt-1">{b.itemName}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 mt-2 font-light">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-teal-500" /> {b.date}</span>
                          <span>Rooms: {b.quantity}</span>
                          {b.paymentStatus === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                              💳 Paid via {b.paymentMethod?.toUpperCase() || 'UPI'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-teal-500/5">
                        <span className="text-[10px] text-slate-400 block font-medium uppercase">
                          {b.paymentStatus === 'completed' ? 'Paid Amount' : 'Confirmed Charged'}
                        </span>
                        <strong className="text-sm font-extrabold text-teal-400">
                          {b.paymentStatus === 'completed' && b.paymentCurrency === 'INR' ? `₹${b.price} INR` : `₹${b.price} INR`}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. ACTIVITY BOOKINGS */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-teal-500/10">
              <div className="flex items-center gap-2 mb-6">
                <Waves className="w-5 h-5 text-teal-400 animate-bounce" />
                <h2 className="text-xl font-bold text-slate-100">Reserved Watersports & Guides</h2>
              </div>

              {activityBookings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-light border border-dashed border-teal-500/20 rounded-2xl text-xs">
                  No active activity bookings. Surf Varkala cliffs or kayak Cherai lagoons today!
                  <div className="mt-4">
                    <Link to="/" className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-white rounded-lg border border-teal-500/25 text-[10px] font-bold uppercase tracking-wider transition-all">Browse Activities</Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityBookings.map((b) => (
                    <div key={b.id} className="p-4 bg-slate-900/60 border border-teal-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] text-teal-400 font-bold uppercase tracking-widest block">Active Adventure</span>
                        <h3 className="text-base font-bold text-slate-100 mt-1">{b.itemName}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 mt-2 font-light">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-teal-500" /> {b.date}</span>
                          {b.time && <span>Time: {b.time}</span>}
                          <span>People: {b.quantity}</span>
                          {b.paymentStatus === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                              💳 Paid via {b.paymentMethod?.toUpperCase() || 'UPI'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-teal-500/5">
                        <span className="text-[10px] text-slate-400 block font-medium uppercase">
                          {b.paymentStatus === 'completed' ? 'Paid Amount' : 'Confirmed Charged'}
                        </span>
                        <strong className="text-sm font-extrabold text-teal-400">
                          {b.paymentStatus === 'completed' && b.paymentCurrency === 'INR' ? `₹${b.price} INR` : `₹${b.price} INR`}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT 1 COLUMN: FAVORITE BEACHES & SAVED DISTRICTS */}
          <div className="space-y-12">

            {/* BOOKMARKED BEACHES */}
            <div className="glass-card p-6 rounded-3xl border border-teal-500/10">
              <div className="flex items-center gap-2 mb-6">
                <Heart className="w-5 h-5 text-rose-400" />
                <h2 className="text-lg font-bold text-slate-100">Saved Beaches</h2>
              </div>

              {favoriteBeachesList.length === 0 ? (
                <p className="text-xs text-slate-400 font-light text-center py-6 border border-dashed border-teal-500/10 rounded-xl">
                  No saved beaches yet. Tap the heart icon on any beach cover to book later!
                </p>
              ) : (
                <div className="space-y-4">
                  {favoriteBeachesList.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => navigate(`/explore/${b.id}`)}
                      className="p-3 bg-slate-900/60 border border-teal-500/5 hover:border-teal-400/40 rounded-2xl flex gap-3 items-center cursor-pointer group transition-all"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={b.image} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white group-hover:text-teal-300 line-clamp-1">{b.name}</h3>
                        <span className="text-[9px] text-slate-400 font-light block line-clamp-1 mt-1">{b.location}</span>
                        <span className="text-[8px] text-teal-400 font-semibold block mt-1.5 uppercase tracking-wider">Explore Beach ➔</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
