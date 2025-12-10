import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Trophy, Stamp } from 'lucide-react';

interface ProfileStatsProps {
  sitesVisited: number;
  achievementsCount: number;
  totalXP: number;
}

export function ProfileStats({ sitesVisited, achievementsCount, totalXP }: ProfileStatsProps) {
  const stats = [
    { icon: MapPin, value: sitesVisited, label: 'Sites Visited', className: 'text-primary' },
    { icon: Trophy, value: achievementsCount, label: 'Achievements', className: 'text-amber-500' },
    { icon: Stamp, value: totalXP, label: 'Total XP', className: 'text-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ icon: Icon, value, label, className }) => (
        <Card key={label}>
          <CardContent className="p-4 text-center">
            <Icon className={`h-6 w-6 mx-auto mb-1 ${className}`} />
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
