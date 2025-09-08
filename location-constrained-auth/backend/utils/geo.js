const fetch = require('node-fetch');

async function lookupIP(ip) {
  try {
    const url = `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,message`;
    const res = await fetch(url);
    const j = await res.json();
    if (j.status !== 'success') return null;
    return {
      city: j.city,
      region: j.regionName,
      country: j.country,
      lat: j.lat,
      lon: j.lon
    };
  } catch (e) {
    console.error('geo lookup failed', e);
    return null;
  }
}

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  function toRad(deg) { return deg * Math.PI / 180; }
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = { lookupIP, haversineDistanceKm };
