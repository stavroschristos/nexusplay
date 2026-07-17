import LegalLayout from '@/components/legal/LegalLayout';

export default function DataUsage() {
  return (
    <LegalLayout title="Data Usage Disclosure" lastUpdated="July 17, 2026">
      <p>This disclosure explains how your data is used inside NexusPlay.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">What we use your data for</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Building your public gaming identity and profile.</li>
        <li>Powering discovery and compatibility matching (using only your public gaming preferences).</li>
        <li>Showing activity feeds, achievements, and leaderboards.</li>
        <li>Sending notifications about follows, messages, and challenges.</li>
        <li>Aggregated, anonymized analytics to improve the product.</li>
      </ul>

      <h2 className="text-lg font-semibold text-foreground mt-6">What we never do</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Display your email address publicly or to other users.</li>
        <li>Allow searching for users by email or private identifiers.</li>
        <li>Sell your personal data.</li>
      </ul>

      <h2 className="text-lg font-semibold text-foreground mt-6">Data you control</h2>
      <p>Privacy settings let you restrict each part of your profile to Public, Friends only, or Private. You can download your data or delete your account at any time.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Feedback data</h2>
      <p>When you submit feedback, we collect technical context (page, browser, device, OS) so we can reproduce and fix issues. This is visible only to you and authorized administrators.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Admin audit</h2>
      <p>Administrative actions that affect user data or content are recorded in an audit log accessible to admins for accountability.</p>

      <p className="text-muted-foreground italic">This disclosure is a placeholder and will be finalized before launch.</p>
    </LegalLayout>
  );
}