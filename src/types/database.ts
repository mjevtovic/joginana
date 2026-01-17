export type SubscriptionStatus = "free" | "active" | "trialing" | "canceled" | "past_due";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  subscription_status: SubscriptionStatus;
  subscription_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface YogaClass {
  id: string;
  title: string;
  description: string | null;
  instructor: string | null;
  duration_minutes: number | null;
  difficulty: Difficulty | null;
  style: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  is_premium: boolean;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  class_id: string;
  created_at: string;
}

export interface QuizResponse {
  id: string;
  user_id: string;
  experience_level: string | null;
  goals: string[] | null;
  available_days: string[] | null;
  preferred_duration: number | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyPlan {
  id: string;
  user_id: string;
  week_start: string;
  created_at: string;
}

export interface PlannedSession {
  id: string;
  plan_id: string;
  class_id: string;
  day_of_week: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface PlannedSessionWithClass extends PlannedSession {
  class: YogaClass;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
      classes: {
        Row: YogaClass;
        Insert: Omit<YogaClass, "id" | "created_at">;
        Update: Partial<Omit<YogaClass, "id" | "created_at">>;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, "id" | "created_at">;
        Update: Partial<Omit<Favorite, "id" | "created_at">>;
      };
      quiz_responses: {
        Row: QuizResponse;
        Insert: Omit<QuizResponse, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<QuizResponse, "id" | "created_at">>;
      };
      weekly_plans: {
        Row: WeeklyPlan;
        Insert: Omit<WeeklyPlan, "id" | "created_at">;
        Update: Partial<Omit<WeeklyPlan, "id" | "created_at">>;
      };
      planned_sessions: {
        Row: PlannedSession;
        Insert: Omit<PlannedSession, "id" | "created_at">;
        Update: Partial<Omit<PlannedSession, "id" | "created_at">>;
      };
    };
  };
}
