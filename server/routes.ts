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

export function buildSystemPrompt(profile: any, recentCheckins: any[]) {
  let prompt = `You are Milo, a warm and compassionate mental wellness companion 
inside the FocusMind app.

════════════════════════════════════
🚨 ABSOLUTE RULE — READ THIS FIRST
════════════════════════════════════
You MUST ONLY respond to topics related to mental wellness.
You MUST REFUSE everything else — no exceptions, no matter how 
the user phrases it or insists.

Refuse and redirect ANY question about:
cooking, recipes, food, weather, sports, coding, technology, 
science, math, history, politics, news, entertainment, travel, 
finance, relationships advice unrelated to emotional health, 
or ANY general knowledge topic.

When refusing, always say:
"I'm here specifically for your mental wellness journey. I'm not 
the best resource for that — but I'd love to support you with 
stress, sleep, emotions, or personal growth. What's on your mind?"

Few-shot examples (learn from these):
User: "What is a pasta recipe?"
Milo: "I'm here specifically for your mental wellness journey..."

User: "Who won the World Cup?"
Milo: "I'm here specifically for your mental wellness journey..."

User: "How do I code a website?"
Milo: "I'm here specifically for your mental wellness journey..."

════════════════════════════════════
✅ ALLOWED TOPICS ONLY
════════════════════════════════════
You may ONLY respond to:
- Mental health and emotional wellbeing
- Stress, anxiety, and overwhelm
- Sleep and relaxation
- Mindfulness and meditation
- Habits, focus, motivation, and burnout
- Emotional regulation and resilience
- Personal growth and self-improvement

════════════════════════════════════
🚨 CRISIS PROTOCOL — HIGHEST PRIORITY
════════════════════════════════════
If the user expresses suicidal thoughts, self-harm, or any 
mental health emergency, IMMEDIATELY respond ONLY with:

"It sounds like you're going through something really serious, 
and I want you to get the right support. Please reach out to a 
crisis line — in the US, you can call or text 988 (Suicide & 
Crisis Lifeline), available 24/7. You are not alone."

Do NOT offer wellness tips in a crisis. Safety comes first.

════════════════════════════════════
💬 HOW TO RESPOND
════════════════════════════════════
- Always validate the user's feelings BEFORE offering advice
- Keep responses to 2–3 short paragraphs maximum
- Use a warm, calm, human, non-judgmental tone
- Never use clinical or robotic language
- Never diagnose or label any condition
- Never replace professional therapy or medical advice
- If distress seems serious or persistent, gently say:
  "It might also be worth speaking with a therapist — 
  you deserve that level of care and support."

════════════════════════════════════
🛠 FOCUSMIND TOOLS — USE CONTEXTUALLY
════════════════════════════════════
Suggest ONE tool at a time, only when it naturally fits.
Briefly explain why it helps. Never dump a list of tools.

| User Situation              | Recommend              |
|-----------------------------|------------------------|
| Acute anxiety or panic      | Box breathing          |
| Feeling disconnected        | 5-4-3-2-1 grounding    |
| Physical tension            | Body scan meditation   |
| Negative thought spirals    | Gratitude journaling   |
| Stress or overstimulation   | Nature visualization   |
| General breathwork need     | Guided breathing       |

════════════════════════════════════
🎯 YOUR NORTH STAR
════════════════════════════════════
Help every user feel heard, grounded, and capable — 
one small, gentle step at a time.`;

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

// Response validator - Generic check: response must contain wellness content
export function isResponseOnTopic(response: string): boolean {
  // Core wellness keywords that SHOULD appear in valid responses
  const wellnessKeywords = [
    "stress", "anxiety", "sleep", "mental", "wellness", "mood", 
    "emotion", "mindfulness", "meditation", "breathing", "panic",
    "overwhelm", "grounding", "journaling", "resilience", "burnout",
    "focus", "relax", "calm", "ground", "therapy", "therapeutic",
    "emotional", "wellbeing", "mindful", "exercise", "workout",
    "hobby", "self-care", "relaxation", "comfort", "support",
    "healthy", "feel", "feeling", "felt", "help", "understand",
    "listen", "hear", "journaling", "practice", "technique",
    "tip", "habit", "growth", "improvement", "manage", "manage"
  ];

  // Refusal message indicator - if model refused, it's on-topic
  const refusalIndicators = [
    "i'm here specifically for your mental wellness",
    "specifically for your mental wellness journey",
    "not the best resource",
    "would love to support you with",
    "stress, sleep, emotions, or personal growth"
  ];

  const lowerResponse = response.toLowerCase();

  // If it's a proper refusal, it's valid (model refused correctly)
  const isRefusal = refusalIndicators.some(indicator => lowerResponse.includes(indicator));
  if (isRefusal) {
    console.log(`[Validation] Response is proper refusal - VALID`);
    return true;
  }

  // Count wellness keywords in response
  let wellnessScore = 0;
  wellnessKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerResponse.match(regex) || [];
    wellnessScore += matches.length;
  });

  // If response has meaningful wellness content, it's valid
  const isWellnessRelated = wellnessScore >= 2; // At least 2 wellness keyword mentions
  
  console.log(`[Validation] Wellness score: ${wellnessScore}, Valid: ${isWellnessRelated}, Length: ${response.length}`);

  return isWellnessRelated;
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

  // Test endpoint
  app.get("/api/test", (req, res) => {
    res.json({ message: "Backend is working" });
  });

  // Contact Form Route
  app.post("/api/contact", (req, res) => {
    console.log("=== Contact endpoint hit ===");
    console.log("Request body:", req.body);
    
    try {
      const { name, email, subject, message } = req.body;
      
      console.log("Extracted fields:", { name, email, subject, message });
      
      if (!name || !email || !subject || !message) {
        console.log("Missing fields detected");
        return res.status(400).json({ message: "All fields are required." });
      }
      
      console.log("Contact form submission successful");
      return res.status(200).json({ message: "Thank you! Your message has been received. We'll get back to you soon." });
    } catch (err) {
      console.error("Contact form error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ message: "Failed to send message. Please try again.", error: errorMessage });
    }
  });

  // Email Subscribe Route
  app.post("/api/subscribe", (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required." });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address." });
      }

      console.log("Newsletter subscription:", { email, timestamp: new Date() });

      // Send welcome email
      const emailHtml = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f0f14; color: #e5e5e7;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #c9a6ff; font-size: 28px; margin: 0; font-weight: 600;">Welcome to FocusMind</h1>
          </div>
          
          <div style="background: #141420; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 30px; margin-bottom: 30px;">
            <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 16px 0;">Hello!</h2>
            <p style="font-size: 15px; line-height: 1.6; color: #b0b0be; margin: 0 0 20px 0;">
              Thank you for subscribing to FocusMind! We're excited to have you as part of our wellness community.
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #b0b0be; margin: 0 0 20px 0;">
              You'll receive updates about new features, wellness tips, and insights to help you live clearer and lighter.
            </p>
            
            <h3 style="color: #c9a6ff; font-size: 16px; margin: 30px 0 15px 0;">What to expect:</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #b0b0be;">
              <li style="margin-bottom: 10px;">Weekly wellness tips and insights</li>
              <li style="margin-bottom: 10px;">New feature announcements</li>
              <li style="margin-bottom: 10px;">Mental health resources and guidance</li>
              <li style="margin-bottom: 10px;">Special offers and early access</li>
            </ul>
          </div>

          <div style="text-align: center; margin-bottom: 40px;">
            <a href="https://focusmind.app" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #9b6dff, #7c4dff); color: white; text-decoration: none; border-radius: 20px; font-weight: 500; font-size: 14px;">
              Open FocusMind
            </a>
          </div>

          <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; text-align: center;">
            <p style="font-size: 12px; color: #6b6b80; margin: 0;">
              © 2026 FocusMind. Feel clearer, live lighter.
            </p>
            <p style="font-size: 12px; color: #6b6b80; margin: 10px 0 0 0;">
              You received this email because you subscribed to our newsletter.
            </p>
          </div>
        </div>
      `;

      // Note: In production, you would send this email using a service like SendGrid, Nodemailer, etc.
      // For now, we'll just log it and acknowledge the subscription
      console.log("Welcome email content logged for:", email);

      return res.status(200).json({ 
        message: "Thank you for subscribing! Check your email for a welcome message." 
      });
    } catch (err) {
      console.error("Subscribe error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ message: "Failed to subscribe. Please try again.", error: errorMessage });
    }
  });
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
        // Extract just the YYYY-MM-DD part from the forDate string
        const dateMatch = forDate.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          const [, dateStr] = dateMatch;
          // Create a date at noon UTC to avoid timezone shift issues
          // This ensures the date part stays consistent regardless of timezone
          const [year, month, day] = dateStr.split('-').map(Number);
          checkinDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        } else {
          checkinDate = new Date(forDate);
        }
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

      // Get recent check-ins to understand patterns
      const recentCheckins = await storage.getCheckins(userId);
      const last7Checkins = recentCheckins.slice(0, 7);
      
      // Calculate trends
      const avgMood = last7Checkins.length > 0 
        ? (last7Checkins.reduce((sum, c) => sum + c.moodScore, 0) / last7Checkins.length).toFixed(1)
        : checkin.moodScore;
      const avgStress = last7Checkins.length > 0 
        ? (last7Checkins.reduce((sum, c) => sum + c.stressLevel, 0) / last7Checkins.length).toFixed(1)
        : checkin.stressLevel;
      const avgSleep = last7Checkins.length > 0 
        ? (last7Checkins.reduce((sum, c) => sum + c.sleepHours, 0) / last7Checkins.length).toFixed(1)
        : checkin.sleepHours;

      const prompt = `You are a compassionate wellness advisor. Analyze the check-in data below and respond in exactly this format:

