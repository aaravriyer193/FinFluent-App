// ==========================================
// SUPABASE DATABASE TYPES
// ==========================================

export type ThemePreference = 'light' | 'dark';
export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';
export type RewardType = 'Title' | 'AvatarFrame' | 'Badge';

export interface Profile {
  id: string; // UUID matches Auth user
  full_name: string | null;
  avatar_path: string | null; // Path to Supabase Storage bucket
  spendable_fin_coins: number;
  lifetime_fin_coins: number; // For the Leaderboard
  current_title: string;
  theme_preference: ThemePreference;
  has_completed_onboarding: boolean;
  ai_context_summary: Record<string, any>; // The JSONB memory for the Chatbot
  created_at: string;
  updated_at: string;
}

export interface OnboardingLog {
  id: string;
  user_id: string;
  question_number: 1 | 2 | 3 | 4 | 5;
  question: string;
  answer: string;
  created_at: string;
}

export interface CourseModule {
  id: number;
  module_number: number; // 1 to 16
  title: string;
  overview_video_id: string | null;
  topic_1_video_id: string | null;
  topic_2_video_id: string | null;
  topic_3_video_id: string | null;
  summary_video_id: string | null;
  coin_reward: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  module_id: number;
  is_unlocked: boolean;
  status: ModuleStatus;
  
  // Micro-step tracking matching the whiteboard
  topic_1_completed: boolean;
  topic_2_completed: boolean;
  topic_3_completed: boolean;
  summary_completed: boolean;
  
  simulation_score: number;
  completed_at: string | null;
}

export interface Reward {
  id: string;
  name: string;
  type: RewardType;
  cost_in_fincoins: number;
  asset_path: string | null;
}

// ==========================================
// APP STATE TYPES
// ==========================================

export interface AppContextType {
  user: Profile | null;
  session: any | null; // Supabase session object
  loading: boolean;
  refreshUserData: () => Promise<void>;
}