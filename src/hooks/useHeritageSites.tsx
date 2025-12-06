import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface HeritageSite {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  latitude: number;
  longitude: number;
  category: string;
  xp_reward: number;
  difficulty: string;
  historical_period: string | null;
  best_time_to_visit: string | null;
  estimated_duration: string | null;
  created_at: string;
  updated_at: string;
}

export interface PassportStamp {
  id: string;
  user_id: string;
  site_id: string;
  collected_at: string;
  photo_url: string | null;
  notes: string | null;
}

export function useHeritageSites() {
  return useQuery({
    queryKey: ['heritage-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('heritage_sites')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as HeritageSite[];
    },
  });
}

export function useHeritageSite(id: string) {
  return useQuery({
    queryKey: ['heritage-site', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('heritage_sites')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as HeritageSite;
    },
    enabled: !!id,
  });
}

export function usePassportStamps() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['passport-stamps', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('passport_stamps')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as PassportStamp[];
    },
    enabled: !!user,
  });
}

export function useCollectStamp() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ siteId, notes }: { siteId: string; notes?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Insert stamp
      const { data: stamp, error: stampError } = await supabase
        .from('passport_stamps')
        .insert({
          user_id: user.id,
          site_id: siteId,
          notes,
        })
        .select()
        .single();
      
      if (stampError) throw stampError;
      
      // Get site XP reward
      const { data: site } = await supabase
        .from('heritage_sites')
        .select('xp_reward')
        .eq('id', siteId)
        .single();
      
      // Update profile XP and sites_visited
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp, sites_visited, level')
        .eq('user_id', user.id)
        .single();
      
      if (profile && site) {
        const newXp = (profile.total_xp || 0) + (site.xp_reward || 100);
        const newSitesVisited = (profile.sites_visited || 0) + 1;
        const newLevel = Math.floor(newXp / 500) + 1;
        
        await supabase
          .from('profiles')
          .update({
            total_xp: newXp,
            sites_visited: newSitesVisited,
            level: newLevel,
          })
          .eq('user_id', user.id);
      }
      
      return stamp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passport-stamps'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
