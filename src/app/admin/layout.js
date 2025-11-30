"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
    const { loading, isAdmin } = useAuth();
    const router = useRouter();

    // Protect ALL admin pages
    useEffect(() => {
        if (!loading && !isAdmin) {
            router.replace("/");
        }
    }, [loading, isAdmin, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Checking admin access…
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md p-4">
                <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

                <nav className="space-y-3">
                    <a href="/admin" className="block text-gray-700 hover:text-black">Dashboard</a>
                    <a href="/admin/qna" className="block text-gray-700 hover:text-black">Q&A Manager</a>
                    <a href="/admin/articles" className="block text-gray-700 hover:text-black">Articles</a>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8">{children}</main>
        </div>
    );
}
