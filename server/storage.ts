import { db } from "./db";
import { checkins, exerciseCompletions, userProfiles, exerciseFavorites, exerciseSettings, savedResponses, userGoals, exerciseSessions, type InsertCheckin, type Checkin, type ExerciseCompletion, type InsertExerciseCompletion, type UserProfile, type InsertUserProfile, type ExerciseFavorite, type ExerciseSettings, type SavedResponse, type UserGoal, type InsertUserGoal, type ExerciseSession } from "@shared/schema";
import { eq, desc, and, gte, lt } from "drizzle-orm";

export interface IStorage {
  createCheckin(checkin: InsertCheckin & { userId: string }): Promise<Checkin>;
  getCheckins(userId: string): Promise<Checkin[]>;
  getCheckin(id: number): Promise<Checkin | undefined>;
  getCheckinToday(userId: string): Promise<Checkin | undefined>;
  getCheckinForDate(userId: string, date: Date): Promise<Checkin | undefined>;
  createExerciseCompletion(data: InsertExerciseCompletion & { userId: string }): Promise<ExerciseCompletion>;
  getExerciseCompletions(userId: string): Promise<ExerciseCompletion[]>;
  getExerciseCompletionToday(userId: string, exerciseType: string): Promise<ExerciseCompletion | undefined>;
  resetTodayCompletions(userId: string, clientDayStart: Date): Promise<void>;
  createUserProfile(profile: InsertUserProfile & { userId: string }): Promise<UserProfile>;
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  updateUserProfile(userId: string, data: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  // Exercise Favorites
  getFavorites(userId: string): Promise<ExerciseFavorite[]>;
  addFavorite(userId: string, exerciseType: string): Promise<ExerciseFavorite>;
  removeFavorite(userId: string, exerciseType: string): Promise<void>;
  // Exercise Settings
  getExerciseSettings(userId: string): Promise<ExerciseSettings | undefined>;
  upsertExerciseSettings(userId: string, data: Partial<ExerciseSettings>): Promise<ExerciseSettings>;
  // Saved Responses
  getSavedResponses(userId: string): Promise<SavedResponse[]>;
  saveResponse(userId: string, content: string, conversationId?: number): Promise<SavedResponse>;
  deleteSavedResponse(userId: string, id: number): Promise<void>;
  // Goals
  getGoals(userId: string): Promise<UserGoal[]>;
  createGoal(goal: InsertUserGoal & { userId: string }): Promise<UserGoal>;
  updateGoal(userId: string, id: number, data: Partial<UserGoal>): Promise<UserGoal | undefined>;
  deleteGoal(userId: string, id: number): Promise<void>;
  // Exercise Sessions
  createExerciseSession(data: { userId: string; exerciseType: string; durationSeconds: number }): Promise<ExerciseSession>;
  getExerciseSessions(userId: string): Promise<ExerciseSession[]>;
}

export class DatabaseStorage implements IStorage {
  async createCheckin(checkin: InsertCheckin & { userId: string }): Promise<Checkin> {
    const [newCheckin] = await db.insert(checkins).values(checkin).returning();
    return newCheckin;
  }

  async getCheckins(userId: string): Promise<Checkin[]> {
    return db
      .select()
      .from(checkins)
      .where(eq(checkins.userId, userId))
      .orderBy(desc(checkins.createdAt));
  }

  async getCheckin(id: number): Promise<Checkin | undefined> {
    const [checkin] = await db.select().from(checkins).where(eq(checkins.id, id));
    return checkin;
  }

  async getCheckinToday(userId: string): Promise<Checkin | undefined> {
    // Use UTC to get today's date consistently
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();
    const todayStart = new Date(Date.UTC(year, month, day, 0, 0, 0));
    
    const [existing] = await db
      .select()
      .from(checkins)
      .where(
        and(
          eq(checkins.userId, userId),
          gte(checkins.createdAt, todayStart)
        )
      );
    return existing;
  }

  async getCheckinForDate(userId: string, date: Date): Promise<Checkin | undefined> {
    // Compare using UTC dates to avoid timezone issues
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    
    const dayStart = new Date(Date.UTC(year, month, day, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month, day + 1, 0, 0, 0));
    
    const [existing] = await db
      .select()
      .from(checkins)
      .where(
        and(
          eq(checkins.userId, userId),
          gte(checkins.createdAt, dayStart),
          lt(checkins.createdAt, dayEnd)
        )
      );
    return existing;
  }

  async createExerciseCompletion(data: InsertExerciseCompletion & { userId: string }): Promise<ExerciseCompletion> {
    const [completion] = await db.insert(exerciseCompletions).values(data).returning();
    return completion;
  }

