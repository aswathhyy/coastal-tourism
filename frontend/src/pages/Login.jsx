import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Compass, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectPath = location.state?.redirectTo || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans relative bg-ocean-dark min-h-screen flex items-center justify-center p-4">
      {/* Dynamic decorative backdrop blur orbs */}
      <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md glass-card rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl shadow-2xl border border-teal-500/25 z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-3">
            <Compass className="w-8 h-8 text-teal-400 group-hover:rotate-45 transition-transform duration-500" />
            <span className="font-extrabold text-lg text-slate-100 uppercase tracking-widest">Coastal AI</span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Namaste! Welcome Back</h2>
          <p className="text-xs text-slate-400 font-light mt-2">
            Secure login to unlock bookings, favorites, and dashboards.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium flex gap-2 items-center mb-6 animate-pulse-glow">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. wanderlust@example.com"
              required
              className="w-full bg-slate-900 border border-teal-500/25 focus:border-teal-400 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full bg-slate-900 border border-teal-500/25 focus:border-teal-400 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 font-bold text-xs uppercase tracking-wider text-white rounded-xl shadow-lg shadow-teal-500/10 hover:shadow-teal-500/25 transition-all scale-100 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating Session...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-teal-500/10 text-xs">
          <span className="text-slate-450 font-light">New to the Coast? </span>
          <Link
            to="/signup"
            state={{ redirectTo: redirectPath }}
            className="text-teal-400 hover:text-teal-300 font-semibold hover:underline"
          >
            Register Account ➔
          </Link>
        </div>

      </div>
    </div>
  );
}
