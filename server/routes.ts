import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { chatStorage } from "./replit_integrations/chat/storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertUserProfileSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function buildSystemPrompt(profile: any, recentCheckins: any[]) {
  let prompt = `You are a compassionate, knowledgeable mental wellness companion within the FocusMind app. You provide warm, supportive guidance while being conversational and approachable. Keep responses concise (2-4 paragraphs max). Never diagnose medical conditions or replace professional therapy. Suggest FocusMind's grounding tools (breathing exercises, meditation, 5-4-3-2-1 technique, box breathing, body scan, gratitude journal, nature visualization) when relevant.`;

  if (profile) {
    prompt += `\n\nUser Profile:`;
    if (profile.displayName) prompt += `\n- Name: ${profile.displayName}`;
    if (profile.primaryGoal) prompt += `\n- Primary wellness goal: ${profile.primaryGoal}`;
    if (profile.stressFrequency) prompt += `\n- How often they feel stressed: ${profile.stressFrequency}`;
    if (profile.sleepQuality) prompt += `\n- Sleep quality: ${profile.sleepQuality}`;
    if (profile.exerciseExperience) prompt += `\n- Mindfulness experience: ${profile.exerciseExperience}`;
    if (profile.preferredTime) prompt += `\n- Preferred practice time: ${profile.preferredTime}`;
    if (profile.focusAreas?.length) prompt += `\n- Focus areas: ${profile.focusAreas.join(", ")}`;
    prompt += `\n\nPersonalize your responses based on this profile. Address them by name occasionally. Tailor suggestions to their goals and experience level.`;
  }

  if (recentCheckins.length > 0) {
    prompt += `\n\nRecent check-in data (last ${recentCheckins.length}):`;
    recentCheckins.slice(0, 5).forEach((c, i) => {
      const date = new Date(c.createdAt).toLocaleDateString();
      prompt += `\n- ${date}: Mood ${c.moodScore}/10, Sleep ${c.sleepHours}h, Stress ${c.stressLevel}/10${c.notes ? `, Notes: "${c.notes}"` : ""}`;
    });
    prompt += `\n\nUse this data to provide contextual, empathetic responses. Reference trends you notice when appropriate.`;
  }

  return prompt;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Setup Chat
  registerChatRoutes(app);

  // Checkins Routes
  app.get(api.checkins.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const checkins = await storage.getCheckins(userId);
    res.json(checkins);
  });

  app.post(api.checkins.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const { forDate, ...body } = req.body;
      const input = api.checkins.create.input.parse(body);
      const userId = (req.user as any).id;

      let checkinDate: Date | undefined;
      if (forDate) {
        checkinDate = new Date(forDate);
        const existing = await storage.getCheckinForDate(userId, checkinDate);
        if (existing) {
          return res.status(400).json({ message: "A check-in already exists for that day." });
        }
      } else {
        const existing = await storage.getCheckinToday(userId);
        if (existing) {
          return res.status(400).json({ message: "You've already completed today's check-in." });
        }
      }

      const checkinData = checkinDate
        ? { ...input, userId, createdAt: checkinDate }
        : { ...input, userId };
      const checkin = await storage.createCheckin(checkinData);
      res.status(201).json(checkin);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Exercise Completions Routes
  app.get(api.exercises.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const completions = await storage.getExerciseCompletions(userId);
    res.json(completions);
  });

  app.post(api.exercises.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.exercises.create.input.parse(req.body);
      const userId = (req.user as any).id;
      const existing = await storage.getExerciseCompletionToday(userId, input.exerciseType);
      if (existing) {
        return res.status(200).json(existing);
      }
      const completion = await storage.createExerciseCompletion({ ...input, userId });
      res.status(201).json(completion);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.exercises.resetToday.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const userId = (req.user as any).id;
      const offsetMin = parseInt(req.query.tzOffset as string) || new Date().getTimezoneOffset();
      const now = new Date();
      const clientNow = new Date(now.getTime() - offsetMin * 60 * 1000);
      const clientDayStart = new Date(clientNow);
      clientDayStart.setUTCHours(0, 0, 0, 0);
      const serverDayStart = new Date(clientDayStart.getTime() + offsetMin * 60 * 1000);
      await storage.resetTodayCompletions(userId, serverDayStart);
      res.json({ message: "Today's exercises have been reset." });
    } catch (err) {
      throw err;
    }
  });

  // User Profile Routes
  app.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const profile = await storage.getUserProfile(userId);
    res.json(profile || null);
  });

  app.post("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const userId = (req.user as any).id;
      const existing = await storage.getUserProfile(userId);
      if (existing) {
        return res.status(400).json({ message: "Profile already exists." });
      }
      const profile = await storage.createUserProfile({ ...req.body, userId });
      res.status(201).json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const userId = (req.user as any).id;
      const updateSchema = insertUserProfileSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const updated = await storage.updateUserProfile(userId, validatedData);
      if (!updated) return res.status(404).json({ message: "Profile not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Exercise Favorites Routes
  app.get("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const favorites = await storage.getFavorites(userId);
    res.json(favorites);
  });

  app.post("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const { exerciseType } = req.body;
    const favorite = await storage.addFavorite(userId, exerciseType);
    res.status(201).json(favorite);
  });

  app.delete("/api/favorites/:exerciseType", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    await storage.removeFavorite(userId, req.params.exerciseType);
    res.status(204).send();
  });

  // Exercise Settings Routes
  app.get("/api/exercise-settings", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const settings = await storage.getExerciseSettings(userId);
    res.json(settings || { breathingDuration: 4, difficulty: "beginner", hapticEnabled: true });
  });

  app.patch("/api/exercise-settings", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const settings = await storage.upsertExerciseSettings(userId, req.body);
    res.json(settings);
  });

  // Saved Responses Routes
  app.get("/api/saved-responses", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const responses = await storage.getSavedResponses(userId);
    res.json(responses);
  });

  app.post("/api/saved-responses", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const { content, conversationId } = req.body;
    const saved = await storage.saveResponse(userId, content, conversationId);
    res.status(201).json(saved);
  });

  app.delete("/api/saved-responses/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    await storage.deleteSavedResponse(userId, parseInt(req.params.id));
    res.status(204).send();
  });

  // Goals Routes
  app.get("/api/goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const goals = await storage.getGoals(userId);
    res.json(goals);
  });

  app.post("/api/goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const goal = await storage.createGoal({ ...req.body, userId });
    res.status(201).json(goal);
  });

  app.patch("/api/goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const goal = await storage.updateGoal(userId, parseInt(req.params.id), req.body);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json(goal);
  });

  app.delete("/api/goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    await storage.deleteGoal(userId, parseInt(req.params.id));
    res.status(204).send();
  });

  // Exercise Sessions Routes
  app.post("/api/exercise-sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const { exerciseType, durationSeconds } = req.body;
    const session = await storage.createExerciseSession({ userId, exerciseType, durationSeconds });
    res.status(201).json(session);
  });

  app.get("/api/exercise-sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const sessions = await storage.getExerciseSessions(userId);
    res.json(sessions);
  });

  // AI Analysis Route
  app.post(api.ai.analyze.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const { checkinId } = req.body;
      const checkin = await storage.getCheckin(checkinId);
      
      if (!checkin) return res.status(404).json({ message: "Check-in not found" });

      // Only allow analyzing own checkins
      const userId = (req.user as any).id;
      if (checkin.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const prompt = `
        Analyze the following mental wellness check-in:
        Mood Score: ${checkin.moodScore}/10
        Sleep Hours: ${checkin.sleepHours}
        Stress Level: ${checkin.stressLevel}/10
        Notes: ${checkin.notes || "None"}
        
        Provide a brief, supportive, and actionable insight (max 3 sentences) to help the user feel better or maintain their wellness.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 150,
      });

      const analysis = response.choices[0]?.message?.content || "Could not generate analysis.";
      res.json({ analysis });
    } catch (error) {
      console.error("AI Analysis error:", error);
      res.status(500).json({ message: "Failed to generate analysis" });
    }
  });

  // Personalized Chat - Send message with user context
  app.post("/api/chat/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;
      const userId = (req.user as any).id;

      const conv = await chatStorage.getConversation(conversationId);
      if (!conv || conv.userId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      await chatStorage.createMessage(conversationId, "user", content);

      const [profile, checkins, existingMessages] = await Promise.all([
        storage.getUserProfile(userId),
        storage.getCheckins(userId),
        chatStorage.getMessagesByConversation(conversationId),
      ]);

      const systemPrompt = buildSystemPrompt(profile, checkins);
      const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemPrompt },
        ...existingMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-store, no-transform, must-revalidate",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        "Content-Encoding": "none",
      });
      if (res.socket) {
        res.socket.setNoDelay(true);
        res.socket.setKeepAlive(true);
      }

      const padding = `:${" ".repeat(2048)}\n\n`;
      res.write(padding);

      const stream = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: chatMessages,
        stream: true,
        max_completion_tokens: 1024,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          fullResponse += text;
          const sseData = `data: ${JSON.stringify({ content: text })}\n\n`;
          res.write(sseData);
        }
      }

      await chatStorage.createMessage(conversationId, "assistant", fullResponse);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  // Personalized Chat - Get conversations for current user
  app.get("/api/chat/conversations", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const userId = (req.user as any).id;
      const convs = await chatStorage.getConversationsByUser(userId);
      res.json(convs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Personalized Chat - Create conversation
  app.post("/api/chat/conversations", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const userId = (req.user as any).id;
      const conversation = await chatStorage.createConversation(req.body.title || "New Chat", userId);
      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Personalized Chat - Get conversation with messages (user-scoped)
  app.get("/api/chat/conversations/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as any).id;
      const conversation = await chatStorage.getConversation(id);
      if (!conversation || conversation.userId !== userId) return res.status(404).json({ message: "Not found" });
      const msgs = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages: msgs });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Personalized Chat - Delete conversation (user-scoped)
  app.delete("/api/chat/conversations/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const id = parseInt(req.params.id);
      const userId = (req.user as any).id;
      await chatStorage.deleteConversationForUser(id, userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  return httpServer;
}
