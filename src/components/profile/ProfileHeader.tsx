import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut } from 'lucide-react';

interface ProfileHeaderProps {
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  isLoading?: boolean;
  onSignOut: () => void;
}

export function ProfileHeader({
  displayName,
  username,
  avatarUrl,
  bio,
  isLoading,
  onSignOut
}: ProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-primary">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {(displayName || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center sm:text-left">
            {isLoading ? (
              <Skeleton className="h-8 w-32 mx-auto sm:mx-0" />
            ) : (
              <>
                <h1 className="text-2xl font-bold">{displayName || 'Explorer'}</h1>
                <p className="text-muted-foreground">@{username || 'explorer'}</p>
                {bio && <p className="text-sm mt-2">{bio}</p>}
              </>
            )}
          </div>

          <Button variant="outline" onClick={onSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
