import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { chatStorage } from "./storage";
import { isAuthenticated } from "../auth/replitAuth";
import { buildSystemPrompt, isResponseOnTopic } from "../../routes";
import { storage } from "../../storage";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export function registerChatRoutes(app: Express): void {
  // Get all conversations for authenticated user
  app.get("/api/chat/conversations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      // Use the dedicated method that filters by userId
      const userConversations = await chatStorage.getConversationsByUser(userId);
      res.json(userConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get single conversation with messages
  app.get("/api/chat/conversations/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(String(req.params.id));
      const conversation = await chatStorage.getConversation(id);
      if (!conversation || (conversation as any).userId !== userId) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Create new conversation for authenticated user
  app.post("/api/chat/conversations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { title } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat", userId);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/chat/conversations/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(String(req.params.id));
      const conversation = await chatStorage.getConversation(id);
      if (!conversation || (conversation as any).userId !== userId) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Send message and get AI response (streaming)
  app.post("/api/chat/:id/messages", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const conversationId = parseInt(String(req.params.id));
      const { content } = req.body;

      // Verify conversation belongs to user
      const conversation = await chatStorage.getConversation(conversationId);
      if (!conversation || (conversation as any).userId !== userId) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Save user message
      await chatStorage.createMessage(conversationId, "user", content);

      // ═══ PRE-SCREEN: Check if user's message is wellness-related ═══
      const REFUSAL_MSG = "I'm here specifically for your mental wellness journey. I'm not the best resource for that but I'd love to support you with stress, sleep, emotions, or personal growth. What's on your mind? 💚";
      
      const topicCheckResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a strict topic classifier. Respond ONLY with "yes" or "no".
Is the following user message related to ANY of these topics: mental health, emotional wellbeing, stress, anxiety, sleep, relaxation, mindfulness, meditation, habits, focus, motivation, burnout, emotional regulation, resilience, personal growth, self-improvement, therapy, greetings/hellos, or asking about who you are?

Respond "yes" if the message is about any of those topics, or is a greeting, or asks about you.
Respond "no" if it is about anything else (cooking, weather, sports, coding, science, math, history, politics, news, entertainment, travel, finance, recipes, technology, general knowledge, etc).`
          },
          { role: "user", content: content }
        ],
        max_completion_tokens: 5,
      });

      const topicCheck = (topicCheckResponse.choices[0]?.message?.content || "").trim().toLowerCase();
      console.log(`[Topic Check] User: "${content.slice(0, 80)}" → Result: "${topicCheck}"`);

      // Set up SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // If message is off-topic, immediately refuse without calling OpenAI for a full response
      if (topicCheck !== "yes") {
        console.log("[BLOCKED] Off-topic message detected. Sending refusal.");
        await chatStorage.createMessage(conversationId, "assistant", REFUSAL_MSG);
        res.write(`data: ${JSON.stringify({ content: REFUSAL_MSG })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }

      // ═══ ON-TOPIC: Proceed with full AI response ═══
      // Get conversation history for context
      const messages = await chatStorage.getMessagesByConversation(conversationId);
      
      // Build system prompt with user profile and recent checkins
      const userProfile = await storage.getUserProfile(userId);
      const userCheckins = await storage.getCheckins(userId);
      const systemPrompt = buildSystemPrompt(userProfile, userCheckins);
      
      // Build messages: system prompt + conversation history
      const chatMessages: any[] = [
        {
          role: "system",
          content: systemPrompt,
        },
      ];
      
      messages.forEach((m) => {
        chatMessages.push({
          role: m.role as "user" | "assistant",
          content: m.content,
        });
      });

      console.log("[Chat] On-topic. Sending to OpenAI with", chatMessages.length, "messages.");

      // Stream response from OpenAI
      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        stream: true,
        max_completion_tokens: 2048,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Save assistant message
      await chatStorage.createMessage(conversationId, "assistant", fullResponse);

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      // Check if headers already sent (SSE streaming started)
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });
}

