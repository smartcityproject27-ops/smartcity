import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ModuleCard from "./components/ModuleCard";
import AlertsPanel from "./components/AlertsPanel";
import AnalyticsPanel from "./components/AnalyticsPanel";
import EventLog from "./components/EventLog";

function App() {
  return (
    <div className="flex h-screen text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <ModuleCard title="Crowd Monitoring" />
            <ModuleCard title="ANPR" />
            <ModuleCard title="Speed Detection" />
            <ModuleCard title="Object Detection" />
            <ModuleCard title="Face Recognition" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <AlertsPanel />
            <AnalyticsPanel />
          </div>
          <div className="mt-6">
            <EventLog />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
