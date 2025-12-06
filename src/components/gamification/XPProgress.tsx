import { Zap, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface XPProgressProps {
  currentXP: number;
  level: number;
  className?: string;
}

export function XPProgress({ currentXP, level, className }: XPProgressProps) {
  const xpPerLevel = 500;
  const currentLevelXP = currentXP % xpPerLevel;
  const progress = (currentLevelXP / xpPerLevel) * 100;
  const xpToNextLevel = xpPerLevel - currentLevelXP;

  return (
    <div className={cn('rounded-xl bg-card p-4 shadow-sm border border-border/50', className)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <span className="text-lg font-bold text-accent-foreground">{level}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Level {level}</p>
            <p className="text-xs text-muted-foreground">Explorer</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-xp/10 px-3 py-1">
          <Zap className="h-4 w-4 text-xp" />
          <span className="text-sm font-semibold text-foreground">{currentXP.toLocaleString()} XP</span>
        </div>
      </div>

      <div className="space-y-1">
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{currentLevelXP} / {xpPerLevel} XP</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{xpToNextLevel} XP to Level {level + 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
