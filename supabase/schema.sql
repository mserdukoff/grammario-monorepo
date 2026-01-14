-- =============================================================================
-- Grammario Database Schema
-- =============================================================================
-- Run this in your Supabase SQL Editor to set up the database.
-- 
-- Prerequisites:
-- 1. Create a new Supabase project
-- 2. Go to SQL Editor and run this script
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS TABLE
-- =============================================================================
-- Core user profile, synced with Supabase Auth

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    
    -- Subscription
    is_pro BOOLEAN DEFAULT FALSE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
    subscription_ends_at TIMESTAMPTZ,
    
    -- Gamification
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    total_analyses INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe ON public.users(stripe_customer_id);

-- =============================================================================
-- ANALYSES TABLE
-- =============================================================================
-- Stores all sentence analyses with full NLP data

CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Core data
    text TEXT NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('it', 'es', 'de', 'ru', 'tr')),
    translation TEXT,
    
    -- Full analysis stored as JSONB (flexible, queryable)
    nodes JSONB NOT NULL,
    pedagogical_data JSONB,
    
    -- Metadata
    is_favorite BOOLEAN DEFAULT FALSE,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analyses_user_date ON public.analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_user_language ON public.analyses(user_id, language);
CREATE INDEX IF NOT EXISTS idx_analyses_user_favorite ON public.analyses(user_id, is_favorite) WHERE is_favorite = TRUE;

-- =============================================================================
-- VOCABULARY TABLE
-- =============================================================================
-- Saved words for spaced repetition learning

CREATE TABLE IF NOT EXISTS public.vocabulary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
    
    word TEXT NOT NULL,
    lemma TEXT NOT NULL,
    translation TEXT,
    language TEXT NOT NULL CHECK (language IN ('it', 'es', 'de', 'ru', 'tr')),
    part_of_speech TEXT,
    context TEXT, -- The sentence it came from
    
    -- Spaced repetition (SM-2 algorithm)
    mastery INTEGER DEFAULT 0 CHECK (mastery >= 0 AND mastery <= 100),
    ease_factor REAL DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    next_review DATE,
    last_reviewed TIMESTAMPTZ,
    review_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vocabulary_user ON public.vocabulary(user_id, language);
CREATE INDEX IF NOT EXISTS idx_vocabulary_review ON public.vocabulary(user_id, next_review) WHERE next_review IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vocabulary_mastery ON public.vocabulary(user_id, mastery);

-- =============================================================================
-- DAILY GOALS TABLE
-- =============================================================================
-- Tracks daily learning goals

CREATE TABLE IF NOT EXISTS public.daily_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    target INTEGER NOT NULL DEFAULT 5,
    completed INTEGER DEFAULT 0,
    is_achieved BOOLEAN DEFAULT FALSE,
    
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON public.daily_goals(user_id, date DESC);

-- =============================================================================
-- ACHIEVEMENTS TABLE
-- =============================================================================
-- Static achievement definitions

CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 100,
    requirement_type TEXT CHECK (requirement_type IN ('analyses', 'streak', 'vocabulary', 'level', 'languages')),
    requirement_value INTEGER
);

-- =============================================================================
-- USER ACHIEVEMENTS TABLE
-- =============================================================================
-- Tracks which achievements users have unlocked

CREATE TABLE IF NOT EXISTS public.user_achievements (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (user_id, achievement_id)
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Users can only access their own data

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Analyses table policies
CREATE POLICY "Users can view own analyses" ON public.analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON public.analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON public.analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON public.analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Vocabulary table policies
CREATE POLICY "Users can view own vocabulary" ON public.vocabulary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary" ON public.vocabulary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulary" ON public.vocabulary
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vocabulary" ON public.vocabulary
    FOR DELETE USING (auth.uid() = user_id);

-- Daily goals table policies
CREATE POLICY "Users can view own daily goals" ON public.daily_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily goals" ON public.daily_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily goals" ON public.daily_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- User achievements table policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements are readable by everyone (they're static definitions)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements are viewable by all" ON public.achievements
    FOR SELECT USING (true);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- SEED DATA: Achievements
-- =============================================================================

INSERT INTO public.achievements (id, name, description, icon, xp_reward, requirement_type, requirement_value) VALUES
    ('first_analysis', 'First Steps', 'Complete your first sentence analysis', '🎯', 50, 'analyses', 1),
    ('analyses_10', 'Getting Started', 'Analyze 10 sentences', '📝', 100, 'analyses', 10),
    ('analyses_50', 'Dedicated Learner', 'Analyze 50 sentences', '📚', 250, 'analyses', 50),
    ('analyses_100', 'Grammar Enthusiast', 'Analyze 100 sentences', '🏆', 500, 'analyses', 100),
    ('analyses_500', 'Linguistic Master', 'Analyze 500 sentences', '👑', 1000, 'analyses', 500),
    ('streak_3', 'Consistent', 'Maintain a 3-day streak', '🔥', 75, 'streak', 3),
    ('streak_7', 'Week Warrior', 'Maintain a 7-day streak', '💪', 150, 'streak', 7),
    ('streak_30', 'Monthly Champion', 'Maintain a 30-day streak', '🌟', 500, 'streak', 30),
    ('streak_100', 'Centurion', 'Maintain a 100-day streak', '💎', 2000, 'streak', 100),
    ('vocab_25', 'Word Collector', 'Save 25 vocabulary words', '📖', 100, 'vocabulary', 25),
    ('vocab_100', 'Dictionary Builder', 'Save 100 vocabulary words', '📕', 300, 'vocabulary', 100),
    ('level_5', 'Rising Star', 'Reach level 5', '⭐', 200, 'level', 5),
    ('level_10', 'Expert', 'Reach level 10', '🌙', 500, 'level', 10),
    ('polyglot_2', 'Bilingual', 'Analyze sentences in 2 languages', '🌍', 150, 'languages', 2),
    ('polyglot_5', 'Polyglot', 'Analyze sentences in all 5 languages', '🌏', 500, 'languages', 5)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    xp_reward = EXCLUDED.xp_reward,
    requirement_type = EXCLUDED.requirement_type,
    requirement_value = EXCLUDED.requirement_value;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
