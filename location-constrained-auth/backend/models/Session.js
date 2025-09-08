const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ip: { type: String },
  city: { type: String },
  region: { type: String },
  country: { type: String },
  lat: { type: Number },
  lon: { type: Number },
  loginAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
