import { LocalNotifications } from '@capacitor/local-notifications';

export const notifications = {
  async requestPermission(): Promise<boolean> {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  },

  async scheduleMedReminder(title: string, body: string, date: Date, id: number) {
    await LocalNotifications.schedule({
      notifications: [{
        title,
        body,
        id,
        schedule: { at: date },
        smallIcon: 'ic_launcher',
        largeIcon: 'ic_launcher',
      }],
    }).catch(() => {});
  },

  async cancel(id: number) {
    await LocalNotifications.cancel({ notifications: [{ id }] }).catch(() => {});
  },

  async cancelAll() {
    await LocalNotifications.cancel({ notifications: [] }).catch(() => {});
  },
};
