import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:7000/api' : '/api');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('coastal_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch profile on startup if token exists
  useEffect(() => {
    const loadProfile = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (err) {
          console.error("Failed to load user profile", err);
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      localStorage.setItem('coastal_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const signup = async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok && res.status !== 210) {
        throw new Error(data.error || 'Signup failed');
      }
      localStorage.setItem('coastal_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('coastal_token');
    setToken(null);
    setUser(null);
  };

  const toggleFavoriteBeach = async (beachId) => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/favorite/beach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ beachId })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({
          ...prev,
          favoriteBeaches: data.favoriteBeaches
        }));
        return true;
      }
    } catch (err) {
      console.error("Failed to toggle beach favorite:", err);
    }
    return false;
  };

  const toggleFavoriteDistrict = async (districtId) => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/favorite/district`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ districtId })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({
          ...prev,
          favoriteDistricts: data.favoriteDistricts
        }));
        return true;
      }
    } catch (err) {
      console.error("Failed to toggle district favorite:", err);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, toggleFavoriteBeach, toggleFavoriteDistrict, API_BASE_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
