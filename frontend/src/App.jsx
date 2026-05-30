import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';

// Pages
import Home from './pages/Home';
import DistrictDetail from './pages/DistrictDetail';
import BeachDetail from './pages/BeachDetail';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-ocean-dark min-h-screen selection:bg-teal-500 selection:text-white antialiased flex flex-col justify-between">
          <div>
            <Navbar />

            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/district/:id" element={<DistrictDetail />} />
                <Route path="/explore/:beachId" element={<BeachDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
            </main>
          </div>

          {/* Floating AI Chatbot Concierge */}
          <Chatbot />

          {/* Footer branding */}
          <footer className="bg-slate-950 py-10 border-t border-teal-500/10 text-center text-xs text-slate-500 font-light">
            <div className="max-w-7xl mx-auto px-4">
              <p>© {new Date().getFullYear()} Coastal Tourism Kerala. Crafted with luxury AI travel integration.</p>
              <p className="mt-2 text-[10px] text-teal-600 uppercase tracking-widest font-semibold">Namaste & safe travels 🌴</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
