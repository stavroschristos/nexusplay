import LegalLayout from '@/components/legal/LegalLayout';
import { Shield, KeyRound, Link2, Lock, Database, HelpCircle } from 'lucide-react';

export default function Security() {
  return (
    <LegalLayout title="Security" lastUpdated="July 18, 2026">
      <p>At NexusPlay, your gaming identity and connected accounts are treated with the same care as your most sensitive personal data. This page explains how we keep your account safe and how third‑party gaming connections work.</p>

      <div className="flex items-center gap-2 mt-6"><Shield className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold text-foreground m-0">Account security</h2></div>
      <p>Authentication — registration, login, logout, password reset, and session management — is handled by NexusPlay's secure backend. Passwords are never stored in plain text and are never visible to anyone, including our team. Sessions are protected with signed tokens and invalidated on logout.</p>
      <p>Account recovery uses email‑based, time‑limited reset links. Reset requests always show a generic success message so that the existence of an account cannot be inferred by others.</p>
      <p>You can delete your account at any time from Settings → Account. Deletion clears your profile, posts, connected accounts, and blocks, and signs you out immediately.</p>

      <div className="flex items-center gap-2 mt-6"><KeyRound className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold text-foreground m-0">Password protection</h2></div>
      <p>Choose a strong, unique password. We never ask for your password outside of the official login and password‑reset screens, and we will never email you asking for it. If you suspect your password is compromised, use “Forgot password” to reset it immediately.</p>

      <div className="flex items-center gap-2 mt-6"><Link2 className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold text-foreground m-0">Third‑party account connections</h2></div>
      <p>You can showcase your handles from Steam, PlayStation, Xbox, Nintendo, Epic Games, Riot, and Battle.net on your profile. Here is how those connections work:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Manual handles</strong> let you display your public username and level. You are never asked for a platform password — only the public handle you choose to share.</li>
        <li><strong>Official connections</strong> (where available) use the platform's own OAuth login flow. You authenticate directly with the platform, and NexusPlay receives only the permissions you approve.</li>
        <li>We <strong>never store third‑party passwords</strong>. OAuth connections give us a temporary access token, not your credentials.</li>
        <li>We request only the <strong>minimum permissions</strong> needed — typically your public profile, game library, and achievements.</li>
        <li>You can <strong>disconnect any account at any time</strong> from Settings → Connected Accounts. Disconnecting revokes our access and removes the link from your profile.</li>
      </ul>
      <p className="text-sm text-muted-foreground">Some official platform connections are shown as “Coming Soon”. Those buttons are disabled until the secure OAuth integration is live, so you can never accidentally enter credentials into an unfinished system.</p>

      <div className="flex items-center gap-2 mt-6"><Database className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold text-foreground m-0">Data handling</h2></div>
      <p>Profile images and banners are uploaded through our file storage and stored as references, never embedded inside your user record. Public profile data (display name, gamer tag, avatar, banner, bio, favorites) is visible according to the privacy level you choose. Private account data (email, credentials, session info) is never exposed on profiles, in search, in communities, in posts, on leaderboards, or in discovery.</p>

      <div className="flex items-center gap-2 mt-6"><Lock className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold text-foreground m-0">Privacy practices & encryption</h2></div>
      <p>Row‑level access controls prevent one user from reading or modifying another user's private records. Public profile lookups are routed through a server‑side function that strips sensitive built‑in fields (such as email and full name) before any data reaches your browser. Administrators can access private information only when required for moderation or support, and every sensitive admin action is recorded in an audit log.</p>

      <div className="flex items-center gap-2 mt-6"><HelpCircle className="w-5 h-5 text-primary" /><h2 className="text-lg font-semibold text-foreground m-0">Frequently asked questions</h2></div>
      <p><strong>Do you store my Steam/PlayStation/Xbox password?</strong> No. Never. Manual connections only store the public handle you type in; official connections use OAuth tokens, not passwords.</p>
      <p><strong>Can other users see my email?</strong> No. Your email is private and is used only for login, recovery, and the notifications you opt into.</p>
      <p><strong>What happens when I disconnect an account?</strong> The link is removed from your profile and our access token is discarded. The account is no longer shown as connected.</p>
      <p><strong>How do I know a connection is official?</strong> Official OAuth connections show a verified shield icon. Manual handles are labeled “Manual” so the difference is always clear.</p>

      <p className="text-muted-foreground italic">Have a security concern? Reach out through the in‑app feedback widget or contact NexusPlay support.</p>
    </LegalLayout>
  );
}