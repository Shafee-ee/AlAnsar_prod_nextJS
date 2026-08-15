import { adminDB } from "@/lib/firebaseAdmin";
import CalendarView from "@/components/CalendarView";

export const dynamic = "force-dynamic";

export default async function CalendarPage({ searchParams }) {
  const snapshot = await adminDB
    .collection("calendar_issues")
    .where("status", "==", "published")
    .get();

  const calendars = snapshot.docs
    .map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        hijriMonth: data.hijriMonth || "",
        hijriYear: data.hijriYear || "",
        gregorianLabel: data.gregorianLabel || "",
        imageUrl: data.imageUrl || "",
        calendarDate: data.calendarDate
          ? data.calendarDate.toDate().toISOString()
          : null,
        events: Array.isArray(data.events) ? data.events : [],
      };
    })
    .sort((a, b) => new Date(b.calendarDate) - new Date(a.calendarDate));

  const params = await searchParams;
  const selectedCalendarId = params?.calendar || null;
  const selectedEventId = params?.event || null;
  return (
    <CalendarView
      calendars={calendars}
      initialCalendarId={selectedCalendarId}
      initialEventId={selectedEventId}
    />
  );
}
