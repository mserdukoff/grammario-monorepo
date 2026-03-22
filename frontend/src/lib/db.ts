/**
 * Database Operations
 * 
 * All Supabase/PostgreSQL CRUD operations for user data, analyses, and gamification.
 */
import { getSupabaseClient as getClient } from "./supabase/client"
import type { AnalysisResponse } from "./api"
import type { Analysis, Vocabulary, DailyGoal, Achievement, UserAchievement } from "./supabase/database.types"

// Helper to get typed supabase client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSupabaseClient = () => getClient() as any

// XP rewards
export const XP_REWARDS = {
  ANALYSIS: 10,
  FIRST_ANALYSIS_OF_DAY: 20,
  STREAK_BONUS: 5, // Per streak day
  SAVE_VOCABULARY: 5,
  COMPLETE_DAILY_GOAL: 50,
  ACHIEVEMENT_UNLOCK: 100,
}

// === ANALYSIS HISTORY ===

export async function saveAnalysis(
  userId: string,
  analysis: AnalysisResponse
): Promise<string> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: userId,
      text: analysis.metadata.text,
      language: analysis.metadata.language,
      translation: analysis.pedagogical_data?.translation || null,
      nodes: analysis.nodes as unknown as Record<string, unknown>,
      pedagogical_data: analysis.pedagogical_data as unknown as Record<string, unknown> || null,
      difficulty_level: analysis.difficulty?.level || null,
      difficulty_score: analysis.difficulty?.score || null,
      is_favorite: false,
    })
    .select("id")
    .single()

  if (error) throw error
  return data.id
}

export async function getRecentAnalyses(
  userId: string,
  limitCount: number = 20
): Promise<Analysis[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limitCount)

  if (error) throw error
  return data || []
}

export async function getFavoriteAnalyses(userId: string): Promise<Analysis[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_favorite", true)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function toggleFavoriteAnalysis(analysisId: string, isFavorite: boolean) {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase
    .from("analyses")
    .update({ is_favorite: isFavorite })
    .eq("id", analysisId)

  if (error) throw error
}

export async function deleteAnalysis(analysisId: string) {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase
    .from("analyses")
    .delete()
    .eq("id", analysisId)

  if (error) throw error
}

// === VOCABULARY ===

export async function saveVocabulary(
  userId: string,
  word: string,
  lemma: string,
  language: string,
  partOfSpeech: string,
  context?: string,
  analysisId?: string
): Promise<string> {
  const supabase = getSupabaseClient()
  
  // Calculate next review date (tomorrow for new words)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const { data, error } = await supabase
    .from("vocabulary")
    .insert({
      user_id: userId,
      analysis_id: analysisId || null,
      word,
      lemma,
      language,
      part_of_speech: partOfSpeech,
      context: context || null,
      mastery: 0,
      ease_factor: 2.5,
      interval_days: 1,
      next_review: tomorrow.toISOString().split("T")[0],
      review_count: 0,
    })
    .select("id")
    .single()

  if (error) throw error
  return data.id
}

