import { base44 } from '@/api/base44Client';

// Returns the current registration mode ('public' | 'invite_only' | 'waitlist').
// AdminSettings.read is open (public) so anonymous visitors can read it.
// Defaults to 'public' if unavailable.
export async function getRegistrationMode() {
  try {
    const list = await base44.entities.AdminSettings.list('-created_date', 1);
    return list?.[0]?.registration_mode || 'public';
  } catch {
    return 'public';
  }
}