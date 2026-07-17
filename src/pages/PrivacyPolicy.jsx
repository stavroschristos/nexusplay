import LegalLayout from '@/components/legal/LegalLayout';

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="July 17, 2026">
      <p>NexusPlay is built on a simple principle: <strong>users control what they share</strong>. Your public gaming identity is exciting and customizable; your private account information always remains private by default.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">1. Information we collect</h2>
      <p><strong>Public profile data</strong> you choose to share: display name, gamer tag, avatar, banner, bio, favorite games, achievements, gaming setup, posts, and community activity.</p>
      <p><strong>Private account data</strong> we store but never display publicly: email address, authentication credentials, login/session information, and account recovery details.</p>
      <p><strong>Automatic data</strong>: device type, browser, operating system, and session identifiers collected when you submit feedback or use features, used only to improve the product.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">2. Your email address</h2>
      <p>Your email is private. It is never shown on profiles, under usernames, in search results, in communities, in posts or comments, on leaderboards, or in discovery features. Only you and authorized administrators (when necessary) can see it.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">3. Privacy controls</h2>
      <p>You can set each of the following to Public, Friends only, or Private in Settings → Privacy: profile information, gaming activity, achievement history, trophy showcase, game library, playtime statistics, friends list, communities joined, current game status, and streaming status.</p>
      <p>You also control who can start a direct message with you: everyone, friends only, or no one.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">4. Blocking</h2>
      <p>You can block any user from their profile. Blocked users cannot message you, follow you, or interact with your content.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">5. Data protection</h2>
      <p>Authentication is handled by the platform's secure backend. Passwords are never stored in plain text. Sensitive data is protected through row-level access controls that prevent one user from accessing another's private records.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">6. Your rights</h2>
      <p>You can view your account information, edit your profile, download a copy of your data, remove connected gaming accounts, and delete your account at any time from Settings → Account.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">7. Admin access</h2>
      <p>Authorized administrators may access private information only when necessary for moderation, support, or legal compliance. All admin actions are logged in an audit trail.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">8. Changes</h2>
      <p>We may update this policy. Material changes will be announced in-app. Continued use after changes constitutes acceptance.</p>

      <p className="text-muted-foreground italic">This document is a placeholder and will be finalized before launch.</p>
    </LegalLayout>
  );
}