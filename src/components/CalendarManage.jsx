"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app, db } from "@/lib/firebaseClient";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import toast from "react-hot-toast";

export default function CalendarManage() {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  const fetchCalendars = async () => {
    try {
      const q = query(
        collection(db, "calendar_issues"),
        orderBy("calendarDate", "desc"),
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCalendars(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load calendars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  const toggleCalendar = (id) => {
    setExpandedId((current) => (current === id ? null : id));
    setShowEventForm(false);
    setEditingEventId(null);
    resetEventForm();
  };

  const deleteCalendar = async (calendar) => {
    const confirmed = window.confirm(
      `Delete ${calendar.hijriMonth} ${calendar.hijriYear}?\n\nThis will permanently delete the calendar and its uploaded image.`,
    );

    if (!confirmed) return;

    try {
      const auth = getAuth(app);
      const user = auth.currentUser;

      if (!user) {
        toast.error("You are not logged in.");
        return;
      }

      const idToken = await user.getIdToken();

      const res = await fetch("/api/calendar/delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calendarId: calendar.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Calendar deletion failed.");
      }

      setCalendars((current) =>
        current.filter((item) => item.id !== calendar.id),
      );

      if (expandedId === calendar.id) {
        setExpandedId(null);
      }

      toast.success("Calendar deleted.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Calendar deletion failed.");
    }
  };

  const toggleCalendarStatus = async (calendar) => {
    try {
      const newStatus = calendar.status === "published" ? "draft" : "published";

      await updateDoc(doc(db, "calendar_issues", calendar.id), {
        status: newStatus,
      });

      setCalendars((current) =>
        current.map((item) =>
          item.id === calendar.id ? { ...item, status: newStatus } : item,
        ),
      );

      toast.success(
        newStatus === "published"
          ? "Calendar published."
          : "Calendar moved to draft.",
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update calendar status.");
    }
  };

  const resetEventForm = () => {
    setEventTitle("");
    setEventDate("");
    setEventTime("");
    setEventLocation("");
  };

  const startAddEvent = () => {
    resetEventForm();
    setEditingEventId(null);
    setShowEventForm(true);
  };

  const startEditEvent = (event) => {
    setEditingEventId(event.id);
    setEventTitle(event.title || "");
    setEventDate(event.date || "");
    setEventTime(event.time || "");
    setEventLocation(event.location || "");
    setShowEventForm(true);
  };

  const cancelEventForm = () => {
    setShowEventForm(false);
    setEditingEventId(null);
    resetEventForm();
  };

  const saveEvent = async (calendar) => {
    if (!eventTitle.trim() || !eventDate) {
      toast.error("Event title and date are required.");
      return;
    }

    try {
      setSaving(true);

      const existingEvents = Array.isArray(calendar.events)
        ? calendar.events
        : [];

      let updatedEvents;

      if (editingEventId) {
        updatedEvents = existingEvents.map((event) =>
          event.id === editingEventId
            ? {
                ...event,
                title: eventTitle.trim(),
                date: eventDate,
                time: eventTime.trim(),
                location: eventLocation.trim(),
              }
            : event,
        );
      } else {
        const newEvent = {
          id: crypto.randomUUID(),
          title: eventTitle.trim(),
          date: eventDate,
          time: eventTime.trim(),
          location: eventLocation.trim(),
        };

        updatedEvents = [...existingEvents, newEvent];
      }

      await updateDoc(doc(db, "calendar_issues", calendar.id), {
        events: updatedEvents,
      });

      setCalendars((current) =>
        current.map((item) =>
          item.id === calendar.id ? { ...item, events: updatedEvents } : item,
        ),
      );

      toast.success(editingEventId ? "Event updated" : "Event added");

      cancelEventForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (calendar, eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?",
    );

    if (!confirmed) return;

    try {
      const existingEvents = Array.isArray(calendar.events)
        ? calendar.events
        : [];

      const updatedEvents = existingEvents.filter(
        (event) => event.id !== eventId,
      );

      await updateDoc(doc(db, "calendar_issues", calendar.id), {
        events: updatedEvents,
      });

      setCalendars((current) =>
        current.map((item) =>
          item.id === calendar.id ? { ...item, events: updatedEvents } : item,
        ),
      );

      toast.success("Event deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete event");
    }
  };

  if (loading) {
    return <div>Loading calendars...</div>;
  }

  if (calendars.length === 0) {
    return <div className="text-gray-500">No calendars uploaded yet.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-6">Calendar Management</h1>

      {calendars.map((calendar) => {
        const isExpanded = expandedId === calendar.id;
        const events = Array.isArray(calendar.events) ? calendar.events : [];

        return (
          <div
            key={calendar.id}
            className="border rounded-lg bg-white shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-5">
              <button
                type="button"
                onClick={() => toggleCalendar(calendar.id)}
                className="flex-1 text-left"
              >
                <div className="font-semibold text-lg">
                  {calendar.hijriMonth} {calendar.hijriYear}
                </div>

                <div className="text-sm text-gray-500">
                  {calendar.gregorianLabel}
                </div>
              </button>

              <div className="flex items-center gap-3 ml-4">
                <button
                  type="button"
                  onClick={() => deleteCalendar(calendar)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>

                <button
                  type="button"
                  onClick={() => toggleCalendarStatus(calendar)}
                  className={`px-3 py-2 rounded text-white ${
                    calendar.status === "published"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {calendar.status === "published" ? "Unpublish" : "Publish"}
                </button>

                <button
                  type="button"
                  onClick={() => toggleCalendar(calendar.id)}
                  className="text-gray-500 text-xl"
                >
                  {isExpanded ? "−" : "+"}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t p-6">
                <img
                  src={calendar.imageUrl}
                  alt={`${calendar.hijriMonth} ${calendar.hijriYear}`}
                  className="max-w-md w-full mx-auto border rounded"
                />

                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Upcoming Events</h2>

                    {!showEventForm && (
                      <button
                        type="button"
                        onClick={startAddEvent}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                      >
                        + Add Event
                      </button>
                    )}
                  </div>

                  {showEventForm && (
                    <div className="border rounded-lg p-4 mb-6 bg-gray-50">
                      <h3 className="font-semibold mb-4">
                        {editingEventId ? "Edit Event" : "Add Event"}
                      </h3>

                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Event title"
                          value={eventTitle}
                          onChange={(e) => setEventTitle(e.target.value)}
                          className="w-full border p-2 rounded"
                        />

                        <input
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full border p-2 rounded"
                        />

                        <input
                          type="text"
                          placeholder="Time (optional)"
                          value={eventTime}
                          onChange={(e) => setEventTime(e.target.value)}
                          className="w-full border p-2 rounded"
                        />

                        <input
                          type="text"
                          placeholder="Location (optional)"
                          value={eventLocation}
                          onChange={(e) => setEventLocation(e.target.value)}
                          className="w-full border p-2 rounded"
                        />

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveEvent(calendar)}
                            disabled={saving}
                            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                          >
                            {saving ? "Saving..." : "Save Event"}
                          </button>

                          <button
                            type="button"
                            onClick={cancelEventForm}
                            disabled={saving}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {events.length === 0 ? (
                    <p className="text-gray-500">No upcoming events added.</p>
                  ) : (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div key={event.id} className="border rounded-lg p-4">
                          <div className="flex justify-between gap-4">
                            <div>
                              <div className="font-semibold">{event.title}</div>

                              <div className="text-sm text-gray-600 mt-1">
                                {event.date}
                                {event.time ? ` · ${event.time}` : ""}
                              </div>

                              {event.location && (
                                <div className="text-sm text-gray-500">
                                  {event.location}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditEvent(event)}
                                className="px-3 py-1 bg-gray-700 text-white rounded"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteEvent(calendar, event.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