TODAY'S DATA:
Mood: ${checkin.moodScore}/10, Sleep: ${checkin.sleepHours}h, Stress: ${checkin.stressLevel}/10
Notes: ${checkin.notes || "None"}

7-DAY AVERAGE:
Mood: ${avgMood}/10, Stress: ${avgStress}/10, Sleep: ${avgSleep}h

RESPOND WITH THIS EXACT FORMAT (DO NOT DEVIATE):

### WELLNESS INSIGHT
[Write 2-3 sentences of supportive, actionable insight based on their current mood, stress, and sleep. Be warm and encouraging.]

### SUGGESTED ACTIVITIES
Activity 1: [Name of hobby/activity that would help], because [specific reason related to their mood/stress/sleep]
Activity 2: [Name of hobby/activity that would help], because [specific reason related to their mood/stress/sleep]
Activity 3: [Name of hobby/activity that would help], because [specific reason related to their mood/stress/sleep]

Remember: Suggest calming activities for high stress, energizing activities for low mood, and relaxing activities for poor sleep.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 400,
      });

      const analysis = response.choices[0]?.message?.content || "Could not generate analysis.";
      res.json({ analysis });
    } catch (error) {
      console.error("AI Analysis error:", error);
      res.status(500).json({ message: "Failed to generate analysis" });
    }
  });

  // AI Suggestions Route - Analyze checkin and exercise data to provide personalized suggestions
  app.post("/api/ai/suggestions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const { checkinData, exerciseHistory } = req.body;

      const prompt = `You are a wellness coach analyzing a user's check-in data and exercise history to provide personalized suggestions.

${checkinData ? `
CHECK-IN DATA:
- Mood Score: ${checkinData.moodScore}/10
- Sleep Hours: ${checkinData.sleepHours}
- Stress Level: ${checkinData.stressLevel}/10
- Notes: ${checkinData.notes || "None"}
` : ""}

${exerciseHistory && exerciseHistory.length > 0 ? `
COMPLETED EXERCISES: ${exerciseHistory.join(", ")}
` : ""}

Provide a JSON response with EXACTLY this structure (no additional fields):
{
  "dailyTip": "A brief, actionable wellness tip (1-2 sentences) based on their current state",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Area to improve 1", "Area to improve 2"],
  "recommendedExercises": [
    {
      "name": "Exercise Name",
      "reason": "Why this helps based on their data",
      "priority": "high|medium|low"
    }
  ]
}

Make recommendations based on their mood, stress, sleep quality, and exercise history. Return ONLY valid JSON, no other text.`;

      console.log("Calling OpenAI for suggestions...");
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 600,
      });

      let responseText = response.choices[0]?.message?.content || "{}";
      console.log("Raw OpenAI response:", responseText);
      
      // Extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }

      console.log("Extracted response:", responseText);
      
      let suggestions;
      try {
        suggestions = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        // Return default suggestions if parsing fails
        suggestions = {
          dailyTip: "Keep up the great work on your wellness journey!",
          strengths: ["You're tracking your wellness"],
          improvements: ["Continue building healthy habits"],
          recommendedExercises: [{ name: "Breathing Exercise", reason: "Helps with stress management", priority: "medium" }]
        };
      }

      console.log("Final suggestions:", suggestions);
      res.json(suggestions);
    } catch (error) {
      console.error("AI Suggestions error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        error: "Failed to generate suggestions",
        details: errorMessage,
        dailyTip: "Keep up the great work on your wellness journey!",
        strengths: ["You're tracking your wellness"],
        improvements: ["Continue building healthy habits"],
        recommendedExercises: [{ name: "Breathing Exercise", reason: "Helps with stress management", priority: "medium" }]
      });
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
        model: "gpt-4o-mini",
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

  return httpServer;
}
