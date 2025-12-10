import { useAuth } from '@/hooks/useAuth';
import { usePassportStamps } from '@/hooks/useHeritageSites';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface UseStampCollectionOptions {
  sites?: Tables<'heritage_sites'>[];
  onSuccess?: (site: Tables<'heritage_sites'>) => void;
}

export function useStampCollection({ sites, onSuccess }: UseStampCollectionOptions = {}) {
  const { user } = useAuth();
  const { data: stamps, refetch: refetchStamps } = usePassportStamps();
  const { toast } = useToast();

  const visitedSiteIds = stamps?.map(stamp => stamp.site_id) || [];

  const collectStamp = async (siteOrId: Tables<'heritage_sites'> | string) => {
    const site = typeof siteOrId === 'string' 
      ? sites?.find(s => s.id === siteOrId)
      : siteOrId;
    const siteId = typeof siteOrId === 'string' ? siteOrId : siteOrId.id;

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to collect stamps",
        variant: "destructive"
      });
      return { success: false, error: 'not_authenticated' };
    }

    if (!site) {
      toast({
        title: "Invalid QR Code",
        description: "This QR code doesn't match any heritage site",
        variant: "destructive"
      });
      return { success: false, error: 'site_not_found' };
    }

    if (visitedSiteIds.includes(siteId)) {
      toast({
        title: "Already collected",
        description: `You've already collected the stamp for ${site.name}`
      });
      return { success: false, error: 'already_collected' };
    }

    try {
      const { error } = await supabase.from('passport_stamps').insert({
        user_id: user.id,
        site_id: siteId
      });

      if (error) throw error;

      toast({
        title: "Stamp Collected! 🎉",
        description: `You've collected the stamp for ${site.name}`
      });

      refetchStamps();
      onSuccess?.(site);

      return { success: true, site };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to collect stamp. Please try again.",
        variant: "destructive"
      });
      return { success: false, error: 'insert_failed' };
    }
  };

  return {
    collectStamp,
    visitedSiteIds,
    stamps,
    refetchStamps
  };
}
