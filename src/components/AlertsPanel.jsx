import { alerts } from "../data/dummyData";

export default function AlertsPanel() {
  return (
    <div className="bg-cardDark p-4 rounded-xl border border-neonRed">
      <h3 className="text-lg font-semibold text-neonRed mb-4">
        Real-Time Alerts
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {alerts.map((alert, index) => (
          <div key={index} className="bg-black p-3 rounded-lg border-l-4 border-neonRed">
            <p className="text-sm text-gray-400">{alert.time}</p>
            <p>{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
