import { logs } from "../data/dummyData";

export default function EventLog() {
  return (
    <div className="bg-cardDark p-4 rounded-xl border border-neonBlue">
      <h3 className="text-lg font-semibold text-neonBlue mb-4">
        Time-Stamped Event Logs
      </h3>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="text-neonGreen">
            <th className="pb-2">Time</th>
            <th>Module</th>
            <th>Event</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index} className="border-t border-gray-700">
              <td className="py-2">{log.time}</td>
              <td>{log.module}</td>
              <td>{log.event}</td>
              <td>{log.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
