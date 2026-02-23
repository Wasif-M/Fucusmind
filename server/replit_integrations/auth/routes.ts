import type { Express } from "express";
import passport from "passport";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { storage as profileStorage } from "../../storage";
import { insertUserProfileSchema } from "@shared/schema";
import { z } from "zod";

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await authStorage.getUser(userId);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      const { passwordHash: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    displayName: z.string().min(1),
    primaryGoal: z.string().optional(),
    stressFrequency: z.string().optional(),
    sleepQuality: z.string().optional(),
    exerciseExperience: z.string().optional(),
    preferredTime: z.string().optional(),
    focusAreas: z.array(z.string()).optional(),
    age: z.coerce.number().optional(),
    moodGoal: z.number().optional(),
    sleepGoal: z.number().optional(),
    stressGoal: z.number().optional(),
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const body = registerSchema.parse(req.body);
      const existing = await authStorage.getUserByEmail(body.email);
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists." });
      }
      const user = await authStorage.createUser({
        email: body.email,
        password: body.password,
        firstName: body.displayName.split(/\s+/)[0] ?? body.displayName,
        lastName: body.displayName.split(/\s+/).slice(1).join(" ") || undefined,
      });
      const profileData = insertUserProfileSchema.safeParse({
        displayName: body.displayName,
        email: body.email,
        age: body.age,
        primaryGoal: body.primaryGoal,
        stressFrequency: body.stressFrequency,
        sleepQuality: body.sleepQuality,
        exerciseExperience: body.exerciseExperience,
        preferredTime: body.preferredTime,
        focusAreas: body.focusAreas,
        moodGoal: body.moodGoal,
        sleepGoal: body.sleepGoal,
        stressGoal: body.stressGoal,
      });
      if (profileData.success) {
        await profileStorage.createUserProfile({ ...profileData.data, userId: user.id });
      }
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed after signup" });
        res.status(201).json({ redirect: "/chat", user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      throw err;
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message ?? "Invalid email or password" });
      req.login(user, (loginErr) => {
        if (loginErr) return res.status(500).json({ message: "Login failed" });
        const { passwordHash: _, ...safeUser } = user;
        res.json({ redirect: "/chat", user: safeUser });
      });
    })(req, res, next);
  });
}
