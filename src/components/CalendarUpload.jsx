"use client";

import { useState } from "react";
import app from "@/lib/firebaseClient";
import { getAuth } from "firebase/auth";
import toast from "react-hot-toast";

export default function CalendarUpload() {
  const [hijriMonth, setHijriMonth] = useState("");
  const [hijriYear, setHijriYear] = useState("");
  const [gregorianLabel, setGregorianLabel] = useState("");
  const [calendarDate, setCalendarDate] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !hijriMonth ||
      !hijriYear ||
      !gregorianLabel ||
      !calendarDate ||
      !imageFile
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const auth = getAuth(app);
      const user = auth.currentUser;

      if (!user) {
        toast.error("You are not logged in.");
        return;
      }

      const idToken = await user.getIdToken();

      const formData = new FormData();

      formData.append("image", imageFile);
      formData.append("hijriMonth", hijriMonth);
      formData.append("hijriYear", hijriYear);
      formData.append("gregorianLabel", gregorianLabel);
      formData.append("calendarDate", calendarDate);

      const res = await fetch("/api/calendar/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Calendar upload failed.");
      }

      toast.success("Calendar uploaded successfully.");

      setHijriMonth("");
      setHijriYear("");
      setGregorianLabel("");
      setCalendarDate("");
      setImageFile(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Calendar upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 shadow rounded">
      <h1 className="text-2xl font-bold mb-6">Upload Calendar</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Hijri Month (e.g. Rabi-ul-Awwal)"
          className="w-full border p-2"
          value={hijriMonth}
          onChange={(e) => setHijriMonth(e.target.value)}
        />

        <input
          type="number"
          placeholder="Hijri Year (e.g. 1448)"
          className="w-full border p-2"
          value={hijriYear}
          onChange={(e) => setHijriYear(e.target.value)}
        />

        <input
          type="text"
          placeholder="Gregorian period (e.g. August / September 2026)"
          className="w-full border p-2"
          value={gregorianLabel}
          onChange={(e) => setGregorianLabel(e.target.value)}
        />

        <div>
          <label className="block mb-1 text-sm">Calendar Month Start</label>

          <input
            type="date"
            className="w-full border p-2"
            value={calendarDate}
            onChange={(e) => setCalendarDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Calendar Image</label>

          <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 cursor-pointer border border-gray-300 rounded">
            <span className="text-sm text-gray-700">
              {imageFile ? imageFile.name : "Choose Calendar Image"}
            </span>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Calendar"}
        </button>
      </form>
    </div>
  );
}
