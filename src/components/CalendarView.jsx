"use client";

import { useMemo, useState } from "react";
export default function CalendarView({
  calendars,
  initialCalendarId,
  initialEventId,
}) {
  const years = useMemo(() => {
    return [
      ...new Set(
        calendars
          .map((calendar) =>
            calendar.calendarDate
              ? new Date(calendar.calendarDate).getFullYear()
              : null,
          )
          .filter(Boolean),
      ),
    ].sort((a, b) => b - a);
  }, [calendars]);

  const [selectedYear, setSelectedYear] = useState(
    years[0] || new Date().getFullYear(),
  );

  const filteredCalendars = useMemo(() => {
    return calendars.filter((calendar) => {
      if (!calendar.calendarDate) return false;

      return (
        new Date(calendar.calendarDate).getFullYear() === Number(selectedYear)
      );
    });
  }, [calendars, selectedYear]);

  const [selectedId, setSelectedId] = useState(
    initialCalendarId || calendars[0]?.id || null,
  );

  const [selectedEventId, setSelectedEventId] = useState(
    initialEventId || null,
  );

  const handleShare = async () => {
    if (!selectedCalendar) return;

    const url = new URL(window.location.href);

    url.searchParams.set("calendar", selectedCalendar.id);

    const selectedEvent = events.find((event) => event.id === selectedEventId);

    if (selectedEvent) {
      url.searchParams.set("event", selectedEvent.id);
    } else {
      url.searchParams.delete("event");
    }

    const shareUrl = url.toString();

    const shareText = selectedEvent
      ? `${selectedEvent.title}\n${selectedEvent.date}\n\n${shareUrl}`
      : `${selectedCalendar.hijriMonth} ${selectedCalendar.hijriYear} Islamic Calendar\n\n${shareUrl}`;

    try {
      let imageFile = null;

      if (selectedCalendar.imageUrl) {
        const response = await fetch(selectedCalendar.imageUrl);
        const blob = await response.blob();

        const extension = blob.type.split("/")[1] || "jpg";

        imageFile = new File(
          [blob],
          `${selectedCalendar.hijriMonth}-${selectedCalendar.hijriYear}.${extension}`,
          {
            type: blob.type,
          },
        );
      }

      if (
        navigator.share &&
        imageFile &&
        navigator.canShare &&
        navigator.canShare({ files: [imageFile] })
      ) {
        await navigator.share({
          title: selectedEvent
            ? selectedEvent.title
            : `${selectedCalendar.hijriMonth} ${selectedCalendar.hijriYear} - Al Ansar Weekly`,
          text: shareText,
          files: [imageFile],
        });

        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: selectedEvent
            ? selectedEvent.title
            : `${selectedCalendar.hijriMonth} ${selectedCalendar.hijriYear} - Al Ansar Weekly`,
          text: shareText,
          url: shareUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(shareText);

      alert("Share link copied.");
    } catch (err) {
      if (err.name === "AbortError") return;

      console.error("Share failed:", err);

      try {
        await navigator.clipboard.writeText(shareText);
        alert("Share link copied.");
      } catch {
        alert("Unable to share.");
      }
    }
  };

  const selectedCalendar =
    filteredCalendars.find((calendar) => calendar.id === selectedId) ||
    filteredCalendars[0];

  const selectedIndex = filteredCalendars.findIndex(
    (calendar) => calendar.id === selectedCalendar?.id,
  );

  const previousCalendar =
    selectedIndex >= 0 ? filteredCalendars[selectedIndex + 1] : null;

  const nextCalendar =
    selectedIndex > 0 ? filteredCalendars[selectedIndex - 1] : null;

  const handleYearChange = (year) => {
    const numericYear = Number(year);

    setSelectedYear(numericYear);

    const firstCalendar = calendars.find((calendar) => {
      if (!calendar.calendarDate) return false;

      return new Date(calendar.calendarDate).getFullYear() === numericYear;
    });

    setSelectedId(firstCalendar?.id || null);
  };

  const goToCalendar = (calendar) => {
    if (!calendar) return;
    setSelectedId(calendar.id);
  };

  const goToToday = () => {
    const today = new Date();

    const currentCalendar = calendars.find((calendar) => {
      if (!calendar.calendarDate) return false;

      return new Date(calendar.calendarDate) <= today;
    });

    if (!currentCalendar) return;

    setSelectedYear(new Date(currentCalendar.calendarDate).getFullYear());

    setSelectedId(currentCalendar.id);
  };

  if (!calendars.length) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>

        <p className="mt-2 text-gray-500">
          No calendars are currently available.
        </p>
      </main>
    );
  }

  if (!selectedCalendar) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>

        <p className="mt-2 text-gray-500">
          No calendar available for {selectedYear}.
        </p>
      </main>
    );
  }

  const events = [...(selectedCalendar.events || [])].sort((a, b) =>
    String(a.date || "").localeCompare(String(b.date || "")),
  );

  const selectedEvent = events.find((event) => event.id === selectedEventId);
  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Page heading */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-7">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
                </svg>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Calendar
              </h1>
            </div>

            <p className="text-gray-500 mt-2 ml-0 sm:ml-14">
              Islamic (Hijri) Calendar with Gregorian Dates
            </p>
          </div>

          {/* Year selector */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="appearance-none w-full sm:w-32 bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-9 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Main calendar card */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Calendar title */}
          <div className="text-center px-5 pt-7 pb-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#145A96]">
              {selectedCalendar.hijriMonth} {selectedCalendar.hijriYear}
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
              <p className="text-gray-500">{selectedCalendar.gregorianLabel}</p>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="m8.6 13.5 6.8 3.9M15.4 6.6 8.6 10.5" />
                </svg>
                Share
              </button>
            </div>
          </div>

          {/* Calendar image */}
          <div className="px-4 sm:px-8 pb-7">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 sm:p-4">
              <img
                src={selectedCalendar.imageUrl}
                alt={`${selectedCalendar.hijriMonth} ${selectedCalendar.hijriYear}`}
                className="block w-full max-w-2xl mx-auto h-auto rounded-lg"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t border-gray-200 p-4 sm:p-5">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Previous */}
              <button
                type="button"
                disabled={!previousCalendar}
                onClick={() => goToCalendar(previousCalendar)}
                className="group border border-gray-300 rounded-xl px-2 sm:px-4 py-3 hover:border-blue-500 hover:bg-blue-50 disabled:hover:border-gray-300 disabled:hover:bg-white disabled:opacity-40 transition"
              >
                <span className="text-lg text-gray-500 group-hover:text-blue-600">
                  ←
                </span>

                <span className="block text-xs sm:text-sm font-semibold text-gray-700 mt-1">
                  Previous
                </span>

                <span className="block text-[10px] sm:text-xs text-gray-400 mt-1 truncate">
                  {previousCalendar
                    ? `${previousCalendar.hijriMonth} ${previousCalendar.hijriYear}`
                    : "Not available"}
                </span>
              </button>

              {/* Today */}
              <button
                type="button"
                onClick={goToToday}
                className="border border-gray-300 rounded-xl px-2 sm:px-4 py-3 hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <span className="text-sm font-semibold text-gray-700">
                  Today
                </span>

                <span className="block text-[10px] sm:text-xs text-gray-400 mt-1">
                  Current calendar
                </span>
              </button>

              {/* Next */}
              <button
                type="button"
                disabled={!nextCalendar}
                onClick={() => goToCalendar(nextCalendar)}
                className="group border border-gray-300 rounded-xl px-2 sm:px-4 py-3 hover:border-blue-500 hover:bg-blue-50 disabled:hover:border-gray-300 disabled:hover:bg-white disabled:opacity-40 transition"
              >
                <span className="text-lg text-gray-500 group-hover:text-blue-600">
                  →
                </span>

                <span className="block text-xs sm:text-sm font-semibold text-gray-700 mt-1">
                  Next
                </span>

                <span className="block text-[10px] sm:text-xs text-gray-400 mt-1 truncate">
                  {nextCalendar
                    ? `${nextCalendar.hijriMonth} ${nextCalendar.hijriYear}`
                    : "Not available"}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Upcoming events */}
        <section className="mt-7 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Upcoming this month
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Events and important dates
            </p>
          </div>

          {events.length === 0 ? (
            <div className="px-5 sm:px-6 py-8 text-center">
              <p className="text-gray-500">No upcoming events added.</p>
            </div>
          ) : (
            <div>
              {events.map((event, index) => {
                const eventDate = event.date
                  ? new Date(`${event.date}T00:00:00`)
                  : null;

                return (
                  <div
                    key={event.id || index}
                    className={`px-5 sm:px-6 py-4 border-b last:border-b-0 transition ${
                      selectedEventId === event.id
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Event content */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEventId(event.id);

                          const url = new URL(window.location.href);
                          url.searchParams.set("calendar", selectedCalendar.id);
                          url.searchParams.set("event", event.id);

                          window.history.pushState({}, "", url);
                        }}
                        className="flex items-center gap-4 flex-1 min-w-0 text-left"
                      >
                        {/* Date */}
                        <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 border border-blue-200 rounded-xl flex flex-col items-center justify-center bg-blue-50">
                          {eventDate ? (
                            <>
                              <span className="text-lg sm:text-xl font-bold text-[#145A96] leading-none">
                                {eventDate.getDate()}
                              </span>

                              <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mt-1">
                                {eventDate.toLocaleDateString("en-IN", {
                                  month: "short",
                                })}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">Date</span>
                          )}
                        </div>

                        {/* Event information */}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {event.title}
                          </h3>

                          {event.time && (
                            <p className="text-sm text-gray-600 mt-0.5">
                              {event.time}
                            </p>
                          )}

                          {event.location && (
                            <p className="text-sm text-gray-500 mt-0.5">
                              {event.location}
                            </p>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {selectedEvent && (
          <section className="mt-5 bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#145A96]">
                    Event details
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    {selectedEvent.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEventId(null)}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Date
                  </p>
                  <p className="font-medium text-gray-800">
                    {selectedEvent.date}
                  </p>
                </div>

                {selectedEvent.time && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Time
                    </p>
                    <p className="font-medium text-gray-800">
                      {selectedEvent.time}
                    </p>
                  </div>
                )}

                {selectedEvent.location && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Location
                    </p>
                    <p className="font-medium text-gray-800">
                      {selectedEvent.location}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Moon sighting note */}
        <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 px-5 py-4 text-center">
          <p className="text-sm text-gray-600">
            Dates may vary based on moon sighting.
          </p>
        </div>
      </div>
    </main>
  );
}
