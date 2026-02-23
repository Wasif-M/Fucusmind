import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getApiUrl } from "@/lib/api-url";

import { Send, Plus, Trash2, MessageCircle, Loader2, Bookmark, BookmarkCheck, Mic, MicOff, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useSavedResponses } from "@/hooks/use-saved-responses";
import { motion, AnimatePresence } from "framer-motion";

// FocusMind Logo component
function FocusMindLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="chatLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c9a6ff" />
          <stop offset="100%" stopColor="#9b6dff" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" stroke="url(#chatLogoGradient)" strokeWidth="5" fill="none" />
      <path d="M50 16 C44 28 40 36 50 44 C60 36 56 28 50 16Z" fill="url(#chatLogoGradient)" />
      <path d="M33 26 C29 38 33 46 45 46 C45 38 39 30 33 26Z" fill="url(#chatLogoGradient)" opacity="0.9" />
      <path d="M67 26 C71 38 67 46 55 46 C55 38 61 30 67 26Z" fill="url(#chatLogoGradient)" opacity="0.9" />
      <path d="M20 50 Q30 56 40 50 Q32 60 20 56" fill="url(#chatLogoGradient)" opacity="0.8" />
      <path d="M80 50 Q70 56 60 50 Q68 60 80 56" fill="url(#chatLogoGradient)" opacity="0.8" />
      <path d="M50 50 C50 50 40 62 40 72 C40 79 44.5 84 50 84 C55.5 84 60 79 60 72 C60 62 50 50 50 50Z" fill="url(#chatLogoGradient)" />
    </svg>
  );
}

// Mood-based conversation starters
const MOOD_PROMPTS = {
  anxious: [
    "I'm feeling anxious right now, can you help?",
    "My mind is racing, help me slow down",
    "Guide me through a quick breathing exercise",
  ],
  stressed: [
    "I'm overwhelmed with work stress",
    "Help me prioritize my tasks",
    "What's a quick stress relief technique?",
  ],
  calm: [
    "I want to maintain this peaceful feeling",
    "Suggest a mindfulness practice for today",
    "Help me reflect on what's going well",
  ],
  sad: [
    "I'm feeling down today",
    "Help me shift my perspective",
    "What are some gentle ways to lift my mood?",
  ],
  tired: [
    "I didn't sleep well, help me cope",
    "Give me energy-boosting tips",
    "How can I rest better tonight?",
  ],
};

type MoodType = keyof typeof MOOD_PROMPTS;

interface Message {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  messages?: Message[];
}

