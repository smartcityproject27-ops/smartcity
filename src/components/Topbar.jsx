import { useState, useEffect } from "react";

export default function Topbar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000); // update every 1 second

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <div className="bg-cardDark px-6 py-4 border-b border-neonBlue flex justify-between items-center">
      <h1 className="text-2xl font-bold text-neonBlue">
        Smart City Surveillance
      </h1>
      <div className="flex items-center space-x-4">
        <span className="text-neonGreen animate-pulse">● System Active</span>
        <span>{time.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}