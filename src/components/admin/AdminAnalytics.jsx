import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { computeProfileCompletion } from '@/lib/journey';
import { Users, Zap, TrendingUp, Activity, Star, AlertTriangle, Lightbulb, BarChart3, Gamepad2 } from 'lucide-react';

function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [users, events, feedback, features] = await Promise.all([
          base44.entities.User.list('-created_date', 500).catch(() => []),
          base44.entities.AnalyticsEvent.list('-created_date', 500).catch(() => []),
          base44.entities.Feedback.list('-created_date', 200).catch(() => []),
          base44.entities.FeatureRequest.filter({ is_public: true }).catch(() => []),
        ]);

        const total = users.length;
        const now = Date.now();
        const created = (u) => new Date(u.created_date || u.signup_at || u.created_date).getTime();

        // Activation: onboarded + completion>=80 + social
        const socialActive = (u) => u.first_follow_at || u.first_community_at || u.first_post_at || u.first_comment_at || u.first_like_at || u.first_message_at;
        const activated = users.filter((u) => u.activated || (u.has_onboarded && computeProfileCompletion(u) >= 80 && socialActive(u))).length;

        // Onboarding funnel
        const startedOnboard = events.filter((e) => e.event_name === 'onboarding_started').length;
        const completedOnboard = events.filter((e) => e.event_name === 'onboarding_completed').length;
        const onboardConv = startedOnboard ? pct(completedOnboard, startedOnboard) : 0;

        // Profile completion distribution
        const buckets = { 25: 0, 50: 0, 75: 0, 100: 0 };
        users.forEach((u) => {
          const c = computeProfileCompletion(u);
          if (c >= 100) buckets[100]++;
          else if (c >= 75) buckets[75]++;
          else if (c >= 50) buckets[50]++;
          else if (c >= 25) buckets[25]++;
        });

        // Social connection
        const followed = users.filter((u) => u.first_follow_at).length;
        const joinedCommunity = users.filter((u) => u.first_community_at).length;
        const interacted = users.filter((u) => u.first_like_at || u.first_comment_at).length;

        // Retention (D1/D7/D30) — based on last_active vs created_date
        const activeAfter = (days) => users.filter((u) => {
          const c = created(u); if (!c) return false;
          const la = u.last_active ? new Date(u.last_active).getTime() : c;
          return (la - c) >= days * 86400000;
        }).length;
        const d1 = pct(activeAfter(1), total);
        const d7 = pct(activeAfter(7), total);
        const d30 = pct(activeAfter(30), total);

        // DAU / returning
        const oneDayAgo = now - 86400000;
        const dau = users.filter((u) => u.last_active && new Date(u.last_active).getTime() > oneDayAgo).length;

        // Most used features (from event feature_key)
        const featureCounts = {};
        events.forEach((e) => { if (e.feature_key && e.feature_key !== 'other') featureCounts[e.feature_key] = (featureCounts[e.feature_key] || 0) + 1; });
        const topFeatures = Object.entries(featureCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

        // Most abandoned: onboarding step events that didn't reach completion
        const onboardingSteps = ['onboarding_started', 'platforms_selected', 'favorite_games_selected', 'accounts_connected', 'onboarding_completed'];
        const stepCounts = onboardingSteps.map((s) => ({ step: s, count: events.filter((e) => e.event_name === s).length }));
        const maxStep = Math.max(...stepCounts.map((s) => s.count), 1);
        const abandoned = stepCounts.slice(0, -1).map((s, i) => ({ ...s, dropoff: pct(maxStep - s.count, maxStep) }))
          .filter((s) => s.dropoff > 0).sort((a, b) => b.dropoff - a.dropoff);

        // Avg feedback rating
        const rated = feedback.filter((f) => f.rating);
        const avgRating = rated.length ? (rated.reduce((a, f) => a + f.rating, 0) / rated.length).toFixed(1) : '—';

        // Top requested features
        const topRequested = features.sort((a, b) => (b.id || '').length - 0).slice(0, 5);

        // Alpha users
        const alphaUsers = users.filter((u) => u.is_alpha_tester || u.invite_source);
        const activeAlpha = alphaUsers.filter((u) => u.last_active && new Date(u.last_active).getTime() > oneDayAgo).length;
        const completedAlpha = alphaUsers.filter((u) => computeProfileCompletion(u) >= 75).length;

        // Automated insights
        const insights = [];
        if (startedOnboard > 0 && onboardConv < 60) insights.push(`Only ${onboardConv}% of users who start onboarding finish it — the biggest drop-off is the step after "${abandoned[0]?.step?.replace(/_/g, ' ') || 'start'}".`);
        if (total > 0) {
          const communityReturners = pct(joinedCommunity, total);
          const nonCommunityReturners = pct(d1, total);
          if (communityReturners > nonCommunityReturners + 10) insights.push(`Users who join communities return more often (${communityReturners}% vs ${nonCommunityReturners}% next-day activity).`);
        }
        const completionHighReturn = users.filter((u) => computeProfileCompletion(u) >= 75 && u.last_active);
        const completionLowReturn = users.filter((u) => computeProfileCompletion(u) < 50 && u.last_active);
        if (completionHighReturn.length > 0 || completionLowReturn.length > 0) {
          const hr = pct(completionHighReturn.length, total);
          const lr = pct(completionLowReturn.length, total);
          if (hr > lr * 2) insights.push(`Users who complete 75%+ of their profile are ${Math.round(hr / Math.max(lr, 1))}x more likely to stay active.`);
        }
        if (buckets[100] < total * 0.3) insights.push(`${pct(total - buckets[100], total)}% of users haven't fully built their gaming identity yet — most stall around the ${(buckets[75] > buckets[50] ? '50%' : '25%')} mark.`);

        setData({ total, activated, onboardConv, completedOnboard, startedOnboard, buckets, followed, joinedCommunity, interacted, d1, d7, d30, dau, topFeatures, abandoned, avgRating, topRequested, alphaUsers: alphaUsers.length, activeAlpha, completedAlpha, insights });
      } catch {
        setData(null);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-sm text-muted-foreground">Failed to load analytics.</p>;

  const Stat = ({ label, value, sub, icon: Icon, cls }) => (
    <div className="rounded-2xl border border-border bg-card/50 p-4">
      <Icon className={`w-5 h-5 mb-2 ${cls || 'text-primary'}`} />
      <p className="text-2xl font-bold font-heading">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Activation */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Zap className="w-4 h-4" /> Activation</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total Users" value={data.total} icon={Users} cls="text-primary" />
          <Stat label="Activation Rate" value={`${pct(data.activated, data.total)}%`} sub={`${data.activated} activated`} icon={Zap} cls="text-emerald-400" />
          <Stat label="Onboarding Conv." value={`${data.onboardConv}%`} sub={`${data.completedOnboard}/${data.startedOnboard} started`} icon={TrendingUp} cls="text-blue-400" />
          <Stat label="DAU" value={data.dau} icon={Activity} cls="text-fuchsia-400" />
        </div>
        <div className="rounded-2xl border border-border bg-card/50 p-4">
          <p className="text-xs text-muted-foreground mb-2">Activation = completed onboarding + built gaming identity (75%+) + first social action</p>
          <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full" style={{ width: `${pct(data.activated, data.total)}%` }} /></div>
        </div>
      </section>

      {/* Profile completion */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Star className="w-4 h-4" /> Profile Completion</h3>
        <div className="grid grid-cols-4 gap-3">
          {[25, 50, 75, 100].map((b) => (
            <Stat key={b} label={`Reached ${b}%`} value={data.buckets[b]} icon={BarChart3} cls="text-amber-400" />
          ))}
        </div>
      </section>

      {/* Social + retention */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card/50 p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Social Connection</h3>
          <div className="space-y-2">
            <Row label="Followed someone" value={`${pct(data.followed, data.total)}%`} />
            <Row label="Joined a community" value={`${pct(data.joinedCommunity, data.total)}%`} />
            <Row label="Liked / commented" value={`${pct(data.interacted, data.total)}%`} />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card/50 p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Retention</h3>
          <div className="space-y-2">
            <Row label="Day 1 retention" value={`${data.d1}%`} />
            <Row label="Day 7 retention" value={`${data.d7}%`} />
            <Row label="Day 30 retention" value={`${data.d30}%`} />
          </div>
        </div>
      </section>

      {/* Alpha dashboard */}
      <section className="rounded-2xl border border-border bg-card/50 p-5 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><Gamepad2 className="w-4 h-4" /> Alpha Testing Dashboard</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Stat label="Alpha Users" value={data.alphaUsers} icon={Users} cls="text-primary" />
          <Stat label="Active (24h)" value={data.activeAlpha} icon={Activity} cls="text-emerald-400" />
          <Stat label="Completed Profiles" value={data.completedAlpha} icon={Star} cls="text-amber-400" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Most Used Features</p>
            <div className="space-y-1.5">
              {data.topFeatures.length === 0 ? <p className="text-xs text-muted-foreground">No data yet.</p> :
                data.topFeatures.map(([k, c]) => (
                  <div key={k} className="flex items-center justify-between text-sm"><span className="capitalize">{k}</span><span className="font-semibold text-primary">{c}</span></div>
                ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Most Abandoned Steps</p>
            <div className="space-y-1.5">
              {data.abandoned.length === 0 ? <p className="text-xs text-muted-foreground">No drop-offs detected.</p> :
                data.abandoned.slice(0, 4).map((s) => (
                  <div key={s.step} className="flex items-center justify-between text-sm"><span className="capitalize">{s.step.replace(/_/g, ' ')}</span><span className="font-semibold text-amber-400">{s.dropoff}% drop</span></div>
                ))}
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-border">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Most Requested Features</p>
            <div className="space-y-1">
              {data.topRequested.length === 0 ? <p className="text-xs text-muted-foreground">No requests yet.</p> :
                data.topRequested.map((f) => (<div key={f.id} className="text-sm truncate">• {f.title}</div>))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Avg Feedback Rating</p>
            <p className="text-2xl font-bold">{data.avgRating} <span className="text-sm text-muted-foreground">/ 5</span></p>
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="w-4 h-4 text-primary" /> Product Insights</h3>
        {data.insights.length === 0 ? <p className="text-sm text-muted-foreground">Not enough data yet — insights appear as users join.</p> :
          data.insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{ins}</span>
            </div>
          ))}
      </section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}