export default function Chat() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Saved responses
  const { savedResponses, saveResponse, deleteResponse, isResponseSaved, isSaving } = useSavedResponses();

  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const { data: conversations = [], isLoading: loadingConversations, error: conversationsError } = useQuery<Conversation[]>({
    queryKey: ["/api/chat/conversations"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/chat/conversations");
        return res.json();
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        throw error;
      }
    },
    retry: true,
  });

  const { data: activeConversation, isLoading: loadingMessages, error: messagesError } = useQuery<Conversation>({
    queryKey: ["/api/chat/conversations", activeConversationId],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/chat/conversations/${activeConversationId}`);
        return res.json();
      } catch (error) {
        console.error("Failed to fetch conversation messages:", error);
        throw error;
      }
    },
    enabled: !!activeConversationId,
    retry: true,
  });

  const createConversation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/chat/conversations", { title: "New Chat" });
      return res.json();
    },
    onSuccess: (data: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      setActiveConversationId(data.id);
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/chat/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      if (activeConversationId) {
        setActiveConversationId(null);
      }
    },
  });

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, streamingContent, scrollToBottom]);

  const messages = activeConversation?.messages || [];

  useEffect(() => {
    const timeout = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeout);
  }, [messages.length, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    
    try {
      if (!activeConversationId) {
        console.log("Creating new conversation...");
        const res = await apiRequest("POST", "/api/chat/conversations", { title: input.slice(0, 40) });
        const conv = await res.json();
        console.log("Conversation created:", conv);
        queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
        setActiveConversationId(conv.id);
        await sendToConversation(conv.id, input.trim());
      } else {
        await sendToConversation(activeConversationId, input.trim());
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsStreaming(false);
      setStreamingContent("");
      alert("Failed to send message. Check console for details.");
    }
  };

  const sendToConversation = async (convId: number, content: string) => {
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    const userMessage: Message = { id: Date.now(), conversationId: convId, role: "user", content, createdAt: new Date().toISOString() };

    queryClient.setQueryData<Conversation>(["/api/chat/conversations", convId], (old) => {
      if (!old) {
        return { id: convId, title: content.slice(0, 40), createdAt: new Date().toISOString(), messages: [userMessage] };
      }
      return {
        ...old,
        messages: [...(old.messages || []), userMessage],
      };
    });

    setTimeout(scrollToBottom, 50);

    try {
      const url = getApiUrl(`/api/chat/${convId}/messages`);
      console.log("Sending message to:", url);
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error ${response.status}:`, errorText);
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      if (reader) {
        const processBuffer = () => {
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                if (data.content) {
                  accumulated += data.content;
                  setStreamingContent(accumulated);
                }
                if (data.done) {
                  setIsStreaming(false);
                  setStreamingContent("");
                  queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations", convId] });
                  setTimeout(scrollToBottom, 50);
                  setTimeout(scrollToBottom, 200);
                }
              } catch {}
            }
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          processBuffer();
        }
        if (buffer.trim()) {
          buffer += "\n";
          processBuffer();
        }
      }
    } catch (error) {
      console.error("Error in sendToConversation:", error);
      setIsStreaming(false);
      setStreamingContent("");
      alert("Failed to send message. Check console for details.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const displayName = user?.firstName || user?.email?.split("@")[0] || "there";
  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          className="md:hidden text-[#a0a0b4]"
          onClick={() => setShowSidebar(!showSidebar)}
          data-testid="button-toggle-sidebar"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-[#9b6dff]/20 flex items-center justify-center">
          <FocusMindLogo size={28} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-semibold text-white" data-testid="text-chat-title">FocusMind AI</h3>
          <p className="text-[11px] text-[#6b6b80]">Your personalized wellness companion</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="text-[#a0a0b4]"
          onClick={() => createConversation.mutate()}
          disabled={createConversation.isPending}
          data-testid="button-new-chat"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Sidebar - desktop always, mobile toggle */}
        <div className={`${showSidebar ? 'absolute inset-0 z-20 flex' : 'hidden'} md:relative md:flex flex-col w-[260px] flex-shrink-0 border-r border-white/[0.06] bg-[#0a0a0f]`}>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
            {loadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-[#9b6dff]" />
              </div>
            ) : conversationsError ? (
              <div className="text-[12px] text-red-400 text-center py-8 px-2">Error loading conversations. Please refresh the page.</div>
            ) : conversations.length === 0 ? (
              <p className="text-[12px] text-[#6b6b80] text-center py-8 px-2">No conversations yet. Start a new chat to begin.</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all group ${
                    activeConversationId === conv.id
                      ? "bg-[#9b6dff]/15 text-white"
                      : "text-[#a0a0b4] hover:bg-white/5"
                  }`}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setShowSidebar(false);
                  }}
                  data-testid={`chat-conversation-${conv.id}`}
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[13px] truncate flex-1">{conv.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation.mutate(conv.id);
                    }}
                    className="invisible group-hover:visible text-[#6b6b80] hover:text-red-400 transition-colors"
                    data-testid={`button-delete-chat-${conv.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area - messages + fixed input */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Scrollable messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
            {!hasMessages ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-24 h-24 rounded-full bg-[#9b6dff]/10 flex items-center justify-center mb-5">
                  <FocusMindLogo size={60} />
                </div>
                <h2 className="text-xl font-semibold mb-2" data-testid="text-chat-welcome">Hi {displayName}</h2>
                <p className="text-[14px] text-[#6b6b80] max-w-[360px] mb-6">
                  I'm your personalized wellness companion. Ask me anything about stress management, mindfulness, sleep, or how to make the most of your FocusMind journey.
                </p>
                
                {/* Mood-based prompts */}
                <div className="mb-6 w-full max-w-[500px]">
                  <p className="text-[12px] text-[#6b6b80] mb-3">How are you feeling?</p>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {(Object.keys(MOOD_PROMPTS) as MoodType[]).map((mood) => (
                      <button
                        key={mood}
                        onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                        className={`px-4 py-2 rounded-full text-[12px] capitalize transition-all border ${
                          selectedMood === mood
                            ? "bg-[#9b6dff]/20 border-[#9b6dff]/50 text-[#9b6dff]"
                            : "border-white/[0.08] text-[#a0a0b4] hover:bg-white/5"
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                  
                  <AnimatePresence>
                    {selectedMood && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        {MOOD_PROMPTS[selectedMood].map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => {
                              setInput(prompt);
                              setTimeout(() => inputRef.current?.focus(), 100);
                            }}
                            className="w-full text-left px-4 py-3 rounded-xl text-[12px] text-[#a0a0b4] border border-white/[0.08] transition-all hover:bg-white/5 hover:text-white hover:border-white/15"
                          >
                            {prompt}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Default suggestions */}
                {!selectedMood && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-[400px]">
                    {[
                      "How can I manage my stress better?",
                      "Suggest a grounding exercise for me",
                      "Help me understand my mood patterns",
                      "Tips for better sleep tonight",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInput(suggestion);
                          setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                        className="text-left px-4 py-3 rounded-xl text-[12px] text-[#a0a0b4] border border-white/[0.08] transition-all hover:bg-white/5 hover:text-white hover:border-white/15"
                        data-testid={`button-suggestion-${suggestion.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 md:px-6 py-4 space-y-4 max-w-[900px] mx-auto w-full">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#9b6dff]" />
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      data-testid={`chat-message-${msg.role}-${msg.id}`}
                    >
                      <div
                        className={`relative group ${msg.role === "user" ? "max-w-[80%]" : "w-full"}`}
                      >
                        <div
                          className={`px-4 py-3 rounded-2xl text-[14px] leading-[1.7] ${
                            msg.role === "user"
                              ? "bg-[#9b6dff] text-white rounded-br-md"
                              : "bg-white/[0.06] text-[#d0d0e0] border border-white/[0.06] rounded-bl-md"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1 prose-headings:my-2 prose-strong:text-white prose-a:text-[#9b6dff]">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                        
                        {/* Action buttons for assistant messages */}
                        {msg.role === "assistant" && (
                          <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                if (isResponseSaved(msg.content)) {
                                  const saved = savedResponses.find(r => r.messageContent === msg.content);
                                  if (saved) deleteResponse(saved.id);
                                } else {
                                  saveResponse({ content: msg.content, conversationId: msg.conversationId });
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                              title={isResponseSaved(msg.content) ? "Remove from saved" : "Save response"}
                            >
                              {isResponseSaved(msg.content) ? (
                                <BookmarkCheck className="w-4 h-4 text-[#9b6dff]" />
                              ) : (
                                <Bookmark className="w-4 h-4 text-[#6b6b80]" />
                              )}
                            </button>
                            <button
                              onClick={() => speakText(msg.content)}
                              className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${isSpeaking ? 'text-[#9b6dff]' : 'text-[#6b6b80]'}`}
                              title="Read aloud"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isStreaming && (
                  <div className="flex justify-start" data-testid="chat-message-streaming">
                    <div className="w-full px-4 py-3 rounded-2xl rounded-bl-md text-[14px] leading-[1.7] bg-white/[0.06] text-[#d0d0e0] border border-white/[0.06]">
                      {streamingContent ? (
                        <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1 prose-headings:my-2 prose-strong:text-white prose-a:text-[#9b6dff]">
                          <ReactMarkdown>{streamingContent}</ReactMarkdown>
                        </div>
                      ) : (
                        <span className="inline-block w-2 h-4 bg-[#9b6dff] animate-pulse rounded-sm" />
                      )}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Fixed input at bottom */}
          <div className="flex-shrink-0 px-4 md:px-6 py-3 border-t border-white/[0.06] bg-[#0a0a0f]">
            <div className="flex items-end gap-2 max-w-[900px] mx-auto">
              {/* Voice input button */}
              {('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleVoiceInput}
                  className={`rounded-xl h-[46px] w-[46px] flex-shrink-0 ${
                    isListening ? 'bg-red-500/20 text-red-400' : 'text-[#6b6b80] hover:text-white'
                  }`}
                  title={isListening ? "Stop listening" : "Voice input"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? "Listening..." : "Ask me anything about your wellness..."}
                  rows={1}
                  className={`w-full resize-none bg-white/[0.05] border rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-[#6b6b80] focus:outline-none transition-colors ${
                    isListening ? 'border-red-500/40' : 'border-white/[0.08] focus:border-[#9b6dff]/40'
                  }`}
                  style={{ maxHeight: "120px" }}
                  data-testid="input-chat-message"
                />
              </div>
              <Button
                size="icon"
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="bg-[#9b6dff] hover:bg-[#8a5cf0] text-white rounded-xl h-[46px] w-[46px] flex-shrink-0"
                data-testid="button-send-message"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
