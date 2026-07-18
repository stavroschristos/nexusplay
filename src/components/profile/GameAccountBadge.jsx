import { Gamepad2, Crosshair, Swords, Zap, Monitor, Trophy, Dices, ShieldCheck, Clock } from 'lucide-react';

const platformConfig = {
  PlayStation: { icon: Gamepad2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  Xbox: { icon: Monitor, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  Steam: { icon: Zap, color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  Nintendo: { icon: Dices, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  'Epic Games': { icon: Trophy, color: 'text-slate-200', bg: 'bg-slate-400/10', border: 'border-slate-400/30' },
  Riot: { icon: Crosshair, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  'Battle.net': { icon: Swords, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
};

export function getPlatformConfig(platform) {
  return platformConfig[platform] || { icon: Gamepad2, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' };
}

function timeAgo(date) {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function GameAccountBadge({ account, onRemove }) {
  const config = getPlatformConfig(account.platform);
  const Icon = config.icon;
  const connected = timeAgo(account.connected_at);
  const isOAuth = account.connection_method === 'oauth' || account.is_verified;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bg} ${config.border} group`}>
      <Icon className={`w-5 h-5 ${config.color} shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{account.username}</p>
          {isOAuth ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-label="Verified via official login" />
          ) : (
            <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground shrink-0">Manual</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{account.platform}</span>
          {connected && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {connected}</span>
            </>
          )}
          {account.status === 'expired' && <span className="text-amber-400">· re-auth needed</span>}
        </div>
      </div>
      {account.level > 0 && (
        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
          Lv {account.level}
        </span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}

export function PlatformIcon({ platform, className }) {
  const config = getPlatformConfig(platform);
  const Icon = config.icon;
  return <Icon className={`${config.color} ${className || 'w-4 h-4'}`} />;
}