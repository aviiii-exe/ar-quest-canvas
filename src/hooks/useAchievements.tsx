import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { XP_PER_LEVEL, DEFAULT_XP_REWARD } from '@/constants/app';

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
  rarity: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rarity', { ascending: false });
      
      if (error) throw error;
      return data as Achievement[];
    },
  });
}

export function useUserAchievements() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useEarnAchievement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (achievementId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Get achievement XP reward
      const { data: achievement } = await supabase
        .from('achievements')
        .select('xp_reward')
        .eq('id', achievementId)
        .single();
      
      if (achievement) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_xp, level')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          const newXp = (profile.total_xp || 0) + (achievement.xp_reward || DEFAULT_XP_REWARD);
          const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
          
          await supabase
            .from('profiles')
            .update({ total_xp: newXp, level: newLevel })
            .eq('user_id', user.id);
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
