"use client";

import { useEffect, useState } from "react";

// podaci o vremenu koje cuvamo u state-u
type WeatherData = {
  temperature: number; // temperatura u celzijusu
  weatherCode: number; // WMO weather code
  isDay: boolean; // da li je dan (za razlicite ikone)
};

// mapiranje WMO weather kodova na emoji ikone
const weatherCodeToEmoji: Record<number, string> = {
  0: "☀️", // "Vedro",
  1: "🌤️", // "Pretežno vedro",
  2: "⛅", // "Delimično oblačno",
  3: "☁️", // "Oblačno",
  45: "🌫️", // "Magla",
  48: "🌫️", // "Magla sa mrazom",
  51: "🌧️", // "Slaba kiša",
  53: "🌧️", // "Umerena kiša",
  55: "🌧️", // "Jaka kiša",
  61: "🌧️", // "Slaba kiša",
  63: "🌧️", // "Umerena kiša",
  65: "🌧️", // "Jaka kiša",
  71: "🌨️", // "Slab sneg",
  73: "🌨️", // "Umeren sneg",
  75: "🌨️", // "Jak sneg",
  77: "🌨️", // "Snežna zrna",
  80: "🌦️", // "Slabi pljuskovi",
  81: "🌦️", // "Umereni pljuskovi",
  82: "🌦️", // "Jaki pljuskovi",
  85: "🌨️", // "Slabi snežni pljuskovi",
  86: "🌨️", // "Jaki snežni pljuskovi",
  95: "⛈️", // "Grmljavina",
  96: "⛈️", // "Grmljavina sa gradom",
  99: "⛈️", // "Grmljavina sa jakim gradom",
};

const weatherCodeToDescription: Record<number, string> = {
  0: "Vedro",
  1: "Pretežno vedro",
  2: "Delimično oblačno",
  3: "Oblačno",
  45: "Magla",
  48: "Magla sa mrazom",
  51: "Slaba kiša",
  53: "Umerena kiša",
  55: "Jaka kiša",
  61: "Slaba kiša",
  63: "Umerena kiša",
  65: "Jaka kiša",
  71: "Slab sneg",
  73: "Umeren sneg",
  75: "Jak sneg",
  77: "Snežna zrna",
  80: "Slabi pljuskovi",
  81: "Umereni pljuskovi",
  82: "Jaki pljuskovi",
  85: "Slabi snežni pljuskovi",
  86: "Jaki snežni pljuskovi",
  95: "Grmljavina",
  96: "Grmljavina sa gradom",
  99: "Grmljavina sa jakim gradom",
};

// WeatherWidget - prikazuje trenutne vremenske uslove
const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        // koordinate za Beograd
        const lat = 44.8176;
        const lon = 20.4633;

        // Open-Meteo API - besplatan, bez API kljuca
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=Europe%2FBelgrade`,
        );

        if (!response.ok) {
          throw new Error("Greška pri učitavanju vremena");
        }

        const data = await response.json();

        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
          isDay: data.current.is_day === 1,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nepoznata greška");
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();

    // osvezavamo vreme svakih 30 minuta
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="animate-pulse">🌡️</span>
        <span>...</span>
      </div>
    );
  }

  if (error || !weather) {
    return null; // ne prikazujemo nista ako ima greska
  }

  const emoji = weatherCodeToEmoji[weather.weatherCode] || "🌡️";
  const description =
    weatherCodeToDescription[weather.weatherCode] || "Nepoznato";

  return (
    <div
      className="flex items-center gap-2 text-sm"
      title={`${description} - Beograd`}>
      <span className="text-lg">{emoji}</span>
      <span className="font-medium">{weather.temperature}°C</span>
      <span className="text-slate-500 hidden sm:inline">Beograd</span>
    </div>
  );
};

export default WeatherWidget;
