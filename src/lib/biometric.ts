import { BiometricAuth, BiometryType } from '@aparajita/capacitor-biometric-auth';

export const biometric = {
  async check(): Promise<{ available: boolean; strong: boolean; type: string }> {
    try {
      const result = await BiometricAuth.checkBiometry();
      const typeMap: Record<number, string> = {
        [BiometryType.touchId]: 'Touch ID',
        [BiometryType.faceId]: 'Face ID',
        [BiometryType.fingerprintAuthentication]: 'Fingerprint',
        [BiometryType.faceAuthentication]: 'Face',
        [BiometryType.irisAuthentication]: 'Iris',
      };
      return {
        available: result.isAvailable,
        strong: result.strongBiometryIsAvailable,
        type: typeMap[result.biometryType] || 'Biometric',
      };
    } catch {
      return { available: false, strong: false, type: 'None' };
    }
  },

  async authenticate(reason: string): Promise<boolean> {
    try {
      await BiometricAuth.authenticate({ reason, cancelTitle: 'Cancel' });
      return true;
    } catch {
      return false;
    }
  },
};
