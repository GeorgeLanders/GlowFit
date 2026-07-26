// Privacy-friendly analytics — local only, no external services
// Tracks feature usage for product decisions

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, string | number>;
  timestamp: number;
}

const STORAGE_KEY = 'glowfit-analytics';
const MAX_EVENTS = 500;

function getEvents(): AnalyticsEvent[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function track(event: string, properties?: Record<string, string | number>) {
  const events = getEvents();
  events.push({ event, properties, timestamp: Date.now() });

  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function getAnalytics(): {
  totalEvents: number;
  topEvents: { event: string; count: number }[];
  activeDays: number;
} {
  const events = getEvents();
  const counts: Record<string, number> = {};
  const days = new Set<string>();

  events.forEach(e => {
    counts[e.event] = (counts[e.event] || 0) + 1;
    days.add(new Date(e.timestamp).toDateString());
  });

  return {
    totalEvents: events.length,
    topEvents: Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([event, count]) => ({ event, count })),
    activeDays: days.size,
  };
}

export function clearAnalytics() {
  localStorage.removeItem(STORAGE_KEY);
}
