import { Link } from 'react-router-dom';
import LegalLayout from '@/components/legal/LegalLayout';

export default function CommunityGuidelines() {
  return (
    <LegalLayout title="Community Guidelines" lastUpdated="July 17, 2026">
      <p>NexusPlay is a home for gamers. These guidelines help keep it welcoming and safe for everyone. By using NexusPlay you agree to follow them.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Harassment</h2>
      <p>Do not target, threaten, bully, or repeatedly bother another user. Targeted attacks, dogpiling, and encouraging others to harass someone are not allowed. If someone asks you to stop contacting them, respect that.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Hate speech</h2>
      <p>Slurs, dehumanizing language, and attacks on people for their race, ethnicity, nationality, religion, gender, sexual orientation, disability, or age are prohibited. Dog-whistles and coded hate are treated the same as explicit hate speech.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Spam</h2>
      <p>No repetitive posting, unsolicited mass messaging, link-farming, or artificially inflating likes, follows, or votes. Do not coordinate to flood a feed or community with the same content.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Impersonation</h2>
      <p>Do not pretend to be another person, another gamer, or a NexusPlay staff member. Claiming achievements, accounts, or rankings you did not earn is also impersonation. Keep your display name and gamer tag clearly distinct from well-known figures when you are not them.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Copyright violations</h2>
      <p>Do not post content you do not have the right to share, including pirated games, leaked assets, ripped artwork, or copyrighted streams. If you believe your work was posted without permission, report it and contact us.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">NSFW content</h2>
      <p>Sexually explicit, graphically violent, or otherwise not-safe-for-work content is not permitted in posts, profiles, communities, or messages. Mark spoilers where relevant, but spoiler tags are not a license to post NSFW.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Cheating & exploits</h2>
      <p>Promoting or selling cheats, hacks, mods that violate a game's terms, or platform exploits is prohibited. Do not coordinate boosting, account selling, or anything that undermines fair play. Sharing achievement-farming exploits is treated the same as cheating.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Abusive behavior</h2>
      <p>Abuse covers anything meant to harm the community that the other rules do not capture: doxxing, swatting, sharing private information, malicious mass-reporting, and coordinating attacks on people or communities. If it is designed to hurt someone or the platform, it is not allowed.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Reporting violations</h2>
      <p>If you see content that breaks these guidelines, report it. You can report a <strong>post</strong> from its menu, a <strong>profile</strong> from the profile page, a <strong>community</strong> from its page, and a <strong>direct message conversation</strong> from the chat options. You can also block any user from their profile to stop them from messaging or interacting with you.</p>
      <p>Reports go to our moderators with the reported item and its context. You can track your own reports from Settings. We review reports in priority order and take action including warnings, content removal, temporary suspension, and permanent bans.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Consequences</h2>
      <p>Violations may result in content removal, temporary suspension, or a permanent ban. Admin actions are recorded in an audit trail for accountability. During early alpha, enforcement may be lighter and focused on education, but serious violations will still result in immediate removal.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">Questions</h2>
      <p>Unsure whether something is allowed? When in doubt, don't post it. Our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> apply alongside these guidelines.</p>

      <p className="text-muted-foreground italic">These guidelines are a placeholder for the alpha and will be finalized before launch.</p>
    </LegalLayout>
  );
}