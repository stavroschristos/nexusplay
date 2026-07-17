import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import OAuthButtons from "@/components/auth/OAuthButtons";
import { toast } from "@/components/ui/use-toast";
import { getRegistrationMode } from "@/lib/registration";
import { resolveInvite, markRegistered } from "@/lib/invites";
import { trackJourney } from "@/lib/journey";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [regMode, setRegMode] = useState("public");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => { getRegistrationMode().then(setRegMode); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agreed) {
      setError("Please review and accept the Terms of Service and Privacy Policy to continue");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      let source = "organic";
      try {
        const code = localStorage.getItem("nexus_invite_code");
        if (code) {
          const inv = await resolveInvite(code);
          if (inv && inv.inviter_id) {
            const me = await base44.auth.me();
            await base44.auth.updateMe({
              invited_by: inv.inviter_id,
              invite_source: "invite_link",
              registration_source: "invite",
              signup_at: new Date().toISOString(),
            });
            await markRegistered(code, me?.id, me?.display_name || me?.full_name);
            source = "invite";
          }
        }
        localStorage.removeItem("nexus_invite_code");
      } catch { /* ignore invite errors */ }
      trackJourney("account_created", { source });
      window.location.href = "/onboarding";
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  // Invite-only / waitlist gating only applies before the OTP step.
  if (!showOtp && regMode === "waitlist") {
    return (
      <AuthLayout
        icon={UserPlus}
        title="Join the waitlist"
        subtitle="Registration is currently by approval"
        footer={<Link to="/waitlist" className="text-primary font-medium hover:underline">Go to the waitlist form →</Link>}
      >
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-5">We're rolling out access in waves. Join the waitlist and we'll email you when your spot opens up.</p>
          <Button asChild className="w-full h-12 rounded-full glow"><Link to="/waitlist">Reserve my spot</Link></Button>
        </div>
      </AuthLayout>
    );
  }

  if (!showOtp && regMode === "invite_only") {
    return (
      <AuthLayout
        icon={UserPlus}
        title="Invite only"
        subtitle="Registration is currently closed"
        footer={<Link to="/" className="text-primary font-medium hover:underline">Back to home</Link>}
      >
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-5">NexusPlay is invite-only right now. New accounts require an invitation from an existing admin.</p>
          <Button asChild variant="outline" className="w-full h-12 rounded-full"><Link to="/login">I have an account</Link></Button>
        </div>
      </AuthLayout>
    );
  }

  if (showOtp) {
    return (
      <AuthLayout
        icon={Mail}
        title="Verify your email"
        subtitle={`We sent a code to ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <OAuthButtons />

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <label className="flex items-start gap-3 text-sm text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-border accent-primary shrink-0"
          />
          <span>
            I have read and agree to the{" "}
            <Link to="/terms" target="_blank" className="text-primary font-medium hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link to="/privacy" target="_blank" className="text-primary font-medium hover:underline">Privacy Policy</Link>.
          </span>
        </label>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading || !agreed}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By creating an account you also acknowledge our{" "}
          <Link to="/guidelines" target="_blank" className="text-primary hover:underline">Community Guidelines</Link>{" "}
          and{" "}
          <Link to="/cookies" target="_blank" className="text-primary hover:underline">Cookie Policy</Link>.
        </p>
      </form>
    </AuthLayout>
  );
}