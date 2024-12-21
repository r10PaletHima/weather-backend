const express = require("express");
const axios = require("axios");
const auth = require("../middleware/auth");
const pool = require("../models/db");
const router = express.Router();

// Function to get geolocation from IP
const getGeoLocationFromIP = async (ip) => {
  const apiKey = process.env.GEOLOCATION_API_KEY; // Set this in your .env file
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    if (response.data.status === "fail") {
      return { latitude: null, longitude: null };
    }
    const { lat, lon } = response.data;
    return { latitude: lat, longitude: lon };
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    return { latitude: null, longitude: null };
  }
};

// Fetch weather data
router.get("/weather", auth, async (req, res) => {
  const { city, lat, lon } = req.query;
  const userId = req.user.id; // Assuming the user ID is retrieved from auth middleware
  const apiKey = process.env.WEATHER_API_KEY;

  try {
    let query = city; // Default query is city
    let latitude = lat; // Default latitude
    let longitude = lon; // Default longitude

    // If no city or coordinates are provided, get geolocation based on IP
    if (!city && (!lat || !lon)) {
      const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const { latitude: ipLat, longitude: ipLon } = await getGeoLocationFromIP(
        ip
      ); // Get geo from IP
      latitude = ipLat;
      longitude = ipLon;
      query = `${ipLat},${ipLon}`; // Set query to lat, lon
    }

    // Fetch weather data from WeatherStack API
    const baseUrl = `http://api.weatherstack.com/current`;
    const response = await axios.get(baseUrl, {
      params: {
        access_key: apiKey,
        query: query || `${latitude},${longitude}`, // Fallback to latitude, longitude if no city
      },
    });

    res.json(response.data); // Send back the weather data
  } catch (err) {
    console.error("Error fetching weather data:", err); // Log the error in the terminal
    res.status(500).json({
      message: "Error fetching weather data",
      error: err.message, // Send the error message in the response for debugging
      stack: err.stack, // Include the stack trace for more detailed debugging information
    });
  }
});


module.exports = router;
