const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const geoip = require("geoip-lite"); //  for IP -> location
const haversine = require("haversine-distance"); //  to calculate distance

const SPEED_THRESHOLD = process.env.SPEED_THRESHOLD_KMH;

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      lastLogin: null, // 📌 new field to store login history
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // -----------------------
    //  Location & Speed Check
    // -----------------------
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const currentLocation = geoip.lookup(ip);

    if (currentLocation && user.lastLogin) {
      const last = user.lastLogin;

      // Distance (in meters)
      const distance =
        haversine(
          { lat: last.lat, lon: last.lon },
          { lat: currentLocation.ll[0], lon: currentLocation.ll[1] }
        ) / 1000; // convert to km

      // Time difference in hours
      const timeDiff = (Date.now() - last.time) / (1000 * 60 * 60);

      // Speed in km/h
      const speed = distance / timeDiff;

      if (speed > SPEED_THRESHOLD) {
        return res.status(403).json({
          message: "Suspicious login detected: Impossible travel speed",
          speed: `${speed.toFixed(2)} km/h`,
        });
      }
    }

    // Save current login details
    user.lastLogin = {
      lat: currentLocation ? currentLocation.ll[0] : null,
      lon: currentLocation ? currentLocation.ll[1] : null,
      time: Date.now(),
    };
    await user.save();

    res.status(200).json({ message: `Welcome, ${user.name}!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