  async getExerciseCompletions(userId: string): Promise<ExerciseCompletion[]> {
    return db
      .select()
      .from(exerciseCompletions)
      .where(eq(exerciseCompletions.userId, userId))
      .orderBy(desc(exerciseCompletions.completedAt));
  }

  async getExerciseCompletionToday(userId: string, exerciseType: string): Promise<ExerciseCompletion | undefined> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [existing] = await db
      .select()
      .from(exerciseCompletions)
      .where(
        and(
          eq(exerciseCompletions.userId, userId),
          eq(exerciseCompletions.exerciseType, exerciseType),
          gte(exerciseCompletions.completedAt, todayStart)
        )
      );
    return existing;
  }

  async resetTodayCompletions(userId: string, clientDayStart: Date): Promise<void> {
    await db
      .delete(exerciseCompletions)
      .where(
        and(
          eq(exerciseCompletions.userId, userId),
          gte(exerciseCompletions.completedAt, clientDayStart)
        )
      );
  }

  async createUserProfile(profile: InsertUserProfile & { userId: string }): Promise<UserProfile> {
    const [newProfile] = await db.insert(userProfiles).values(profile).returning();
    return newProfile;
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async updateUserProfile(userId: string, data: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [updated] = await db.update(userProfiles).set(data).where(eq(userProfiles.userId, userId)).returning();
    return updated;
  }

  // Exercise Favorites
  async getFavorites(userId: string): Promise<ExerciseFavorite[]> {
    return db.select().from(exerciseFavorites).where(eq(exerciseFavorites.userId, userId));
  }

  async addFavorite(userId: string, exerciseType: string): Promise<ExerciseFavorite> {
    const [favorite] = await db.insert(exerciseFavorites).values({ userId, exerciseType }).returning();
    return favorite;
  }

  async removeFavorite(userId: string, exerciseType: string): Promise<void> {
    await db.delete(exerciseFavorites).where(
      and(eq(exerciseFavorites.userId, userId), eq(exerciseFavorites.exerciseType, exerciseType))
    );
  }

  // Exercise Settings
  async getExerciseSettings(userId: string): Promise<ExerciseSettings | undefined> {
    const [settings] = await db.select().from(exerciseSettings).where(eq(exerciseSettings.userId, userId));
    return settings;
  }

  async upsertExerciseSettings(userId: string, data: Partial<ExerciseSettings>): Promise<ExerciseSettings> {
    const existing = await this.getExerciseSettings(userId);
    if (existing) {
      const [updated] = await db.update(exerciseSettings).set(data).where(eq(exerciseSettings.userId, userId)).returning();
      return updated;
    }
    const [created] = await db.insert(exerciseSettings).values({ userId, ...data }).returning();
    return created;
  }

  // Saved Responses
  async getSavedResponses(userId: string): Promise<SavedResponse[]> {
    return db.select().from(savedResponses).where(eq(savedResponses.userId, userId)).orderBy(desc(savedResponses.createdAt));
  }

  async saveResponse(userId: string, content: string, conversationId?: number): Promise<SavedResponse> {
    const [saved] = await db.insert(savedResponses).values({ userId, messageContent: content, conversationId }).returning();
    return saved;
  }

  async deleteSavedResponse(userId: string, id: number): Promise<void> {
    await db.delete(savedResponses).where(and(eq(savedResponses.id, id), eq(savedResponses.userId, userId)));
  }

  // Goals
  async getGoals(userId: string): Promise<UserGoal[]> {
    return db.select().from(userGoals).where(eq(userGoals.userId, userId)).orderBy(desc(userGoals.createdAt));
  }

  async createGoal(goal: InsertUserGoal & { userId: string }): Promise<UserGoal> {
    const [created] = await db.insert(userGoals).values(goal).returning();
    return created;
  }

  async updateGoal(userId: string, id: number, data: Partial<UserGoal>): Promise<UserGoal | undefined> {
    const [updated] = await db.update(userGoals).set(data).where(and(eq(userGoals.id, id), eq(userGoals.userId, userId))).returning();
    return updated;
  }

  async deleteGoal(userId: string, id: number): Promise<void> {
    await db.delete(userGoals).where(and(eq(userGoals.id, id), eq(userGoals.userId, userId)));
  }

  // Exercise Sessions
  async createExerciseSession(data: { userId: string; exerciseType: string; durationSeconds: number }): Promise<ExerciseSession> {
    const [session] = await db.insert(exerciseSessions).values(data).returning();
    return session;
  }

  async getExerciseSessions(userId: string): Promise<ExerciseSession[]> {
    return db.select().from(exerciseSessions).where(eq(exerciseSessions.userId, userId)).orderBy(desc(exerciseSessions.completedAt));
  }
}

export const storage = new DatabaseStorage();
