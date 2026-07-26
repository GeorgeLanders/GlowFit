// Biometric auth — stub for web, real on native
// Requires @aparajita/capacitor-biometric-auth on device (needs Java 21+)

declare global {
  interface Window {
    Capacitor?: { isNativePlatform?: () => boolean };
  }
}

export const biometric = {
  async check(): Promise<{ available: boolean; strong: boolean; type: string }> {
    if (typeof window !== 'undefined' && !window.Capacitor?.isNativePlatform?.()) {
      return { available: false, strong: false, type: 'Web (not supported)' };
    }
    return { available: false, strong: false, type: 'Not configured' };
  },

  async authenticate(_reason: string): Promise<boolean> {
    return false;
  },
};
