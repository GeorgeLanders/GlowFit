import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export async function takePhoto(): Promise<string | null> {
  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    return image.dataUrl || null;
  } catch {
    return null;
  }
}

export async function pickPhoto(): Promise<string | null> {
  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });
    return image.dataUrl || null;
  } catch {
    return null;
  }
}
