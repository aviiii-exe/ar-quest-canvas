import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHampiGuide, Message } from "@/hooks/useHampiGuide";
import { MarkdownContent } from "./MarkdownContent";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowRight, 
  Sparkles, 
  Map, 
  Star, 
  Compass, 
  RotateCcw,
  Loader2,
  MessageCircle,
  Calendar,
  Route
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  { icon: Calendar, label: "2-Day Itinerary", prompt: "Create a detailed 2-day itinerary for exploring Hampi. Include morning, afternoon, and evening activities with time estimates." },
  { icon: Star, label: "Top 5 Sites", prompt: "What are the top 5 heritage sites I absolutely must visit in Hampi? Tell me what makes each special." },
  { icon: Route, label: "Walking Route", prompt: "Suggest the best walking route to cover the main temples in one day, starting from Virupaksha Temple." },
  { icon: Compass, label: "Hidden Gems", prompt: "What are some lesser-known hidden gems in Hampi that most tourists miss?" },
];

function ChatMessage({ message, isUser }: { message: Message; isUser: boolean }) {
  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}
      >
        {isUser ? (
          <span className="text-xs font-medium">You</span>
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted rounded-tl-sm"
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownContent content={message.content} />
        )}
      </div>
    </div>
  );
}

export function HampiGuideChat() {
  const { messages, isLoading, sendMessage, clearChat } = useHampiGuide();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (!isLoading) {
      sendMessage(prompt);
    }
  };

  return (
    <Card className="min-h-[450px] flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <span className="font-medium">Hampi Guide</span>
            {user && (
              <span className="text-xs text-muted-foreground ml-2">
                • Personalized
              </span>
            )}
          </div>
        </div>
        {messages.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearChat}
            className="gap-1 text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Chat Content */}
      <CardContent className="flex-1 flex flex-col p-0">
        {messages.length === 0 ? (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Welcome to Hampi Guide!</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-2">
              I'm your AI travel companion for Hampi.
              {user ? (
                <span className="block mt-1 text-primary">
                  ✨ I know which sites you've visited and can give personalized recommendations!
                </span>
              ) : (
                <span className="block mt-1">
                  Sign in for personalized recommendations based on your visits.
                </span>
              )}
            </p>
            
            {/* Quick action suggestions */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm mt-4">
              {QUICK_PROMPTS.map((item) => (
                <Button 
                  key={item.label}
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickPrompt(item.prompt)}
                  disabled={isLoading}
                  className="gap-2 h-auto py-2 px-3 text-left justify-start"
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          // Messages list
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} isUser={msg.role === "user"} />
            ))}
            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input 
            ref={inputRef}
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Hampi heritage sites..." 
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-full bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          <Button 
            type="submit"
            disabled={isLoading || !input.trim()} 
            className="rounded-full"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
