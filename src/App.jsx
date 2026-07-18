import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { useEffect } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { setLoggerUser } from '@/lib/error-logger';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Landing from '@/pages/Landing';
import Waitlist from '@/pages/Waitlist';
import Explore from '@/pages/Explore';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Messages from '@/pages/Messages';
import Games from '@/pages/Games';
import GameDetail from '@/pages/GameDetail';
import Communities from '@/pages/Communities';
import CommunityDetail from '@/pages/CommunityDetail';
import CollectionDetail from '@/pages/CollectionDetail';
import LFG from '@/pages/LFG';
import Notifications from '@/pages/Notifications';
import Wrapped from '@/pages/Wrapped';
import Roadmap from '@/pages/Roadmap';
import Radar from '@/pages/Radar';
import Challenges from '@/pages/Challenges';
import Assistant from '@/pages/Assistant';
import Onboarding from '@/pages/Onboarding';
import Admin from '@/pages/Admin';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Terms from '@/pages/Terms';
import CommunityGuidelines from '@/pages/CommunityGuidelines';
import DataUsage from '@/pages/DataUsage';
import CookiePolicy from '@/pages/CookiePolicy';
import Security from '@/pages/Security';
import Status from '@/pages/Status';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import { Navigate } from 'react-router-dom';
import InviteLanding from '@/pages/InviteLanding';
import Search from '@/pages/Search';
import Changelog from '@/pages/Changelog';
// Add page imports here

const AuthenticatedApp = () => {
  const { user, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  useEffect(() => { setLoggerUser(user?.id || null); }, [user]);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/waitlist" element={<Waitlist />} />
      <Route path="/invite/:code" element={<InviteLanding />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/guidelines" element={<CommunityGuidelines />} />
      <Route path="/data-usage" element={<DataUsage />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/security" element={<Security />} />
      <Route path="/status" element={<Status />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/communities/:id" element={<CommunityDetail />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/lfg" element={<LFG />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/wrapped" element={<Wrapped />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/radar" element={<Radar />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <ErrorBoundary>
            <AuthenticatedApp />
          </ErrorBoundary>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App