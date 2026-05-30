import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Compass, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectPath = location.state?.redirectTo || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signup({
        name,
        email,
        phone,
        password,
        confirmPassword
      });
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || "Registration failed. Please review your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans relative bg-ocean-dark min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md glass-card rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl shadow-2xl border border-teal-500/25 z-10 my-8">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-3">
            <Compass className="w-8 h-8 text-teal-400 group-hover:rotate-45 transition-transform duration-500" />
            <span className="font-extrabold text-lg text-slate-100 uppercase tracking-widest">Coastal AI</span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Create Travel Profile</h2>
          <p className="text-xs text-slate-400 font-light mt-2">
            Register to book stays, watersports, and access personalized dashboards.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium flex gap-2 items-center mb-6 animate-pulse-glow">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-semibold">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Adarsh Nair"
              required
              className="w-full bg-slate-900 border border-teal-500/25 focus:border-teal-400 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-semibold">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. adarsh@example.com"
              required
              className="w-full bg-slate-900 border border-teal-500/25 focus:border-teal-400 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-semibold">Phone Number (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full bg-slate-900 border border-teal-500/25 focus:border-teal-400 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-semibold">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose password"
                required
                className="w-full bg-slate-900 border border-teal-500/25 focus:border-teal-400 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-semibold">Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                required
                className="w-full bg-slate-900 border border-teal-500/25 focus:border-teal-400 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 font-bold text-xs uppercase tracking-wider text-white rounded-xl shadow-lg shadow-teal-500/10 hover:shadow-teal-500/25 transition-all scale-100 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Registering Traveler...' : 'Sign Up'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-teal-500/10 text-xs">
          <span className="text-slate-450 font-light">Already have a Profile? </span>
          <Link
            to="/login"
            state={{ redirectTo: redirectPath }}
            className="text-teal-400 hover:text-teal-300 font-semibold hover:underline"
          >
            Sign In Here ➔
          </Link>
        </div>

      </div>
    </div>
  );
}
