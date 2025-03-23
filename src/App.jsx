import { useState, useEffect } from "react";
import { FaSearch, FaTrash, FaSyncAlt } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

const API_KEY = "4b40a85afeb26c8092ce4299cb4c4995"; // Replace with your API Key

const App = () => {
  const [cities, setCities] = useState(() => {
    const storedCities = localStorage.getItem("cities");
    return storedCities ? JSON.parse(storedCities) : ["Dhaka", "Chittagong"];
  });

  const [weatherData, setWeatherData] = useState({});
  const [currentLocationWeather, setCurrentLocationWeather] = useState(null);
  const [unit, setUnit] = useState("metric");
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
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
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
  }, [cities, unit]);

  async function fetchWeatherData() {
    setLoading(true);
    setError("");
    const data = {};

    for (const city of cities) {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${API_KEY}`
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
        `https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&units=${unit}&appid=${API_KEY}`
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
              {currentLocationWeather.main.temp}°{unit === "metric" ? "C" : "F"}
            </p>
            <p>{currentLocationWeather.weather[0].description}</p>
            <p>Humidity: {currentLocationWeather.main.humidity}%</p>
            <p>Wind Speed: {currentLocationWeather.wind.speed} {unit === "metric" ? "m/s" : "mph"}</p>
          </div>
        )}

        <div className="relative flex gap-3 items-center mb-6">
          <input
            type="text"
            placeholder="Search city"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 rounded-md w-full text-black"
          />
          {searchResults.length > 0 && (
            <div className="absolute bg-white text-black shadow-lg rounded-md mt-2 w-full z-10 max-h-60 overflow-y-auto">
              {searchResults.map((city) => (
                <div
                  key={city.id}
                  className="p-3 cursor-pointer hover:bg-gray-300"
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
          <button onClick={() => setUnit(unit === "metric" ? "imperial" : "metric")} className="bg-gray-600 p-3 rounded-md">
            <FaSyncAlt />
          </button>
        </div>

        {loading && <p>Loading weather data...</p>}
        {error && <p className="text-red-400">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cities.map((city) => (
            <div key={city} className="bg-white/20 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold">{city}</h2>
              {weatherData[city]?.main ? (
                <>
                  <p className="text-2xl font-bold">
                    {weatherData[city].main.temp}°{unit === "metric" ? "C" : "F"}
                  </p>
                  <p className="capitalize">{weatherData[city].weather[0].description}</p>
                  <p>Humidity: {weatherData[city].main.humidity}%</p>
                  <p>Wind Speed: {weatherData[city].wind.speed} {unit === "metric" ? "m/s" : "mph"}</p>
                </>
              ) : (
                <p>Loading...</p>
              )}
              <button onClick={() => removeCity(city)} className="bg-red-600 p-3 rounded-md mt-4">
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
