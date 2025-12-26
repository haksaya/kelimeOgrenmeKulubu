
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';
import { UserProfile, Word, RecentWord } from '../types';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const api = {
  // User Management
  login: async (username: string, password: string): Promise<{ user: UserProfile | null, error: string | null }> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
            return { user: null, error: "Kullanıcı adı veya şifre hatalı." };
      }
      return { user: null, error: error.message };
    }
    return { user: data as UserProfile, error: null };
  },

  getUserProfile: async (id: string): Promise<UserProfile | null> => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    return data as UserProfile;
  },

  getLeaderboard: async (): Promise<UserProfile[]> => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('points', { ascending: false });
    return (data as UserProfile[]) || [];
  },

  getRecentActivity: async (): Promise<RecentWord[]> => {
    const { data } = await supabase
      .from('words')
      .select('*, profiles(username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(4);
    return (data as unknown as RecentWord[]) || [];
  },

  addUser: async (newUser: Partial<UserProfile> & { password: string }): Promise<any> => {
    return await supabase.from('profiles').insert([newUser]);
  },

  updateAvatar: async (userId: string, avatarUrl: string): Promise<any> => {
    return await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);
  },

  // Word Management
  addWord: async (word: Partial<Word>): Promise<any> => {
    const { data, error } = await supabase.from('words').insert([word]).select().single();
    if (error) return { error };

    const { error: rpcError } = await supabase.rpc('increment_word_count', { user_id_param: word.user_id });
    
    if (rpcError) {
      console.warn("RPC failed, falling back to manual update", rpcError);
      const { data: userData } = await supabase.from('profiles').select('word_count').eq('id', word.user_id).single();
      if (userData) {
        await supabase.from('profiles').update({ word_count: userData.word_count + 1 }).eq('id', word.user_id);
      }
    }

    return { data };
  },

  deleteWord: async (wordId: string, userId: string): Promise<{ error: any }> => {
    const { error } = await supabase.from('words').delete().eq('id', wordId);
    
    if (error) return { error };

    const { data: userData } = await supabase.from('profiles').select('word_count').eq('id', userId).single();
    if (userData && userData.word_count > 0) {
      await supabase.from('profiles').update({ word_count: userData.word_count - 1 }).eq('id', userId);
    }

    return { error: null };
  },

  getUserWords: async (userId: string): Promise<Word[]> => {
    const { data } = await supabase
      .from('words')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return (data as Word[]) || [];
  },

  getAllWords: async (): Promise<Word[]> => {
    const { data } = await supabase
      .from('words')
      .select('*')
      .order('created_at', { ascending: false });
    return (data as Word[]) || [];
  },

  updateScore: async (userId: string, pointsToAdd: number) => {
    const { error } = await supabase.rpc('add_points', { user_id_param: userId, points: pointsToAdd });
    
    if (error) {
       console.warn("RPC failed, falling back to manual update", error);
       const { data: userData } = await supabase.from('profiles').select('points').eq('id', userId).single();
       if (userData) {
         await supabase.from('profiles').update({ points: userData.points + pointsToAdd }).eq('id', userId);
       }
    }
  }
};