export async function getVocabulary(
  userId: string,
  language?: string
): Promise<Vocabulary[]> {
  const supabase = getSupabaseClient()
  
  let query = supabase
    .from("vocabulary")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  
  if (language) {
    query = query.eq("language", language)
  }
  
  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getVocabularyDueForReview(userId: string): Promise<Vocabulary[]> {
  const supabase = getSupabaseClient()
  const today = new Date().toISOString().split("T")[0]
  
  const { data, error } = await supabase
    .from("vocabulary")
    .select("*")
    .eq("user_id", userId)
    .lte("next_review", today)
    .order("next_review", { ascending: true })

  if (error) throw error
  return data || []
}

export async function updateVocabularyReview(
  vocabId: string,
  quality: number // 0-5 rating of how well user knew it
) {
  const supabase = getSupabaseClient()
  
  // Get current vocabulary item
  const { data: vocab, error: fetchError } = await supabase
    .from("vocabulary")
    .select("*")
    .eq("id", vocabId)
    .single()

  if (fetchError) throw fetchError

  // SM-2 Algorithm
  let easeFactor = vocab.ease_factor
  let interval = vocab.interval_days
  let mastery = vocab.mastery

  if (quality >= 3) {
    // Correct response
    if (vocab.review_count === 0) {
      interval = 1
    } else if (vocab.review_count === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    
    // Update ease factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (easeFactor < 1.3) easeFactor = 1.3
    
    // Increase mastery
    mastery = Math.min(100, mastery + 10)
  } else {
    // Incorrect - reset interval
    interval = 1
    mastery = Math.max(0, mastery - 20)
  }

  // Calculate next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  const { error } = await supabase
    .from("vocabulary")
    .update({
      ease_factor: easeFactor,
      interval_days: interval,
      next_review: nextReview.toISOString().split("T")[0],
      last_reviewed: new Date().toISOString(),
      review_count: vocab.review_count + 1,
      mastery,
    })
    .eq("id", vocabId)

  if (error) throw error
}

export async function deleteVocabulary(vocabId: string) {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase
    .from("vocabulary")
    .delete()
    .eq("id", vocabId)

  if (error) throw error
}

// === GAMIFICATION ===

export async function addXP(userId: string, amount: number): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
  const supabase = getSupabaseClient()
  
  // Get current user
  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("xp, level")
    .eq("id", userId)
    .single()

  if (fetchError) throw fetchError

  const newXP = user.xp + amount
  const newLevel = calculateLevel(newXP)
  const leveledUp = newLevel > user.level

  // Update user
  const { error } = await supabase
    .from("users")
    .update({
      xp: newXP,
      level: newLevel,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) throw error

  return { newXP, newLevel, leveledUp }
}

function calculateLevel(xp: number): number {
  const XP_PER_LEVEL = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000]
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) return i + 1
  }
  return 1
}

export async function incrementTotalAnalyses(userId: string) {
  const supabase = getSupabaseClient()
  
  // Get current count and increment
  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("total_analyses")
    .eq("id", userId)
    .single()

  if (fetchError) throw fetchError

  const { error } = await supabase
    .from("users")
    .update({
      total_analyses: user.total_analyses + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) throw error
}

// === DAILY GOALS ===

export async function getDailyGoal(userId: string): Promise<DailyGoal | null> {
  const supabase = getSupabaseClient()
  const today = new Date().toISOString().split("T")[0]
  
  const { data, error } = await supabase
    .from("daily_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single()

  if (error && error.code !== "PGRST116") throw error // PGRST116 = no rows returned
  return data || null
}

export async function setDailyGoal(userId: string, target: number): Promise<DailyGoal> {
  const supabase = getSupabaseClient()
  const today = new Date().toISOString().split("T")[0]
  
  const { data, error } = await supabase
    .from("daily_goals")
    .upsert({
      user_id: userId,
      date: today,
      target,
      completed: 0,
      is_achieved: false,
    }, { onConflict: "user_id,date" })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function incrementDailyGoalProgress(userId: string): Promise<DailyGoal | null> {
  const supabase = getSupabaseClient()
  const today = new Date().toISOString().split("T")[0]
  
  // Get current goal
  const { data: current, error: fetchError } = await supabase
    .from("daily_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") throw fetchError
  if (!current) return null

  const newCompleted = current.completed + 1
  const isAchieved = newCompleted >= current.target

  const { data, error } = await supabase
    .from("daily_goals")
    .update({
      completed: newCompleted,
      is_achieved: isAchieved,
    })
    .eq("id", current.id)
    .select()
    .single()

  if (error) throw error
  return data
}

// === ACHIEVEMENTS ===

export async function getAchievements(): Promise<Achievement[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("xp_reward", { ascending: true })

  if (error) throw error
  return data || []
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId)

  if (error) throw error
  return data || []
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  
  // Check if already unlocked
  const { data: existing } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId)
    .eq("achievement_id", achievementId)
    .single()

  if (existing) return false // Already unlocked

  const { error } = await supabase
    .from("user_achievements")
    .insert({
      user_id: userId,
      achievement_id: achievementId,
    })

  if (error) throw error
  return true // Newly unlocked
}
