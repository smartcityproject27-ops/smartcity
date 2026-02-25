export default function ModuleCard({ title }) {
  return (
    <div className="bg-cardDark p-4 rounded-xl shadow-lg border border-neonBlue">
      <div className="flex justify-between mb-3">
        <h3 className="text-lg font-semibold text-neonBlue">{title}</h3>
        <span className="flex items-center text-neonGreen text-sm">
          <span className="w-2 h-2 bg-neonGreen rounded-full animate-pulse mr-2"></span>
          LIVE
        </span>
      </div>
      <div className="bg-black h-40 rounded-lg flex items-center justify-center text-gray-500">
        Pi Camera Feed
      </div>
      <div className="mt-3 text-sm text-gray-400">
        <p>Status: Active</p>
        <p>Events Today: 5</p>
      </div>
    </div>
  );
}
