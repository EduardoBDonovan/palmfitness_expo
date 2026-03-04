import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import * as ImageManipulator from 'expo-image-manipulator';

export const StorageService = {
  async uploadPostMedia(uri: string, userId: string, postId: string): Promise<string> {
    const bucket = 'post-media';
    const fileName = `${Date.now()}.jpg`;
    const filePath = `${userId}/${postId}/${fileName}`;

    // 1. Resize/Compress Image
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    if (!manipulatedImage.base64) {
      throw new Error('Failed to get base64 from manipulated image');
    }

    // 2. Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, decode(manipulatedImage.base64), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async uploadProfilePicture(uri: string, userId: string): Promise<string> {
    const bucket = 'profile-pictures';
    const fileName = `avatar_${Date.now()}.jpg`;
    const filePath = `${userId}/${fileName}`;

    // 1. Resize/Compress Image
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 400, height: 400 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    if (!manipulatedImage.base64) {
      throw new Error('Failed to get base64 from manipulated image');
    }

    // 2. Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, decode(manipulatedImage.base64), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async downloadImage(bucket: string, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;

    const fr = new FileReader();
    return new Promise((resolve, reject) => {
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => reject(fr.error);
      fr.readAsDataURL(data);
    });
  }
};
