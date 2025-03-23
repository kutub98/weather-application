import { useState, useEffect } from "react";
import { FaSearch, FaTrash, FaSyncAlt } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

const API_KEY = "4b40a85afeb26c8092ce4299cb4c4995"; // Replace with your API Key

const App = () => {
  // Convert Celsius to Fahrenheit
  function celsiusToFahrenheit(celsius) {
    return (celsius * 9) / 5 + 32;
  }

  // Convert Fahrenheit to Celsius
  function fahrenheitToCelsius(fahrenheit) {
    return ((fahrenheit - 32) * 5) / 9;
  }

  const [cities, setCities] = useState(() => {
    const storedCities = localStorage.getItem("cities");
    return storedCities ? JSON.parse(storedCities) : ["Dhaka", "Chittagong"];
  });

  const [weatherData, setWeatherData] = useState({});
  const [currentLocationWeather, setCurrentLocationWeather] = useState(null);
  const [unit, setUnit] = useState("metric"); // "metric" = Celsius, "imperial" = Fahrenheit
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    localStorage.setItem("cities", JSON.stringify(cities));
  }, [cities]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          fetchCurrentLocationWeather(latitude, longitude);
        },
        (err) => console.error("Error getting location:", err)
      );
    }
  }, []);

  async function fetchCurrentLocationWeather(lat, lon) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      if (!res.ok) throw new Error("Failed to fetch weather");
      const result = await res.json();
      setCurrentLocationWeather(result);
    } catch (err) {
      setError("Could not fetch location weather.");
    }
  }

  useEffect(() => {
    fetchWeatherData();
  }, [cities]);

  async function fetchWeatherData() {
    setLoading(true);
    setError("");
    const data = {};

    for (const city of cities) {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        if (!res.ok) throw new Error(`Failed to fetch data for ${city}`);
        const result = await res.json();
        data[city] = result;
      } catch (err) {
        setError((prev) => prev + ` Could not fetch data for ${city}.`);
      }
    }

    setWeatherData(data);
    setLoading(false);
  }

  async function fetchSearchResults(query) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&units=metric&appid=${API_KEY}`
      );
      const data = await res.json();
      setSearchResults(data.list || []);
    } catch (err) {
      console.error("Error fetching search results:", err);
    }
  }

  useEffect(() => {
    if (search.trim() !== "") {
      fetchSearchResults(search);
    } else {
      setSearchResults([]);
    }
  }, [search]);

  function addCity(city) {
    if (city && !cities.includes(city)) {
      setCities([...cities, city]);
      setSearch("");
      setSearchResults([]);
    }
  }

  function removeCity(city) {
    setCities(cities.filter((c) => c !== city));
  }

  function toggleUnit() {
    setUnit((prev) => (prev === "metric" ? "imperial" : "metric"));
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-blue-800 p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">Weather Dashboard</h1>

        {currentLocationWeather && (
          <div className="bg-white/20 p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl flex items-center gap-2">
              <MdLocationOn /> {currentLocationWeather.name}
            </h2>
            <p className="text-2xl font-bold">
              {unit === "metric"
                ? `${currentLocationWeather.main.temp}°C`
                : `${celsiusToFahrenheit(currentLocationWeather.main.temp).toFixed(2)}°F`}
            </p>
            <p>{currentLocationWeather.weather[0].description}</p>
            <p>Humidity: {currentLocationWeather.main.humidity}%</p>
            <p>
              Wind Speed: {currentLocationWeather.wind.speed} {unit === "metric" ? "m/s" : "mph"}
            </p>
          </div>
        )}

        <div className="relative flex gap-2 items-center mb-6">
          <input
            type="text"
            placeholder="Search city"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="py-2 px-4 rounded-md w-full text-black"
          />
          {searchResults.length > 0 && (
            <div className="absolute bg-white text-black shadow-lg rounded-md mt-2 w-full z-10 max-h-40 overflow-y-auto">
              {searchResults.map((city) => (
                <div
                  key={city.id}
                  className="p-2 cursor-pointer hover:bg-gray-300"
                  onClick={() => addCity(city.name)}
                >
                  {city.name}, {city.sys.country}
                </div>
              ))}
            </div>
                  )}
                  
          <button onClick={() => addCity(search)} className="bg-blue-600 p-3 rounded-md">
            <FaSearch />
          </button>
          <button onClick={toggleUnit} className="bg-gray-600 flex flex-row items-center px-2 py-1 text-[12px] rounded-md">
  {unit === "metric" ? "Switch to °F" : "Switch to °C"}
</button>
        </div>

        {loading && <p>Loading weather data...</p>}
        {error && <p className="text-red-400">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cities.map((city) => (
              <div key={city} className="bg-white/20 p-6 rounded-lg shadow-lg w-full">
                  <div className="flex justify-between w-full items-center">
                      <h2 className="text-xl font-bold">{city}</h2>
                      <button onClick={() => removeCity(city)} className="text-red-400 p-1 flex items-center gap-1 text-[10px] bg-white  rounded-md mt-4">
                Remove <FaTrash className="h-3"/>
              </button>
                  </div>
              
              {weatherData[city]?.main ? (
                <>
                  <p className="text-2xl font-bold">
                    {unit === "metric"
                      ? `${weatherData[city].main.temp}°C`
                      : `${celsiusToFahrenheit(weatherData[city].main.temp).toFixed(2)}°F`}
                  </p>
                  <p className="capitalize">{weatherData[city].weather[0].description}</p>
                  <p>Humidity: {weatherData[city].main.humidity}%</p>
                  <p>
                    Wind Speed: {weatherData[city].wind.speed} {unit === "metric" ? "m/s" : "mph"}
                  </p>
                </>
              ) : (
                <p>Loading...</p>
              )}
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
