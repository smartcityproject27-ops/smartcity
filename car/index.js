const carSpeedKmph = 40; // average car speed for animation (km/h). Change as needed.

// --- MAP SETUP ---
const map = L.map("map");

// Approximate bounding box for Aligarh district
const aligarhBounds = [
  [27.6, 77.8], // southwest corner
  [28.1, 78.3], // northeast corner
];

// Fit the map to show the whole district
map.fitBounds(aligarhBounds);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// --- STATE ---
let clicks = []; // [latlngA, latlngB]
let markers = [];
let routingControl = null;
let routeGeo = null; // array of LatLng along route

let animState = {
  running: false,
  paused: false,
  marker: null,
  segmentIndex: 0,
  segmentProgress: 0,
  lastTimestamp: null,
  remainingDistance: 0,
};

// helper: format
function fmtDist(m) {
  if (m >= 1000) return (m / 1000).toFixed(2) + " km";
  return Math.round(m) + " m";
}

function fmtTimeSec(s) {
  if (s >= 3600)
    return Math.floor(s / 3600) + "h " + Math.floor((s % 3600) / 60) + "m";
  if (s >= 60) return Math.floor(s / 60) + "m " + Math.round(s % 60) + "s";
  return Math.round(s) + "s";
}

// --- UI control references ---
const infoEl = document.getElementById("info");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const resetBtn = document.getElementById("resetBtn");

pauseBtn.onclick = () => {
  if (animState.running) {
    animState.paused = true;
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
  }
};

resumeBtn.onclick = () => {
  if (animState.running) {
    animState.paused = false;
    animState.lastTimestamp = performance.now();
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
    requestAnimationFrame(step);
  }
};

resetBtn.onclick = () => resetAll();

function resetAll() {
  clicks = [];

  markers.forEach((m) => map.removeLayer(m));

  markers = [];

  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }
  if (animState.marker) {
    map.removeLayer(animState.marker);
    animState.marker = null;
  }
  routeGeo = null;
  animState.running = false;
  animState.paused = false;
  animState.segmentIndex = 0;
  animState.segmentProgress = 0;
  animState.lastTimestamp = null;
  infoEl.innerText = "No route yet. Click Start (A) and End (B).";
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
}

// --- Click to set start/end ---

map.on("click", function (e) {
  if (clicks.length >= 2) return;

  const m = L.marker(e.latlng, {
    title: clicks.length === 0 ? "Start (A)" : "End (B)",
  }).addTo(map);
  m.bindPopup(clicks.length === 0 ? "Start (A)" : "End (B)").openPopup();
  markers.push(m);

  clicks.push(e.latlng);
  if (clicks.length === 2) requestRoute(clicks[0], clicks[1]);
});

// --- Request route via Leaflet Routing Machine (OSRM public server) ---

function requestRoute(a, b) {
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }

  routingControl = L.Routing.control({
    waypoints: [a, b],
    lineOptions: {
      addWaypoints: false,
      styles: [{ color: "blue", opacity: 0.7, weight: 5 }],
    },
    createMarker: function () {
      return null;
    }, // we already created markers
    router: L.Routing.osrmv1({
      serviceUrl: "https://router.project-osrm.org/route/v1", // public OSRM
    }),
    fitSelectedRoutes: true,
    showAlternatives: false,
    addWaypoints: false,
  }).addTo(map);

  routingControl.on("routesfound", function (e) {
    const routes = e.routes;
    if (!routes || !routes.length) {
      infoEl.innerText = "No route found.";
      return;
    }
    const r = routes[0];
    // r.coordinates is an array of {lat, lng} pairs forming the route polyline
    routeGeo = r.coordinates.map((c) => L.latLng(c.lat, c.lng));
    prepareAnimation(routeGeo, r.summary);
  });

  routingControl.on("routingerror", function (err) {
    console.error("Routing error", err);
    infoEl.innerText = "Routing error — see console.";
  });
}

