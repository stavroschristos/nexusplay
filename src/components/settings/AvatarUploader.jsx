import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, Trash2, Camera } from 'lucide-react';
import { validateImageFile, uploadProfileImage, IMAGE_ACCEPT } from '@/lib/image-upload';
import { cn } from '@/lib/utils';

export default function AvatarUploader({ value, onChange, displayName }) {
  const inputRef = useRef(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const initials = (displayName || 'G').charAt(0).toUpperCase();

  const handleFile = async (file) => {
    const err = validateImageFile(file);
    if (err) { toast({ title: err, variant: 'destructive' }); return; }
    setUploading(true);
    try {
      const url = await uploadProfileImage(file, 'avatar');
      onChange(url);
      toast({ title: 'Avatar updated — save to confirm' });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <Avatar className="w-20 h-20 ring-2 ring-primary/30">
          <AvatarImage src={value} />
          <AvatarFallback className="bg-gradient-to-br from-primary/40 to-accent text-primary-foreground text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          aria-label="Change avatar"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading} className="rounded-full">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {value ? 'Replace' : 'Upload'}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')} disabled={uploading} className="rounded-full text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" /> Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP · max 8MB · square recommended</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}