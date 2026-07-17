import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import GoogleIcon from '@/components/GoogleIcon';
import AppleIcon from '@/components/auth/AppleIcon';
import DiscordIcon from '@/components/auth/DiscordIcon';
import { base44 } from '@/api/base44Client';

// Shared OAuth row for the auth screens. Google + Apple are wired to the
// platform provider flow; Discord is shown as a polished "coming soon" button
// until the platform supports it.
export default function OAuthButtons({ redirectTo = '/' }) {
  const { toast } = useToast();

  const handleGoogle = () => base44.auth.loginWithProvider('google', redirectTo);
  const handleApple = () => base44.auth.loginWithProvider('apple', redirectTo);
  const handleDiscord = () =>
    toast({ title: 'Discord sign-in coming soon', description: 'We are working on it — hang tight!' });

  return (
    <div className="space-y-2.5 mb-6">
      <Button variant="outline" className="w-full h-12 text-sm font-medium bg-background/50" onClick={handleGoogle}>
        <GoogleIcon className="w-5 h-5 mr-2" /> Continue with Google
      </Button>
      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="outline" className="h-12 text-sm font-medium bg-background/50" onClick={handleApple}>
          <AppleIcon className="w-4 h-4 mr-2" /> Apple
        </Button>
        <Button variant="outline" className="h-12 text-sm font-medium bg-background/50" onClick={handleDiscord}>
          <DiscordIcon className="w-4 h-4 mr-2" /> Discord
        </Button>
      </div>
    </div>
  );
}