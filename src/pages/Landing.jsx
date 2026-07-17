import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { getRegistrationMode } from '@/lib/registration';
import LandingNav from '@/components/landing/LandingNav';
import Hero from '@/components/landing/Hero';
import GamingIdentity from '@/components/landing/GamingIdentity';
import ConnectWorld from '@/components/landing/ConnectWorld';
import FriendsPlaying from '@/components/landing/FriendsPlaying';
import CommunitiesPreview from '@/components/landing/CommunitiesPreview';
import GamingWrapped from '@/components/landing/GamingWrapped';
import FeatureShowcase from '@/components/landing/FeatureShowcase';
import SocialProof from '@/components/landing/SocialProof';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function Landing() {
  const { user } = useAuth();
  const location = useLocation();
  const [regMode, setRegMode] = useState('public');

  useEffect(() => { getRegistrationMode().then(setRegMode); }, []);

  // Authenticated users go straight to their dashboard, preserving intended deep links.
  if (user) return <Navigate to="/home" replace />;

  const primaryHref = regMode === 'waitlist' ? '/waitlist' : '/register';
  const primaryLabel = regMode === 'waitlist' ? 'Join the Waitlist' : 'Create Free Account';

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <LandingNav />
      <main>
        <Hero primaryHref={primaryHref} primaryLabel={primaryLabel} />
        <GamingIdentity />
        <ConnectWorld />
        <FriendsPlaying />
        <CommunitiesPreview />
        <GamingWrapped />
        <FeatureShowcase />
        <SocialProof />
        <CTA primaryHref={primaryHref} primaryLabel={primaryLabel} />
      </main>
      <Footer />
    </div>
  );
}