// --- Prepare and start animation ---
function prepareAnimation(latlngs, summary) {
  if (!latlngs || latlngs.length < 2) {
    infoEl.innerText = "Route too short";
    return;
  }

  // remove previous animated marker if present
  if (animState.marker) {
    map.removeLayer(animState.marker);
    animState.marker = null;
  }

  // Create a car icon (simple)

  const carIcon = L.icon({
    iconUrl:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="24" viewBox="0 0 40 24"><rect rx="4" ry="4" width="36" height="16" x="2" y="4" fill="#2a9df4" stroke="#0b76be" stroke-width="1.5"/><circle cx="12" cy="20" r="3" fill="#222"/><circle cx="28" cy="20" r="3" fill="#222"/></svg>`
      ),
    iconSize: [40, 24],
    iconAnchor: [20, 12],
  });

  animState.marker = L.marker(latlngs[0], { icon: carIcon }).addTo(map);

  // Precompute segment distances and total distance
  const segs = [];
  let totalDist = 0;
  for (let i = 0; i < latlngs.length - 1; i++) {
    const a = latlngs[i],
      b = latlngs[i + 1];
    const d = a.distanceTo(b); // in meters
    segs.push({ a, b, d });
    totalDist += d;
  }
  animState.segs = segs;
  animState.totalDistance = totalDist; // meters
  animState.remainingDistance = totalDist;
  animState.segmentIndex = 0;
  animState.segmentProgress = 0;
  animState.running = true;
  animState.paused = false;
  animState.lastTimestamp = performance.now();

  // Show info
  const summaryText = summary
    ? ` (OSRM summary: distance ${fmtDist(
        summary.totalDistance || totalDist
      )}, time ${fmtTimeSec(summary.totalTime || 0)})`
    : "";
  infoEl.innerText = `Route found — total: ${fmtDist(
    totalDist
  )} ${summaryText}\nSimulation started at ${carSpeedKmph} km/h.`;
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;

  // start animation
  requestAnimationFrame(step);
}

// step: uses requestAnimationFrame to move marker smoothly

function step(timestamp) {
  if (!animState.running) return;
  if (animState.paused) {
    animState.lastTimestamp = timestamp;
    return;
  }

  if (!animState.lastTimestamp) animState.lastTimestamp = timestamp;
  const dt = (timestamp - animState.lastTimestamp) / 1000.0; // seconds since last frame
  animState.lastTimestamp = timestamp;

  const speed_mps = (carSpeedKmph * 1000) / 3600; // m/s
  let toMove = speed_mps * dt; // meters to move this frame

  // consume movement across segments
  while (toMove > 0 && animState.segmentIndex < animState.segs.length) {
    const seg = animState.segs[animState.segmentIndex];
    const remainingOnSeg = seg.d * (1 - animState.segmentProgress);
    if (toMove < remainingOnSeg) {
      // move partway along this segment
      animState.segmentProgress += toMove / seg.d;
      toMove = 0;
    } else {
      // finish this segment
      toMove -= remainingOnSeg;
      animState.segmentIndex++;
      animState.segmentProgress = 0;
    }
  }

  // place marker at current position if still in route
  if (animState.segmentIndex >= animState.segs.length) {
    // reached end
    animState.marker.setLatLng(animState.segs[animState.segs.length - 1].b);
    infoEl.innerText = `Arrived at destination. Total distance: ${fmtDist(
      animState.totalDistance
    )}.`;
    animState.running = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    return;
  } else {
    const seg = animState.segs[animState.segmentIndex];
    const lat = seg.a.lat + (seg.b.lat - seg.a.lat) * animState.segmentProgress;
    const lng = seg.a.lng + (seg.b.lng - seg.a.lng) * animState.segmentProgress;
    animState.marker.setLatLng([lat, lng]);
  }

  // compute remaining distance quickly
  let remain = 0;
  if (animState.segmentIndex < animState.segs.length) {
    // remaining on current seg
    const seg = animState.segs[animState.segmentIndex];
    remain += seg.d * (1 - animState.segmentProgress);
    for (let i = animState.segmentIndex + 1; i < animState.segs.length; i++)
      remain += animState.segs[i].d;
  }
  animState.remainingDistance = remain;

  // update info
  const estSec = remain / ((carSpeedKmph * 1000) / 3600);
  infoEl.innerText = `Moving — remaining ${fmtDist(remain)} • ETA ${fmtTimeSec(
    estSec
  )} • Speed ${carSpeedKmph} km/h`;

  // rotate icon to point direction (optional)

  try {
    const idx = animState.segmentIndex;

    if (idx < animState.segs.length) {
      const s = animState.segs[idx];
      const angle =
        (Math.atan2(s.b.lat - s.a.lat, s.b.lng - s.a.lng) * 180) / Math.PI;
      animState.marker
        .getElement()
        ?.style?.setProperty("transform", `rotate(${-angle}deg)`);
    }
  } catch (e) {
    /* ignore */
  }

  // continue
  requestAnimationFrame(step);
}

// initial message
infoEl.innerText =
  "Click map: first click = Start (A), second click = End (B).";
