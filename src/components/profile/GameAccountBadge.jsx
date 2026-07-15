import { Gamepad2, Crosshair, Swords, Zap, Monitor, Trophy, Dices } from 'lucide-react';

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

export default function GameAccountBadge({ account, onRemove }) {
  const config = getPlatformConfig(account.platform);
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bg} ${config.border} group`}>
      <Icon className={`w-5 h-5 ${config.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{account.username}</p>
        <p className="text-xs text-muted-foreground">{account.platform}</p>
      </div>
      {account.level > 0 && (
        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
          Lv {account.level}
        </span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Remove
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