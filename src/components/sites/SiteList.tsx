import { useState } from 'react';
import { SiteCard } from './SiteCard';
import { useHeritageSites, usePassportStamps, useCollectStamp } from '@/hooks/useHeritageSites';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, Church, Castle, Mountain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const categories = [
  { value: 'all', label: 'All', icon: MapPin },
  { value: 'temple', label: 'Temples', icon: Church },
  { value: 'palace', label: 'Palaces', icon: Castle },
  { value: 'ruins', label: 'Ruins', icon: Filter },
  { value: 'natural', label: 'Natural', icon: Mountain },
];

export function SiteList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { data: sites, isLoading: sitesLoading } = useHeritageSites();
  const { data: stamps } = usePassportStamps();
  const collectStamp = useCollectStamp();
  const { toast } = useToast();

  const visitedSiteIds = new Set(stamps?.map((s) => s.site_id) || []);

  const filteredSites = sites?.filter((site) => {
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || site.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCollect = async (siteId: string, siteName: string) => {
    try {
      await collectStamp.mutateAsync({ siteId });
      toast({
        title: '🎉 Stamp Collected!',
        description: `You've visited ${siteName}! Check your passport for the new stamp.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to collect stamp. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (sitesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search heritage sites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={activeCategory === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(category.value)}
              className={cn(
                'gap-1.5',
                activeCategory === category.value && 'shadow-md'
              )}
            >
              <category.icon className="h-3.5 w-3.5" />
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{filteredSites?.length || 0} sites</span>
        <span>•</span>
        <span>{visitedSiteIds.size} visited</span>
      </div>

      {/* Site Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSites?.map((site) => (
          <SiteCard
            key={site.id}
            site={site}
            isVisited={visitedSiteIds.has(site.id)}
            onCollect={() => handleCollect(site.id, site.name)}
            isCollecting={collectStamp.isPending}
          />
        ))}
      </div>

      {filteredSites?.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No sites found matching your search.</p>
        </div>
      )}
    </div>
  );
}
