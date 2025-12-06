import { Trophy, Medal, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Profile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardCardProps {
  profile: Profile;
  rank: number;
}

export function LeaderboardCard({ profile, rank }: LeaderboardCardProps) {
  const { user } = useAuth();
  const isCurrentUser = user?.id === profile.user_id;

  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = () => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-300/10 to-gray-400/10 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/10 to-orange-500/10 border-amber-600/30';
      default:
        return 'bg-card border-border/50';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border p-4 transition-all',
        getRankBg(),
        isCurrentUser && 'ring-2 ring-primary/50'
      )}
    >
      {/* Rank */}
      <div className="flex h-10 w-10 items-center justify-center">
        {getRankIcon()}
      </div>

      {/* Avatar */}
      <Avatar className="h-12 w-12 border-2 border-border">
        <AvatarImage src={profile.avatar_url || undefined} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {(profile.display_name || profile.username || 'U').charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1">
        <p className={cn(
          'font-semibold',
          isCurrentUser && 'text-primary'
        )}>
          {profile.display_name || profile.username || 'Anonymous Explorer'}
          {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
        </p>
        <p className="text-sm text-muted-foreground">
          Level {profile.level || 1} • {profile.sites_visited || 0} sites visited
        </p>
      </div>

      {/* XP */}
      <div className="text-right">
        <p className="text-lg font-bold text-foreground">
          {(profile.total_xp || 0).toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">XP</p>
      </div>
    </div>
  );
}
