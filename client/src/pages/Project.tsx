import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Send, Sparkles, User, CheckCircle2 } from "lucide-react";
import { StrategyReview } from "@/components/StrategyReview";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

export default function Project() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: project, isLoading: projectLoading } = trpc.projects.get.useQuery(
    { id: projectId },
    { enabled: projectId > 0 }
  );

  const { data: messages, isLoading: messagesLoading, refetch } = trpc.chat.getMessages.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      refetch();
      setMessage("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate({ projectId, content: message });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPhaseDescription = (phase: string) => {
    const descriptions: Record<string, string> = {
      discovery: "Let's explore your brand vision through a series of strategic questions.",
      strategy: "I'm synthesizing your insights into a comprehensive brand strategy.",
      concepts: "Review the creative concepts I've generated for your brand.",
      refinement: "Let's refine your selected concept into a complete brand identity.",
      toolkit: "Your brand toolkit is being assembled.",
      completed: "Your brand identity is complete!",
    };
    return descriptions[phase] || "Working on your brand...";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {project.name}
              </h1>
              <p className="text-sm text-muted-foreground">{getPhaseDescription(project.currentPhase)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 container py-6 flex flex-col max-w-4xl">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-6 pb-4">
            {/* Welcome Message */}
            {(!messages || messages.length === 0) && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <p className="font-medium mb-2">Welcome! 👋</p>
                      <p className="text-sm text-muted-foreground">
                        I'm your AI brand strategist. Over the next 30-45 minutes, we'll work together to develop a complete brand identity for <strong>{project.name}</strong>.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        You mentioned: <em>"{project.initialConcept}"</em>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Let's dive deeper. Tell me more about what you're building and who it's for.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages?.map((msg) => (
              <div key={msg.id} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "assistant" ? "bg-primary" : "bg-secondary"
                }`}>
                  {msg.role === "assistant" ? (
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <User className="w-5 h-5 text-secondary-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <Card className={msg.role === "assistant" ? "bg-muted" : "bg-card"}>
                    <CardContent className="p-4">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {sendMessage.isPending && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary-foreground animate-pulse" />
                </div>
                <div className="flex-1">
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Strategy Display */}
        {project.currentPhase === "strategy" && project.strategyData && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Your Brand Strategy</h2>
            </div>
            <StrategyReview strategy={JSON.parse(project.strategyData)} />
          </div>
        )}

        {/* Input Area */}
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sendMessage.isPending}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={sendMessage.isPending || !message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
