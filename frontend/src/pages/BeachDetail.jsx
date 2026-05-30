import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Star, ShieldCheck, DollarSign, Calendar, Clock, Users, ArrowLeft, Heart, ShieldAlert, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WeatherWidget from '../components/WeatherWidget';
import confetti from 'canvas-confetti';
import BookingWithUPI from '../components/BookingWithUPI';

export default function BeachDetail() {
  const { beachId } = useParams();
  const navigate = useNavigate();
  const { API_BASE_URL, user, token, toggleFavoriteBeach } = useAuth();

  const [loading, setLoading] = useState(true);
  const [beach, setBeach] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [activities, setActivities] = useState([]);
  const [guides, setGuides] = useState([]);
  const [nearby, setNearby] = useState([]);

  const [aiDesc, setAiDesc] = useState('');

  // Sort/Filter configurations
  const [hotelSort, setHotelSort] = useState('popular'); // 'popular', 'price-low', 'price-high', 'rating'
  const [activitySort, setActivitySort] = useState('popular'); // 'popular', 'price-low', 'price-high'

  // Booking Modal States
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingType, setBookingType] = useState('hotel'); // 'hotel', 'activity'
  const [bookingItem, setBookingItem] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Booking Form Fields
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingPeople, setBookingPeople] = useState(1);
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');

  useEffect(() => {
    // Populate user contacts if user changes
    if (user) {
      setContactName(user.name);
      setContactEmail(user.email);
      setContactPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchBeachDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/beaches/beaches/${beachId}`);
        if (res.ok) {
          const data = await res.json();
          setBeach(data.beach);
          setHotels(data.hotels);
          setRestaurants(data.restaurants);
          setActivities(data.activities);
          setGuides(data.guides);
          setNearby(data.nearby);

          // Get detailed AI beach description from Gemini endpoint
          const aiRes = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `Provide a detailed, highly cinematic, luxury clifftop tourist description for ${data.beach.name} in Kerala. Emphasize why it is special and detail its visual vibe. Write a gorgeous paragraph of about 80 words.` })
          });
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            setAiDesc(aiData.reply);
          } else {
            setAiDesc(data.beach.detailedDescription);
          }
        }
      } catch (err) {
        console.error("Failed to fetch beach details:", err);
      }
      setLoading(false);
    };

    fetchBeachDetails();
  }, [beachId, API_BASE_URL]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 bg-ocean-dark min-h-screen text-slate-400">
        <div className="w-12 h-12 rounded-full border-t-2 border-teal-400 animate-spin"></div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-teal-400">Loading Coastal Expanse...</p>
      </div>
    );
  }

  if (!beach) {
    return (
      <div className="flex flex-col justify-center items-center py-40 bg-ocean-dark min-h-screen text-slate-400 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h3 className="text-2xl font-bold text-white">Beach Profile Not Found</h3>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-2.5 rounded-full bg-teal-500 text-white font-bold text-xs tracking-wider cursor-pointer">
          Return Home
        </button>
      </div>
    );
  }

  // Auth guard before booking trigger
  const handleOpenBooking = (type, item) => {
    if (!token) {
      // Redirect to login page
      navigate('/login', { state: { redirectTo: `/explore/${beachId}` } });
      return;
    }
    setBookingType(type);
    setBookingItem(item);
    setBookingConfirmed(false);
    setShowPayment(false);
    setIsBookingOpen(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingPeople || !contactName || !contactPhone || !contactEmail) {
      alert("Please fill in all details");
      return;
    }
    setShowPayment(true);
  };

  const handleBookingSuccess = (confirmedBooking) => {
    setBookingConfirmed(true);
    setShowPayment(false);
    // Confetti!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  // Sorters
  const sortedHotels = [...hotels].sort((a, b) => {
    if (hotelSort === 'price-low') return a.price - b.price;
    if (hotelSort === 'price-high') return b.price - a.price;
    if (hotelSort === 'rating') return b.rating - a.rating;
    return 0; // Default popular
  });

  const sortedActivities = [...activities].sort((a, b) => {
    if (activitySort === 'price-low') return a.price - b.price;
    if (activitySort === 'price-high') return b.price - a.price;
    return 0;
  });

  return (
    <div className="font-sans relative bg-ocean-dark min-h-screen pb-32 text-slate-200">

      {/* 1. LARGE BEACH IMAGE HEADER */}
      <div className="h-[60vh] w-full relative overflow-hidden flex items-end">
        <img
          src={beach.image}
          alt={beach.name}
          className="w-full h-full object-cover absolute top-0 left-0 z-0 animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-dark via-ocean-dark/45 to-transparent z-10"></div>

        {/* Back and Bookmark Actions */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => toggleFavoriteBeach(beach.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer font-bold text-xs ${user?.favoriteBeaches?.includes(beach.id)
              ? 'bg-rose-500 border-rose-500 text-white shadow-md'
              : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:text-rose-400'
              }`}
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>{user?.favoriteBeaches?.includes(beach.id) ? 'Saved' : 'Save Beach'}</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-20 pb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold mb-2 capitalize">
              <MapPin className="w-4 h-4" />
              <span>{beach.location}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {beach.name}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. DESCRIPTION & WEATHER GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Detailed AI description */}
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-teal-500/10 relative overflow-hidden h-full flex flex-col justify-center">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="flex gap-4 items-start mb-4">
            <div className="p-2.5 bg-teal-500/20 border border-teal-400/40 text-teal-400 rounded-2xl animate-pulse-glow mt-1 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-semibold tracking-widest text-teal-400 uppercase mt-1">AI-Curated Shoreline Experience</h3>
          </div>
          <p className="text-base sm:text-lg text-slate-200 font-light leading-relaxed italic">
            "{aiDesc}"
          </p>
        </div>

        {/* Dynamic weather widget */}
        <div className="h-full">
          <WeatherWidget beachName={beach.name} />
        </div>
      </div>

      {/* 3. ACCOMMODATION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 border-t border-slate-900 pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Premium Seaside Lodging</h4>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Resorts & Ayurvedic Sanctuary</h2>
          </div>

          {/* Sorting Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sort stays:</span>
            {[['popular', 'Popular'], ['price-low', 'Price: Low'], ['price-high', 'Price: High'], ['rating', 'Rating ⭐']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setHotelSort(key)}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${hotelSort === key
                  ? 'bg-teal-500 border-teal-500 text-white'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {sortedHotels.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 rounded-2xl">Stays are fully occupied. Check nearby beaches!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sortedHotels.map((h) => (
              <div key={h.id} className="glass-card rounded-2xl overflow-hidden flex flex-col border border-teal-500/10 group">
                <div className="h-48 relative overflow-hidden">
                  <img src={h.image} alt={h.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-4 right-4 bg-teal-950/80 border border-teal-500/30 text-teal-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    ⭐ {h.rating} Rating
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-teal-400 font-medium tracking-wide uppercase block mb-1">{h.location}</span>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-teal-300 transition-colors line-clamp-1">{h.name}</h3>

                    {/* Facilities List */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {h.facilities.map((fac, idx) => (
                        <span key={idx} className="text-[9px] bg-teal-950/40 text-slate-300 border border-teal-500/5 px-2 py-0.5 rounded">
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 mt-6 border-t border-teal-500/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Nightly Rate</span>
                      <span className="text-lg font-extrabold text-white">₹{h.price}INR </span>
                    </div>
                    <button
                      onClick={() => handleOpenBooking('hotel', h)}
                      className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 shadow"
                    >
                      Book Stay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. FOOD SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 border-t border-slate-900 pt-16">
        <div className="mb-10">
          <h4 className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Culinary Coastline</h4>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Seafood Cafes & Local Diners</h2>
        </div>

        {restaurants.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 rounded-2xl">Diners are resting. Local street joints are active!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {restaurants.map((r) => (
              <div key={r.id} className="glass-card rounded-2xl overflow-hidden flex flex-col border border-teal-500/10 group">
                <div className="h-44 relative overflow-hidden">
                  <img src={r.image} alt={r.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                    <span className="text-[9px] font-semibold bg-teal-950/80 border border-teal-500/30 text-teal-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      ⭐ {r.rating} Rating
                    </span>
                    <span className="text-[9px] font-semibold bg-slate-950/80 border border-slate-700 text-slate-350 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {r.priceRange} Range
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider block mb-1">{r.type}</span>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-teal-300 transition-colors">{r.name}</h3>
                    <div className="flex gap-1.5 items-center text-slate-400 text-xs mt-2">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <span>{r.location}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-teal-500/10 text-xs text-slate-300 font-light leading-relaxed">
                    <strong className="text-teal-300 font-medium uppercase text-[9px] tracking-wider block mb-1">Famous Specialty:</strong>
                    {r.specialty}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. ACTIVITIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 border-t border-slate-900 pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Watersports & Explorations</h4>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Marine Adventure Bookings</h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sort activities:</span>
            {[['popular', 'Popular'], ['price-low', 'Price: Low'], ['price-high', 'Price: High']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActivitySort(key)}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${activitySort === key
                  ? 'bg-teal-500 border-teal-500 text-white'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {sortedActivities.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 rounded-2xl">Activities are temporarily closed due to high tide.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sortedActivities.map((act) => (
              <div key={act.id} className="glass-card rounded-2xl overflow-hidden flex flex-col border border-teal-500/10 group">
                <div className="h-44 relative overflow-hidden">
                  <img src={act.image} alt={act.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-teal-300 transition-colors">{act.name}</h3>
                    <p className="text-xs text-slate-450 font-light mt-2.5 leading-relaxed">{act.description}</p>

                    <div className="mt-4 flex gap-3 text-xs text-slate-350">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>{act.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-6 border-t border-teal-500/10 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-medium">Rate / Person</span>
                      <span className="text-base font-extrabold text-white">₹{act.price} INR</span>
                    </div>
                    <button
                      onClick={() => handleOpenBooking('activity', act)}
                      className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 shadow"
                    >
                      Book Activity
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. GUIDES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 border-t border-slate-900 pt-16">
        <div className="mb-10">
          <h4 className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Expert Native Escorts</h4>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Professional Coastal Guides</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {guides.map((g) => (
            <div key={g.id} className="glass-card rounded-2xl p-6 border border-teal-500/10 flex items-center gap-6 group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-teal-500/20 flex-shrink-0 relative">
                <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 text-[9px] text-teal-400 font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5" />
                  <span>{g.experience} Experience</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-1">{g.name}</h3>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {g.languages.map((lang, idx) => (
                    <span key={idx} className="text-[9px] font-semibold bg-teal-900/20 text-teal-400 border border-teal-500/10 px-2 py-0.5 rounded">
                      {lang}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => alert(`Contacting guide ${g.name} at: ${g.contact}. Please coordinates details with them directly!`)}
                  className="mt-4 px-4 py-2 bg-slate-900/60 hover:bg-teal-900/25 border border-teal-500/20 hover:border-teal-400/40 text-teal-400 hover:text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                >
                  Contact Guide
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. NEARBY SUGGESTIONS */}
      {nearby.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 border-t border-slate-900 pt-16">
          <div className="mb-10">
            <h4 className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Shoreline Extensions</h4>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Nearby Beaches to Explore</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {nearby.slice(0, 2).map((n) => (
              <div
                key={n.id}
                onClick={() => navigate(`/explore/${n.id}`)}
                className="glass-card rounded-2xl p-5 border border-teal-500/10 flex items-center gap-5 cursor-pointer hover:scale-[1.01] transition-all group"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={n.image} alt={n.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-teal-300 transition-colors">{n.name}</h3>
                  <p className="text-xs text-slate-400 font-light mt-1 line-clamp-2 leading-relaxed">{n.shortDescription}</p>
                  <span className="text-[10px] text-teal-400 font-semibold hover:underline block mt-3 uppercase tracking-wider">Explore Beach ➔</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======================================= */}
      {/* 8. BOOKING FORM MODAL */}
      {/* ======================================= */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg glass-card border border-teal-400/40 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl max-h-[90vh] flex flex-col justify-between">
            {/* Ambient Background blur */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/15 rounded-full blur-3xl"></div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto no-scrollbar">

              {bookingConfirmed ? (
                /* Confirmation UI with Checkmark */
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center mb-4 text-emerald-400 animate-bounce">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
                  <p className="text-xs text-slate-400 font-light max-w-sm mt-3 leading-relaxed">
                    Namaste! Your booking for **{bookingItem.name}** was successfully processed. A detailed confirmation voucher was dispatched to **{contactEmail}**.
                  </p>

                  <div className="mt-8 p-4 bg-ocean-medium/50 border border-teal-500/15 rounded-2xl w-full max-w-xs text-left text-xs space-y-2 font-light">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reserved:</span>
                      <strong className="text-white font-medium">{bookingItem.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date/Time:</span>
                      <strong className="text-white font-medium">{bookingDate} {bookingTime ? `@ ${bookingTime}` : ''}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quantity:</span>
                      <strong className="text-white font-medium">{bookingPeople} Rooms/People</strong>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-teal-500/10">
                      <span className="text-slate-400">Total Charged:</span>
                      <strong className="text-teal-400 font-bold">₹{bookingItem.price * bookingPeople} INR</strong>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer active:scale-95"
                    >
                      View in Dashboard
                    </button>
                    <button
                      onClick={() => setIsBookingOpen(false)}
                      className="px-6 py-3 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : showPayment ? (
                /* UPI Payment Screen */
                <BookingWithUPI
                  bookingDetails={{
                    type: bookingType,
                    itemName: bookingItem.name,
                    date: bookingDate,
                    time: bookingTime,
                    quantity: bookingPeople,
                    price: bookingItem.price * bookingPeople,
                    contactDetails: {
                      name: contactName,
                      phone: contactPhone,
                      email: contactEmail
                    }
                  }}
                  onSuccess={handleBookingSuccess}
                  onCancel={handlePaymentCancel}
                />
              ) : (
                /* Form Screen */
                <>
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Interactive Booking Portal</h3>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                      Confirm {bookingType === 'hotel' ? 'Lodging' : 'Activity'} Booking
                    </h2>
                    <p className="text-xs text-slate-400 font-light mt-1.5">
                      Confirm your transaction for **{bookingItem.name}** below.
                    </p>
                  </div>

                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    {/* Item Information display */}
                    <div className="p-4 bg-ocean-medium/50 rounded-2xl border border-teal-500/15 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">{bookingType === 'hotel' ? 'Stay' : 'Adventure'}</span>
                        <span className="text-sm font-bold text-slate-100">{bookingItem.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Rate</span>
                        <span className="text-sm font-bold text-teal-400">₹{bookingItem.price} INR</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Date */}
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Select Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            required
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full bg-slate-900 border border-teal-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                          />
                        </div>
                      </div>

                      {/* Time (Only relevant for activities) */}
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Time (Optional)</label>
                        <input
                          type="time"
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full bg-slate-900 border border-teal-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Number of {bookingType === 'hotel' ? 'People / Rooms' : 'Participants'}
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setBookingPeople(prev => Math.max(1, prev - 1))}
                          className="w-9 h-9 bg-slate-900 border border-teal-500/30 rounded-lg flex items-center justify-center font-bold hover:border-teal-400/60 active:scale-95 transition-all text-xs cursor-pointer select-none"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-sm text-white">{bookingPeople}</span>
                        <button
                          type="button"
                          onClick={() => setBookingPeople(prev => prev + 1)}
                          className="w-9 h-9 bg-slate-900 border border-teal-500/30 rounded-lg flex items-center justify-center font-bold hover:border-teal-400/60 active:scale-95 transition-all text-xs cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-3 pt-3 border-t border-teal-500/10">
                      <h4 className="text-[9px] font-bold text-teal-400 uppercase tracking-widest">Billing & Contact Information</h4>

                      <div>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Contact Person Name"
                          className="w-full bg-slate-900 border border-teal-500/20 focus:border-teal-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="tel"
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="Phone Number"
                          className="w-full bg-slate-900 border border-teal-500/20 focus:border-teal-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="Email Address"
                          className="w-full bg-slate-900 border border-teal-500/20 focus:border-teal-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Total pricing and submission */}
                    <div className="pt-5 border-t border-teal-500/15 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Estimated Pricing</span>
                        <span className="text-xl font-extrabold text-teal-400">
                          ₹{bookingItem.price * bookingPeople} INR
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsBookingOpen(false)}
                          className="px-5 py-3 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer active:scale-95"
                        >
                          Confirm Booking
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
