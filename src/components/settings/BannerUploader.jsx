import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, Trash2, ImageIcon } from 'lucide-react';
import { validateImageFile, uploadProfileImage, IMAGE_ACCEPT } from '@/lib/image-upload';

export default function BannerUploader({ value, onChange, themeBanner }) {
  const inputRef = useRef(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    const err = validateImageFile(file);
    if (err) { toast({ title: err, variant: 'destructive' }); return; }
    setUploading(true);
    try {
      const url = await uploadProfileImage(file, 'banner');
      onChange(url);
      toast({ title: 'Banner updated — save to confirm' });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative h-28 rounded-xl overflow-hidden border border-border group">
        {value ? (
          <img src={value} alt="Banner preview" className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${themeBanner || 'from-primary/30 to-accent'} flex items-center justify-center`}>
            <ImageIcon className="w-8 h-8 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading} className="rounded-full">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {value ? 'Replace' : 'Upload'}
          </Button>
          {value && (
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange('')} disabled={uploading} className="rounded-full text-white hover:text-white hover:bg-white/20">
              <Trash2 className="w-4 h-4" /> Remove
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Wide image recommended (1600×480) · JPG, PNG, or WEBP · max 8MB</p>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}