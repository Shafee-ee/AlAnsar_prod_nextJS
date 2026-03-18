"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect,useState } from "react";

export default function AdminLayout({ children }) {
    const { loading, authReady, isAdmin, user } = useAuth();
    const router = useRouter();
    const [pendingCount, setPendingCount]=useState(0);

    useEffect(()=>{
        async function fetchCount(){
            const res=await fetch("/api/qna/submissions-count");
            const data=await res.json();
            console.log("Count:",data)
            setPendingCount(data.count)
        }
        fetchCount();
    },[])

    useEffect(() => {
        // Wait until authReady — means provider finished admin check
        if (authReady && (!user || isAdmin === false)) {
            router.replace("/");
        }
    }, [authReady, user, isAdmin, router]);

    // show checking UI until authReady is true (so no flash redirect)
    if (loading || !authReady) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Checking admin access…
            </div>
        );
    }

    if (!isAdmin) {
        // In case authReady is true and user is not admin, nothing renders because the effect will redirect.
        // Provide a fallback UI to avoid a blank page in case router.replace fails.
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md p-4">
                <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

                <nav className="space-y-3">
                    <a href="/admin" className="block text-gray-700 hover:text-black">
                        Dashboard
                    </a>
                    <a href="/admin/qna" className="block text-gray-700 hover:text-black">
                        Q&A Manager
                    </a>
                    <a href="/admin/articles" className="block text-gray-700 hover:text-black">
                        Articles
                    </a>
              <a
                 href="/admin/qna/qna-submissions"
                  className="flex items-center justify-between text-gray-700 hover:text-black"
                    >
                <span>Submitted Questions</span>

                {pendingCount > 0 && (
                 <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                 {pendingCount}
                </span>
                    )}
                    </a>
                    <a href="/admin/digipaper" className="block text-gray-700 hover:text-black">
                        Manage Digipaper
                    </a>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8">{children}</main>
        </div>
    );
}
