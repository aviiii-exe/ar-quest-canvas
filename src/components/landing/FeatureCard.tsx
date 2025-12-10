import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColorClass?: string;
  iconBgClass?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  iconColorClass = 'text-primary',
  iconBgClass = 'bg-primary/10 group-hover:bg-primary/20',
}) => {
  return (
    <Card className="bg-card/50 backdrop-blur border-border/50 group hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
          iconBgClass
        )}>
          <Icon className={cn("h-6 w-6", iconColorClass)} />
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-base mb-1">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
