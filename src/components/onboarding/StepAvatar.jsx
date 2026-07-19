import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { uploadProfileImage, IMAGE_ACCEPT, validateImageFile } from '@/lib/image-upload';

export default function StepAvatar({ value, onUpload }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    setBusy(true); setError('');
    try {
      const url = await uploadProfileImage(file, 'avatar');
      onUpload(url);
    } catch {
      setError('Upload failed — try again');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-2 text-center">
      <p className="text-sm text-muted-foreground mb-5">Add a profile picture so friends recognize you.</p>
      <label className="relative inline-block cursor-pointer">
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary/40 bg-secondary/40 grid place-items-center mx-auto">
          {value ? (
            <img src={value} alt="avatar" className="w-full h-full object-cover" />
          ) : busy ? (
            <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
          ) : (
            <Camera className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <input type="file" accept={IMAGE_ACCEPT} onChange={handle} className="hidden" />
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full shadow">
          {value ? 'Change' : 'Upload'}
        </span>
      </label>
      {error && <p className="text-xs text-destructive mt-4">{error}</p>}
      <p className="text-xs text-muted-foreground mt-6">Optional — you can skip and add it later.</p>
    </div>
  );
}