/**
 * Supabase Database Types
 * 
 * TypeScript types generated from the PostgreSQL schema.
 * In production, generate with: npx supabase gen types typescript
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          is_pro: boolean
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          subscription_ends_at: string | null
          account_type: "regular" | "test"
          daily_sentence_limit: number | null
          account_expires_at: string | null
          admin_notes: string | null
          xp: number
          level: number
          streak: number
          longest_streak: number
          last_active_date: string | null
          total_analyses: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          is_pro?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_ends_at?: string | null
          account_type?: "regular" | "test"
          daily_sentence_limit?: number | null
          account_expires_at?: string | null
          admin_notes?: string | null
          xp?: number
          level?: number
          streak?: number
          longest_streak?: number
          last_active_date?: string | null
          total_analyses?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          is_pro?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_ends_at?: string | null
          account_type?: "regular" | "test"
          daily_sentence_limit?: number | null
          account_expires_at?: string | null
          admin_notes?: string | null
          xp?: number
          level?: number
          streak?: number
          longest_streak?: number
          last_active_date?: string | null
          total_analyses?: number
          created_at?: string
          updated_at?: string
        }
      }
      analyses: {
        Row: {
          id: string
          user_id: string
          text: string
          language: string
          translation: string | null
          nodes: Json
          pedagogical_data: Json | null
          difficulty_level: string | null
          difficulty_score: number | null
          embedding: number[] | null
          is_favorite: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          language: string
          translation?: string | null
          nodes: Json
          pedagogical_data?: Json | null
          difficulty_level?: string | null
          difficulty_score?: number | null
          is_favorite?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          language?: string
          translation?: string | null
          nodes?: Json
          pedagogical_data?: Json | null
          difficulty_level?: string | null
          difficulty_score?: number | null
          is_favorite?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      vocabulary: {
        Row: {
          id: string
          user_id: string
          analysis_id: string | null
          word: string
          lemma: string
          translation: string | null
          language: string
          part_of_speech: string | null
          context: string | null
          mastery: number
          ease_factor: number
          interval_days: number
          next_review: string | null
          last_reviewed: string | null
          review_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          analysis_id?: string | null
          word: string
          lemma: string
          translation?: string | null
          language: string
          part_of_speech?: string | null
          context?: string | null
          mastery?: number
          ease_factor?: number
          interval_days?: number
          next_review?: string | null
          last_reviewed?: string | null
          review_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          analysis_id?: string | null
          word?: string
          lemma?: string
          translation?: string | null
          language?: string
          part_of_speech?: string | null
          context?: string | null
          mastery?: number
          ease_factor?: number
          interval_days?: number
          next_review?: string | null
          last_reviewed?: string | null
          review_count?: number
          created_at?: string
        }
      }
      daily_goals: {
        Row: {
          id: string
          user_id: string
          date: string
          target: number
          completed: number
          is_achieved: boolean
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          target?: number
          completed?: number
          is_achieved?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          target?: number
          completed?: number
          is_achieved?: boolean
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          xp_reward: number
          requirement_type: string | null
          requirement_value: number | null
        }
        Insert: {
          id: string
          name: string
          description: string
          icon: string
          xp_reward?: number
          requirement_type?: string | null
          requirement_value?: number | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          xp_reward?: number
          requirement_type?: string | null
          requirement_value?: number | null
        }
      }
      user_achievements: {
        Row: {
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
      sentence_feedback: {
        Row: {
          id: string
          user_id: string
          analysis_id: string
          rating: number
          category: "accuracy" | "translation" | "grammar_tips" | "difficulty" | "other"
          comment: string | null
          sentence_text: string
          language: string
          is_resolved: boolean
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          analysis_id: string
          rating: number
          category: "accuracy" | "translation" | "grammar_tips" | "difficulty" | "other"
          comment?: string | null
          sentence_text: string
          language: string
          is_resolved?: boolean
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          analysis_id?: string
          rating?: number
          category?: "accuracy" | "translation" | "grammar_tips" | "difficulty" | "other"
          comment?: string | null
          sentence_text?: string
          language?: string
          is_resolved?: boolean
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type User = Database["public"]["Tables"]["users"]["Row"]
export type Analysis = Database["public"]["Tables"]["analyses"]["Row"]
export type Vocabulary = Database["public"]["Tables"]["vocabulary"]["Row"]
export type DailyGoal = Database["public"]["Tables"]["daily_goals"]["Row"]
export type Achievement = Database["public"]["Tables"]["achievements"]["Row"]
export type UserAchievement = Database["public"]["Tables"]["user_achievements"]["Row"]
export type SentenceFeedback = Database["public"]["Tables"]["sentence_feedback"]["Row"]
export type FeedbackCategory = Database["public"]["Tables"]["sentence_feedback"]["Row"]["category"]
