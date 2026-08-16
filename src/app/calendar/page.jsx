import { adminDB } from "@/lib/firebaseAdmin";
import CalendarView from "@/components/CalendarView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;

  const calendarId = params?.calendar || null;
  const eventId = params?.event || null;

  let title = "Islamic Calendar - Al Ansar Weekly";
  let description = "Islamic (Hijri) Calendar with Gregorian Dates";
  let image = null;

  if (calendarId) {
    const calendarDoc = await adminDB
      .collection("calendar_issues")
      .doc(calendarId)
      .get();

    if (!calendarDoc.exists || calendarDoc.data().status !== "published") {
      return {
        title,
        description,
      };
    }

    const calendar = calendarDoc.data();

    image = calendar.imageUrl || null;

    title = `${calendar.hijriMonth} ${calendar.hijriYear} - Al Ansar Weekly`;

    description =
      calendar.gregorianLabel ||
      "Islamic (Hijri) Calendar with Gregorian Dates";

    if (eventId && Array.isArray(calendar.events)) {
      const event = calendar.events.find((item) => item.id === eventId);

      if (event) {
        title = `${event.title} - Al Ansar Weekly`;

        const details = [
          event.date,
          event.time && `Time: ${event.time}`,
          event.location && `Location: ${event.location}`,
        ].filter(Boolean);

        description = details.join(" • ");
      }
    }
  }

  return {
    title,
    description,

    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

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
