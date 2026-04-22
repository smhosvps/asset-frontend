import EquipmentRequests from "@/components/request/EquipmentRequests";
import MaintenanceRequests from "@/components/request/MaintenanceRequests";
import { useState } from "react";

function App() {
  const [activeTab, setActiveTab] = useState("a");

  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col">
      <div className="flex border-b">
        <button
          className={`px-4 py-2 ${
            activeTab === "a" ? "bg-green-500 text-white" : "bg-gray-100"
          }`}
          onClick={() => handleTabClick("a")}
        >
          Maintenance Requests
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "b" ? "bg-green-500 text-white" : "bg-gray-100"
          }`}
          onClick={() => handleTabClick("b")}
        >
          Equipment Requests
        </button>
      </div>
      <div className="p-4">
        {activeTab === "a" && <MaintenanceRequests/>}
        {activeTab === "b" && <EquipmentRequests/>}
      </div>
    </div>
  );
}

export default App;
