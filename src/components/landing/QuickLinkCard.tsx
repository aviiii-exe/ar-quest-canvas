import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface QuickLinkCardProps {
  icon: LucideIcon;
  iconColorClass?: string;
  title: string;
  description: string;
  onClick: () => void;
}

export const QuickLinkCard = ({
  icon: Icon,
  iconColorClass = 'text-primary',
  title,
  description,
  onClick,
}: QuickLinkCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-3 py-4">
        <Icon className={`h-8 w-8 ${iconColorClass}`} />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};
