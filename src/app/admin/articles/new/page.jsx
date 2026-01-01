"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewArticlePage() {
    const router = useRouter();

    const [slug, setSlug] = useState("");
    const [category, setCategory] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!slug || !category) {
            setError("Slug and Category are required fields");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/articles/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug,
                    category,
                    isFeatured,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create article");
            }

            //redirect to article editor

            router.push(`/admin/articles/${data.id}`);

        } catch (err) {
            setError(err.message);
            setLoading(false);
        }

    }

    return (
        <div className='max-w-xl space-y-6'>
            <h1 className='text-2xl font-bold'>Create Article</h1>

            <form onSubmit={handleSubmit} className='space-y-4'>
                {/*slug*/}
                <div className='space-y-1'>
                    <label className='font-medium'>Slug</label>
                    <input type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className='w-full p-2 border rounded'
                        placeholder='Enter permanent address ex:"talaq-during-pregnancy" ' />
                    <p className='text-sm text-gray-500'>
                        Permanent adress.cannot be changed after published
                    </p>
                </div>

                {/*category*/}
                <div className='space-y-1'>
                    <label className='font-medium'>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                        className='w-full p-2 border rounded'>
                        <option value="">Select Category</option>
                        <option value="Smaniyaru">Smaniyaru</option>
                        <option value="Islamic History">Islamic history</option>
                        <option value="Hadith">Hadith </option>
                        <option value="Fiqh">Fiqh</option>
                        <option value="Vismaya Jagattu">Vismaya Jagattu</option>
                        <option value="Vishleshanagalu">Vishleshanagalu</option>
                        <option value="Quranic vyakhanagalu">Quranic vyakhanagalu</option>

                    </select>

                </div>
                {/*Featured  */}
                <div className='flex items-center gap-2'>
                    <input type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.value)} />
                    <label> Featured Article</label>
                </div>

                {error && (
                    <p className='text-sm text-red-600'>{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className='px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50'
                >
                    {loading ? "Creating..." : "Create Article"}
                </button>
            </form>
        </div>
    )

}