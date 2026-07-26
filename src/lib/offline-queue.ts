// Offline write queue — stores actions when offline, syncs when back online

interface QueuedAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  retries: number;
}

const QUEUE_KEY = 'glowfit-offline-queue';
const MAX_RETRIES = 3;

function getQueue(): QueuedAction[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedAction[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueue(action: { type: string; payload: unknown }) {
  const queue = getQueue();
  queue.push({
    id: crypto.randomUUID(),
    ...action,
    timestamp: Date.now(),
    retries: 0,
  });
  saveQueue(queue);
}

export function getPendingCount(): number {
  return getQueue().length;
}

export function clearQueue() {
  localStorage.setItem(QUEUE_KEY, '[]');
}

export async function processQueue(handler: (action: QueuedAction) => Promise<boolean>) {
  const queue = getQueue();
  const remaining: QueuedAction[] = [];

  for (const action of queue) {
    try {
      const success = await handler(action);
      if (!success && action.retries < MAX_RETRIES) {
        remaining.push({ ...action, retries: action.retries + 1 });
      }
    } catch {
      if (action.retries < MAX_RETRIES) {
        remaining.push({ ...action, retries: action.retries + 1 });
      }
    }
  }

  saveQueue(remaining);
  return remaining.length;
}

export function onOnlineStatusChange(callback: (online: boolean) => void) {
  const handler = () => callback(navigator.onLine);
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  return () => {
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
  };
}
