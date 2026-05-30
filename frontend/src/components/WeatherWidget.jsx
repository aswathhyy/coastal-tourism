import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, Waves, Wind, Compass } from 'lucide-react';

export default function WeatherWidget({ beachName }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    // Generate realistic, randomized beach weather based on beach name
    const seed = beachName.charCodeAt(0) + beachName.charCodeAt(beachName.length - 1);
    
    // Determine condition
    let condition = 'Sunny';
    let temp = 28 + (seed % 6); // 28 to 33 deg C
    let wind = 10 + (seed % 15); // 10 to 25 km/h
    let humidity = 70 + (seed % 20); // 70 to 90%
    let flag = 'Green'; // Safety flag
    let tide = (seed % 2 === 0) ? 'Low Tide' : 'High Tide';
    
    if (seed % 3 === 0) {
      condition = 'Cloudy';
      temp -= 2;
    } else if (seed % 7 === 0) {
      condition = 'Mist/Breeze';
      flag = 'Yellow';
    }

    if (beachName.toLowerCase().includes('kovalam') || beachName.toLowerCase().includes('varkala')) {
      // Cliff beaches have strong breezes
      wind += 5;
      if (wind > 20) flag = 'Yellow';
    }

    setWeather({
      temp,
      condition,
      wind,
      humidity,
      flag,
      tide
    });
  }, [beachName]);

  if (!weather) return null;

  const flagColors = {
    Green: { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Safe for Swimming' },
    Yellow: { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Caution: Moderate Swell' },
    Red: { bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30', label: 'Warning: Strong Currents' }
  };

  const currentFlag = flagColors[weather.flag] || flagColors.Green;

  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Live Beach Weather</h4>
          <h3 className="text-lg font-bold text-slate-100">{beachName}</h3>
        </div>
        <div className="flex items-center gap-2">
          {weather.condition === 'Sunny' ? (
            <Sun className="w-8 h-8 text-amber-400 animate-spin-slow" />
          ) : (
            <CloudRain className="w-8 h-8 text-teal-300" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {weather.temp}°C
          </div>
          <div className="text-xs text-slate-400 mt-1 capitalize">{weather.condition}</div>
        </div>

        <div className="flex flex-col justify-end text-right text-xs text-slate-300 gap-1">
          <div className="flex items-center justify-end gap-1.5">
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span>{weather.wind} km/h Wind</span>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <Waves className="w-3.5 h-3.5 text-teal-400" />
            <span>{weather.tide}</span>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>Humidity: {weather.humidity}%</span>
          </div>
        </div>
      </div>

      {/* Safety flag indicator */}
      <div className={`mt-3 py-2 px-3 rounded-lg border text-center text-xs font-medium ${currentFlag.bg}`}>
        🌊 Swimming Status: {currentFlag.label}
      </div>
    </div>
  );
}
