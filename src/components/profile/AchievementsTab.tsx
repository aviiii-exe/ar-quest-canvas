import { AchievementBadge } from '@/components/gamification/AchievementBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from './EmptyState';
import { Trophy } from 'lucide-react';
import type { Achievement } from '@/hooks/useAchievements';

interface UserAchievementItem {
  id: string;
  achievement: Achievement;
}

interface AchievementsTabProps {
  achievements: UserAchievementItem[] | undefined;
  isLoading: boolean;
}

export const AchievementsTab = ({ achievements, isLoading }: AchievementsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : achievements && achievements.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {achievements.map(item => (
              <AchievementBadge 
                key={item.id} 
                achievement={item.achievement}
                earned={true}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="No achievements earned yet"
            description="Explore Hampi to unlock achievements!"
          />
        )}
      </CardContent>
    </Card>
  );
};
