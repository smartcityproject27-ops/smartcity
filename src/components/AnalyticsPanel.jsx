export default function AnalyticsPanel() {
  return (
    <div className="bg-cardDark p-4 rounded-xl border border-neonPurple">
      <h3 className="text-lg font-semibold text-neonPurple mb-4">
        Analytics Summary
      </h3>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-black p-4 rounded-lg">
          <p className="text-neonBlue text-xl font-bold">54</p>
          <p className="text-gray-400 text-sm">Total Alerts</p>
        </div>
        <div className="bg-black p-4 rounded-lg">
          <p className="text-neonGreen text-xl font-bold">12</p>
          <p className="text-gray-400 text-sm">Active Cameras</p>
        </div>
      </div>
    </div>
  );
}
