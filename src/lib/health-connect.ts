import { Health } from '@capgo/capacitor-health';

const READ_TYPES = ['steps', 'heartRate', 'sleep'] as const;

export interface HealthSyncSummary {
  steps: number;
  avgHeartRate: number | null;
  sleepMinutes: number | null;
  syncedAt: number;
}

export async function isHealthSupported(): Promise<{ available: boolean; reason?: string }> {
  try {
    const res = await Health.isAvailable();
    return { available: res.available, reason: res.reason };
  } catch {
    return { available: false, reason: 'Health services not available on this device' };
  }
}

export async function requestHealthAccess(): Promise<{ granted: string[]; denied: string[] }> {
  const status = await Health.requestAuthorization({ read: [...READ_TYPES] });
  return { granted: status.readAuthorized ?? [], denied: status.readDenied ?? [] };
}

export async function checkHealthAccess(): Promise<{ granted: string[]; denied: string[] }> {
  const status = await Health.checkAuthorization({ read: [...READ_TYPES] });
  return { granted: status.readAuthorized ?? [], denied: status.readDenied ?? [] };
}

export async function syncTodayHealth(): Promise<HealthSyncSummary> {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const dayStart = midnight.toISOString();
  const dayEnd = now.toISOString();

  const stepsRes = await Health.queryAggregated({
    dataType: 'steps',
    startDate: dayStart,
    endDate: dayEnd,
    bucket: 'day',
    aggregation: 'sum',
  });
  const steps = Math.round(stepsRes.samples[0]?.value ?? 0);

  const hrRes = await Health.queryAggregated({
    dataType: 'heartRate',
    startDate: dayStart,
    endDate: dayEnd,
    bucket: 'day',
    aggregation: 'average',
  });
  const avgHeartRate = hrRes.samples[0] != null ? Math.round(hrRes.samples[0].value) : null;

  const yesterday = new Date(now.getTime() - 24 * 3600e3);
  const sleepRes = await Health.readSamples({
    dataType: 'sleep',
    startDate: yesterday.toISOString(),
    endDate: dayEnd,
    limit: 50,
  });
  const sleepy = new Set(['asleep', 'rem', 'deep', 'light']);
  let sleepMinutes: number | null = null;
  for (const s of sleepRes.samples) {
    if (s.sleepState != null && !sleepy.has(s.sleepState)) continue;
    const mins = (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / 60000;
    if (mins > 0) sleepMinutes = (sleepMinutes ?? 0) + mins;
  }

  return { steps, avgHeartRate, sleepMinutes: sleepMinutes != null ? Math.round(sleepMinutes) : null, syncedAt: Date.now() };
}

export function sleepTimesToday(syncedAt: number, sleepMinutes: number): { bedTime: string; wakeTime: string } {
  const wake = new Date(syncedAt);
  const bed = new Date(syncedAt - sleepMinutes * 60000);
  const fmt = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return { bedTime: fmt(bed), wakeTime: fmt(wake) };
}

export async function openHealthConnectSettings(): Promise<void> {
  await Health.openHealthConnectSettings().catch(() => {});
}
