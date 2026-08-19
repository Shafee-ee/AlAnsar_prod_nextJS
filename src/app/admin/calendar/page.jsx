"use client";

import { useState } from "react";
import CalendarManage from "@/components/CalendarManage";
import CalendarUpload from "@/components/CalendarUpload";

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div>
      <div className="flex border-b border-gray-300 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`px-5 py-3 font-medium ${
            activeTab === "upload"
              ? "text-blue-700 border-b-2 border-blue-700"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Upload Calendar
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("manage")}
          className={`px-5 py-3 font-medium ${
            activeTab === "manage"
              ? "text-blue-700 border-b-2 border-blue-700"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Manage Calendar
        </button>
      </div>

      {activeTab === "upload" && <CalendarUpload />}

      {activeTab === "manage" && <CalendarManage />}
    </div>
  );
}
