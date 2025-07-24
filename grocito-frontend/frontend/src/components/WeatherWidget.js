import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherWidget = ({ latitude, longitude }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!latitude || !longitude) return;
      
      try {
        setLoading(true);
        // Try to get API key from .env file
        // Hardcoded API key as fallback - this is the one from the .env file
        // In a production app, you should never hardcode API keys
        const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || '5f37d7aa960693b8ab11b5921f2af84f';
        
        console.log('Weather Widget - Using API key:', API_KEY ? 'API key is set' : 'API key is missing');
        
        if (!API_KEY) {
          throw new Error('Weather API key is missing');
        }
        
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
        const { data } = await axios.get(url);
        
        setWeatherData({
          temp: (data.main.temp - 273.15).toFixed(1), // Kelvin to Celsius
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          clouds: data.clouds.all
        });
        
        setError(null);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Could not load weather data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [latitude, longitude]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg shadow-sm">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
        <span className="text-sm text-blue-500">Loading weather...</span>
      </div>
    );
  }
  
  if (error) {
    return null; // Don't show anything if there's an error
  }
  
  if (!weatherData) return null;
  
  return (
    <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-md p-4 flex items-center">
      <div className="mr-3">
        <img 
          src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`} 
          alt={weatherData.description}
          className="w-12 h-12"
        />
      </div>
      <div>
        <div className="text-xl font-bold">{weatherData.temp}°C</div>
        <div className="text-xs capitalize">{weatherData.description}</div>
      </div>
    </div>
  );
};

export default WeatherWidget;