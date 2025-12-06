import { Trophy, Footprints, Church, Crown, Landmark, Mountain, Sunrise, Sunset, BookOpen, Car, Waves, Castle, Flame, Medal, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Achievement } from '@/hooks/useAchievements';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  footprints: Footprints,
  church: Church,
  crown: Crown,
  landmark: Landmark,
  mountain: Mountain,
  sunrise: Sunrise,
  sunset: Sunset,
  'book-open': BookOpen,
  car: Car,
  waves: Waves,
  castle: Castle,
  flame: Flame,
  medal: Medal,
  zap: Zap,
  star: Star,
};

interface AchievementBadgeProps {
  achievement: Achievement;
  earned?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function AchievementBadge({ 
  achievement, 
  earned = false, 
  size = 'md',
  showDetails = true 
}: AchievementBadgeProps) {
  const IconComponent = iconMap[achievement.icon] || Trophy;

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          bg: 'bg-gradient-to-br from-purple-500 to-pink-500',
          border: 'ring-2 ring-rarity-legendary/50',
          text: 'text-rarity-legendary',
        };
      case 'epic':
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
          border: 'ring-2 ring-rarity-epic/50',
          text: 'text-rarity-epic',
        };
      case 'rare':
        return {
          bg: 'bg-gradient-to-br from-cyan-500 to-teal-500',
          border: 'ring-2 ring-rarity-rare/50',
          text: 'text-rarity-rare',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
          border: 'ring-2 ring-rarity-common/50',
          text: 'text-rarity-common',
        };
    }
  };

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-10 w-10',
  };

  const rarityColors = getRarityColors(achievement.rarity);

  return (
    <div className={cn(
      'flex flex-col items-center gap-2',
      !earned && 'opacity-40 grayscale'
    )}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          sizeClasses[size],
          earned ? rarityColors.bg : 'bg-muted',
          earned && rarityColors.border,
          earned && 'badge-glow shadow-lg'
        )}
      >
        <IconComponent
          className={cn(
            iconSizes[size],
            earned ? 'text-primary-foreground' : 'text-muted-foreground'
          )}
        />
      </div>
      
      {showDetails && (
        <div className="text-center">
          <p className={cn(
            'text-sm font-medium',
            earned ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {achievement.name}
          </p>
          <p className={cn(
            'text-xs capitalize',
            earned ? rarityColors.text : 'text-muted-foreground'
          )}>
            {achievement.rarity}
          </p>
        </div>
      )}
    </div>
  );
}
