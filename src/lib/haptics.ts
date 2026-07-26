import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const haptics = {
  light: () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}),
  medium: () => Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}),
  heavy: () => Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {}),
  success: () => Haptics.notification({ type: NotificationType.Success }).catch(() => {}),
  warning: () => Haptics.notification({ type: NotificationType.Warning }).catch(() => {}),
  error: () => Haptics.notification({ type: NotificationType.Error }).catch(() => {}),
  selection: () => Haptics.selectionStart().catch(() => {}),
};
