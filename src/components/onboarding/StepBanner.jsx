import { useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { uploadProfileImage, IMAGE_ACCEPT, validateImageFile } from '@/lib/image-upload';

export default function StepBanner({ value, onUpload, onClear }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    setBusy(true); setError('');
    try {
      const url = await uploadProfileImage(file, 'banner');
      onUpload(url);
    } catch {
      setError('Upload failed — try again');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-2">
      <p className="text-sm text-muted-foreground mb-4">Choose a banner that sets the vibe for your profile.</p>
      <div className="relative rounded-2xl overflow-hidden border border-border bg-secondary/30 h-32 grid place-items-center">
        {value ? (
          <img src={value} alt="banner" className="absolute inset-0 w-full h-full object-cover" />
        ) : busy ? (
          <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
        ) : (
          <ImagePlus className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      <div className="flex gap-3 mt-3 justify-center">
        <label className="cursor-pointer text-sm text-primary hover:underline">
          {value ? 'Change banner' : 'Upload banner'}
          <input type="file" accept={IMAGE_ACCEPT} onChange={handle} className="hidden" />
        </label>
        {value && (
          <button onClick={onClear} className="text-sm text-muted-foreground hover:text-destructive">Remove</button>
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-2 text-center">{error}</p>}
      <p className="text-xs text-muted-foreground mt-4 text-center">Optional — skip for now and add it later.</p>
    </div>
  );
}