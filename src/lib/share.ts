import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';

export async function shareText(text: string, title?: string) {
  try {
    await Share.share({ title: title || 'GlowFit', text });
  } catch {
    await Clipboard.write({ string: text });
  }
}

export async function shareImage(dataUrl: string, title?: string) {
  try {
    await Share.share({
      title: title || 'GlowFit Progress',
      files: [dataUrl],
    });
  } catch {
    await Clipboard.write({ string: 'Check out my GlowFit progress!' });
  }
}
