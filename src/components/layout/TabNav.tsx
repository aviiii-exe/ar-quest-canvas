import { Map, Compass, BookOpen, Trophy } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Compass, label: 'Explore', path: '/' },
  { icon: BookOpen, label: 'Passport', path: '/passport' },
  { icon: Trophy, label: 'Achievements', path: '/achievements' },
  { icon: Map, label: 'Leaderboard', path: '/leaderboard' },
];

export function TabNav() {
  const location = useLocation();

  return (
    <nav className="hidden border-b border-border bg-background sm:block">
      <div className="container">
        <div className="flex h-12 items-center gap-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
