"use client";

import CreateArticlePage from "./new/page"
import { useState } from "react";

export default function ArticlesPage() {

    const [activeTab, setActiveTab] = useState("create");

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Articles</h1>

            {/* Tabs like QnA */}
            <div className="flex gap-4 border-b">


                <button
                    onClick={() => setActiveTab("create")}
                    className={`pb-2 border-b-2 ${activeTab === "create"
                        ? "border-blue-600 font-medium"
                        : "border-transparent text-gray-500"
                        }`}
                >
                    Create Article
                </button>


                <button
                    onClick={() => setActiveTab("manage")}
                    className={`pb-2 border-b-2 ${activeTab === "manage"
                        ? "border-blue-600 font-medium"
                        : "border-transparent text-gray-500"
                        }`}
                >
                    Manage Articles
                </button>



            </div>

            {/* Content goes here */}
            <div>
                {activeTab === "create" && <CreateArticlePage />}

                {activeTab === "manage" && (
                    <div className="text-gray-500">
                        Manage Articles Coming next

                    </div>
                )}

            </div>
        </div >
    );
}
