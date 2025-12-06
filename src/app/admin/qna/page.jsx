'use client';

import { useState } from 'react';
import SingleUpload from "@/components/SingleUpload";
import BulkUpload from "@/components/BulkUpload";
import ManageQnA from "@/components/ManageQnA";

import { Toaster } from "react-hot-toast";


export default function QnAUploadPanel() {
    const [activeTab, setActiveTab] = useState("single");

    return (
        <div className="w-full max-w-4xl mx-auto mt-10">

            <Toaster position="top-right" />


            {/* Tabs */}
            <div className="flex border-b border-gray-300">
                <button
                    onClick={() => setActiveTab("single")}
                    className={`px-6 py-3 font-semibold border-b-4 transition-all 
                    ${activeTab === "single"
                            ? "border-[#1D3F9A] text-[#1D3F9A]"
                            : "border-transparent text-gray-500 hover:text-[#1D3F9A]"}`}
                >
                    Add Single QnA
                </button>

                <button
                    onClick={() => setActiveTab("bulk")}
                    className={`px-6 py-3 font-semibold border-b-4 transition-all 
                    ${activeTab === "bulk"
                            ? "border-[#1D3F9A] text-[#1D3F9A]"
                            : "border-transparent text-gray-500 hover:text-[#1D3F9A]"}`}
                >
                    Bulk Upload
                </button>

                <button
                    onClick={() => setActiveTab("manage")}
                    className={`px-6 py-3 font-semibold border-b-4 transition-all 
                    ${activeTab === "manage"
                            ? "border-[#1D3F9A] text-[#1D3F9A]"
                            : "border-transparent text-gray-500 hover:text-[#1D3F9A]"}`}
                >
                    Manage QnA
                </button>
            </div>

            {/* Content */}
            <div className="bg-white shadow-md p-6 rounded-b-lg border">
                {activeTab === "single" && <SingleUpload />}
                {activeTab === "bulk" && <BulkUpload />}
                {activeTab === "manage" && <ManageQnA />}
            </div>

        </div>
    );
}
