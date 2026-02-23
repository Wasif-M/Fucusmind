import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  age: integer("age"),
  primaryGoal: text("primary_goal"),
  stressFrequency: text("stress_frequency"),
  sleepQuality: text("sleep_quality"),
  exerciseExperience: text("exercise_experience"),
  preferredTime: text("preferred_time"),
  focusAreas: text("focus_areas").array(),
  moodGoal: integer("mood_goal").default(7),
  sleepGoal: integer("sleep_goal").default(8),
  stressGoal: integer("stress_goal").default(3),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, userId: true });
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export const checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), 
  moodScore: integer("mood_score").notNull(),
  sleepHours: integer("sleep_hours").notNull(),
  stressLevel: integer("stress_level").notNull(), 
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCheckinSchema = createInsertSchema(checkins).omit({ id: true, createdAt: true, userId: true });

export type Checkin = typeof checkins.$inferSelect;
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;

export const EXERCISE_TYPES = [
  "breathing",
  "grounding",
  "meditation",
  "box_breathing",
  "body_scan",
  "gratitude",
  "nature",
  "pmr",
  "butterfly_hug",
] as const;

export type ExerciseType = typeof EXERCISE_TYPES[number];

export const exerciseCompletions = pgTable("exercise_completions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  exerciseType: text("exercise_type").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertExerciseCompletionSchema = createInsertSchema(exerciseCompletions).omit({ id: true, completedAt: true, userId: true }).extend({
  exerciseType: z.enum(EXERCISE_TYPES),
});

export type ExerciseCompletion = typeof exerciseCompletions.$inferSelect;
export type InsertExerciseCompletion = z.infer<typeof insertExerciseCompletionSchema>;

// Exercise Favorites
export const exerciseFavorites = pgTable("exercise_favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  exerciseType: text("exercise_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ExerciseFavorite = typeof exerciseFavorites.$inferSelect;

// Exercise Settings (timer customization, difficulty)
export const exerciseSettings = pgTable("exercise_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  breathingDuration: integer("breathing_duration").default(4), // multiplier for breathing phases
  difficulty: text("difficulty").default("beginner"), // beginner, intermediate, advanced
  hapticEnabled: boolean("haptic_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ExerciseSettings = typeof exerciseSettings.$inferSelect;

// Saved Chat Responses
export const savedResponses = pgTable("saved_responses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  messageContent: text("message_content").notNull(),
  conversationId: integer("conversation_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SavedResponse = typeof savedResponses.$inferSelect;

// Goals with Target Dates
export const userGoals = pgTable("user_goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetValue: integer("target_value"),
  currentValue: integer("current_value").default(0),
  goalType: text("goal_type").notNull(), // mood, sleep, stress, exercise, streak
  targetDate: timestamp("target_date"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserGoalSchema = createInsertSchema(userGoals).omit({ id: true, createdAt: true, userId: true, completed: true, currentValue: true });
export type UserGoal = typeof userGoals.$inferSelect;
export type InsertUserGoal = z.infer<typeof insertUserGoalSchema>;

// Session Duration Tracking
export const exerciseSessions = pgTable("exercise_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  exerciseType: text("exercise_type").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export type ExerciseSession = typeof exerciseSessions.$inferSelect;
