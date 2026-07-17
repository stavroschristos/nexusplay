import LegalLayout from '@/components/legal/LegalLayout';

export default function CookiePolicy() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="July 17, 2026">
      <p>This policy explains how NexusPlay uses cookies and similar technologies during the early alpha.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">1. What are cookies</h2>
      <p>Cookies are small text files stored on your device. We use them to keep you signed in, remember your preferences, and understand how the product is used so we can improve it.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">2. Cookies we use</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Authentication cookies</strong> — keep you logged in and secure your session. These are required and cannot be disabled.</li>
        <li><strong>Preference cookies</strong> — remember choices like theme, dismissed announcements, and feed filters.</li>
        <li><strong>Analytics cookies</strong> — aggregated, anonymized usage data that helps us fix bugs and prioritize features during alpha.</li>
      </ul>

      <h2 className="text-lg font-semibold text-foreground mt-6">3. What we don't do</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>We do not use cookies to sell your data or build advertising profiles.</li>
        <li>We do not share cookie data with third-party ad networks.</li>
        <li>Cookies never contain your password or private account credentials.</li>
      </ul>

      <h2 className="text-lg font-semibold text-foreground mt-6">4. Managing cookies</h2>
      <p>You can clear or block cookies in your browser settings. Disabling authentication cookies will sign you out and prevent login; other cookies can be removed without losing your account.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">5. Local storage</h2>
      <p>Some preferences are stored in your browser's local storage rather than cookies. This includes onboarding progress and UI state. Clearing your browser data removes these.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">6. Changes</h2>
      <p>We may update this policy as the product evolves. Material changes will be announced in-app.</p>

      <p className="text-muted-foreground italic">This document is a placeholder and will be finalized before launch.</p>
    </LegalLayout>
  );
}