import { MapPin, Clock, Zap, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HeritageSite } from '@/hooks/useHeritageSites';

interface SiteCardProps {
  site: HeritageSite;
  isVisited?: boolean;
  onCollect?: () => void;
  isCollecting?: boolean;
}

export function SiteCard({ site, isVisited, onCollect, isCollecting }: SiteCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'temple':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'palace':
        return 'bg-accent/10 text-accent-foreground border-accent/20';
      case 'ruins':
        return 'bg-secondary text-secondary-foreground border-secondary';
      case 'natural':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-success';
      case 'medium':
        return 'text-warning';
      case 'hard':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn(
      'group overflow-hidden transition-all duration-300 hover:shadow-lg',
      isVisited && 'ring-2 ring-success/50'
    )}>
      <div className="relative aspect-video overflow-hidden">
        <img
          src={site.image_url || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'}
          alt={site.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        
        {/* Badges overlay */}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant="secondary" className={cn('text-xs', getCategoryColor(site.category))}>
            {site.category}
          </Badge>
        </div>
        
        {/* XP Badge */}
        <div className="absolute right-3 top-3">
          <Badge className="bg-xp text-xp-foreground gap-1">
            <Zap className="h-3 w-3" />
            {site.xp_reward} XP
          </Badge>
        </div>

        {/* Visited indicator */}
        {isVisited && (
          <div className="absolute right-3 bottom-3">
            <div className="flex items-center gap-1 rounded-full bg-success px-2 py-1 text-xs font-medium text-success-foreground">
              <CheckCircle className="h-3 w-3" />
              Visited
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="mb-1 text-lg font-semibold text-foreground">{site.name}</h3>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {site.short_description || site.description}
        </p>
        
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {site.estimated_duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {site.estimated_duration}
            </div>
          )}
          {site.difficulty && (
            <div className={cn('flex items-center gap-1 font-medium', getDifficultyColor(site.difficulty))}>
              <MapPin className="h-3 w-3" />
              {site.difficulty.charAt(0).toUpperCase() + site.difficulty.slice(1)}
            </div>
          )}
        </div>

        {!isVisited && onCollect && (
          <Button 
            onClick={onCollect} 
            disabled={isCollecting}
            className="w-full"
            size="sm"
          >
            {isCollecting ? 'Collecting...' : 'Collect Stamp'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
