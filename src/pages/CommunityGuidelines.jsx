import LegalLayout from '@/components/legal/LegalLayout';

export default function CommunityGuidelines() {
  return (
    <LegalLayout title="Community Guidelines" lastUpdated="July 17, 2026">
      <p>NexusPlay is a home for gamers. These guidelines help keep it welcoming and safe for everyone.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Be welcoming</h2>
      <p>Celebrate different play styles, platforms, and skill levels. Harassment, hate speech, bullying, and threats are never allowed.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Be authentic</h2>
      <p>Represent yourself honestly. Don't impersonate others or claim achievements you didn't earn.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Respect privacy</h2>
      <p>Never share another person's private information, including email addresses or account details. Use blocking and reporting tools if someone makes you uncomfortable.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Keep it clean</h2>
      <p>No spam, scams, NSFW content, cheating, or illegal activity. Tag spoilers appropriately.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Reporting</h2>
      <p>Use the report option on posts, messages, communities, or profiles to flag violations. Our moderators review reports and take action including warnings, suspensions, and bans.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Consequences</h2>
      <p>Violations may result in content removal, temporary suspension, or permanent ban. Admin actions are logged for accountability.</p>

      <p className="text-muted-foreground italic">These guidelines are a placeholder and will be finalized before launch.</p>
    </LegalLayout>
  );
}