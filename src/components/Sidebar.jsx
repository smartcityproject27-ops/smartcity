export default function Sidebar() {
  const menu = [
    "Dashboard",
    "Crowd Monitoring",
    "ANPR",
    "Speed Detection",
    "Object Detection",
    "Face Recognition",
    "Analytics",
  ];
  return (
    <div className="w-64 bg-cardDark p-6 border-r border-neonBlue">
      <h2 className="text-xl font-bold text-neonBlue mb-8">
        AI Command Center
      </h2>
      <ul className="space-y-4">
        {menu.map((item, index) => (
          <li key={index} className="hover:text-neonGreen cursor-pointer transition">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
