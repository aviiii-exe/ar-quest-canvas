import { Map, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function FloatingNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 bg-background/90 backdrop-blur-md rounded-full p-1 shadow-lg border border-border/50">
        {/* Left - Profile */}
        <Button
          variant={isActive('/profile') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => navigate('/profile')}
          className={cn(
            "rounded-full gap-2 px-4",
            isActive('/profile') && "bg-primary text-primary-foreground"
          )}
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </Button>

        {/* Middle - Guide/Chatbot */}
        <Button
          variant={isActive('/') || isActive('/guide') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => navigate('/')}
          className={cn(
            "rounded-full gap-2 px-4",
            (isActive('/') || isActive('/guide')) && "bg-primary text-primary-foreground"
          )}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Guide</span>
        </Button>

        {/* Right - Map */}
        <Button
          variant={isActive('/map') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => navigate('/map')}
          className={cn(
            "rounded-full gap-2 px-4",
            isActive('/map') && "bg-primary text-primary-foreground"
          )}
        >
          <Map className="h-4 w-4" />
          <span className="hidden sm:inline">Explore</span>
        </Button>
      </div>
    </div>
  );
}