"use client";

import { useState } from "react";
import DigiUpload from "@/components/DigiUpload";
import DigiManage from "@/components/DigiManage";
import { Toaster } from "react-hot-toast";

export default function DigiPaperPanel() {
    const [activeTab, setActiveTab] = useState("upload");

    return (
        <div className="w-full max-w-5xl mx-auto mt-10">

            <Toaster position="top-right" />

            {/* Tabs */}
            <div className="flex border-b border-gray-300">
                <button
                    onClick={() => setActiveTab("upload")}
                    className={`px-6 py-3 font-semibold border-b-4 transition-all
          ${activeTab === "upload"
                            ? "border-[#1D3F9A] text-[#1D3F9A]"
                            : "border-transparent text-gray-500 hover:text-[#1D3F9A]"}`}
                >
                    Upload Issue
                </button>

                <button
                    onClick={() => setActiveTab("manage")}
                    className={`px-6 py-3 font-semibold border-b-4 transition-all
          ${activeTab === "manage"
                            ? "border-[#1D3F9A] text-[#1D3F9A]"
                            : "border-transparent text-gray-500 hover:text-[#1D3F9A]"}`}
                >
                    Manage Issues
                </button>
            </div>

            {/* Content */}
            <div className="bg-white shadow-md p-6 rounded-b-lg border">
                {activeTab === "upload" && <DigiUpload />}
                {activeTab === "manage" && <DigiManage />}
            </div>

        </div>
    );
}
