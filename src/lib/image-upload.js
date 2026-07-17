import { base44 } from '@/api/base44Client';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB raw input before compression

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

export function validateImageFile(file) {
  if (!file) return 'No file selected';
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Only JPG, PNG, or WEBP are supported';
  if (file.size > MAX_FILE_SIZE) return 'Image is too large (max 8MB)';
  return null;
}

export function compressImage(file, { maxWidth = 512, maxHeight = 512, quality = 0.85, outputType = 'image/webp' } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
          outputType,
          quality
        );
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export async function uploadProfileImage(file, kind = 'avatar') {
  const opts = kind === 'banner'
    ? { maxWidth: 1600, maxHeight: 480, quality: 0.82, outputType: 'image/webp' }
    : { maxWidth: 512, maxHeight: 512, quality: 0.85, outputType: 'image/webp' };
  const blob = await compressImage(file, opts);
  const compressed = new File([blob], `${kind}.webp`, { type: 'image/webp' });
  const res = await base44.integrations.Core.UploadFile({ file: compressed });
  return res.file_url;
}