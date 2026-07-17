import LegalLayout from '@/components/legal/LegalLayout';

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="July 17, 2026">
      <p>By using NexusPlay, you agree to these terms.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">1. Your account</h2>
      <p>You are responsible for keeping your login credentials secure and for all activity under your account. You must be 13 or older (or meet your local age requirements) to use NexusPlay.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">2. Acceptable use</h2>
      <p>You agree not to harass others, share harmful or illegal content, impersonate people, scrape other users' data, attempt to access private account information, or circumvent privacy and security controls. Violations may result in suspension or removal.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">3. Content</h2>
      <p>You retain ownership of content you post. You grant NexusPlay a license to display it within the service. You can delete your content and account at any time.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">4. Privacy</h2>
      <p>Our handling of your data is described in our Privacy Policy. Email addresses and private account information are never displayed publicly.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">5. Third-party platforms</h2>
      <p>NexusPlay lets you showcase gaming identity across platforms. We do not store your third-party passwords. Linked gaming accounts can be removed at any time.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">6. Termination</h2>
      <p>You can delete your account anytime. We may suspend accounts that violate these terms.</p>

      <h2 className="text-lg font-semibold text-foreground mt-6">7. Disclaimers</h2>
      <p>The service is provided "as is" without warranties. Some jurisdictions do not allow certain disclaimer exclusions.</p>

      <p className="text-muted-foreground italic">This document is a placeholder and will be finalized before launch.</p>
    </LegalLayout>
  );
}