import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [initialConcept, setInitialConcept] = useState("");

  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery();
  const createProject = trpc.projects.create.useMutation({
    onSuccess: (project) => {
      toast.success("Project created!");
      setIsCreateOpen(false);
      setProjectName("");
      setInitialConcept("");
      refetch();
      setLocation(`/project/${project.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = () => {
    if (!projectName.trim() || !initialConcept.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    createProject.mutate({ name: projectName, initialConcept });
  };

  const getPhaseLabel = (phase: string) => {
    const labels: Record<string, string> = {
      discovery: "Discovery",
      strategy: "Strategy",
      concepts: "Concepts",
      refinement: "Refinement",
      toolkit: "Brand Toolkit",
      completed: "Completed",
    };
    return labels[phase] || phase;
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      discovery: "bg-purple-500",
      strategy: "bg-blue-500",
      concepts: "bg-green-500",
      refinement: "bg-yellow-500",
      toolkit: "bg-orange-500",
      completed: "bg-pink-500",
    };
    return colors[phase] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Brand Projects</h1>
            <p className="text-muted-foreground">Create and manage your AI-powered brand identities</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Brand Project</DialogTitle>
                <DialogDescription>
                  Start a new brand development journey. I'll guide you through discovery, strategy, and creative concepts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., My Startup Brand"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="concept">Initial Concept</Label>
                  <Textarea
                    id="concept"
                    placeholder="Describe your brand idea in a few sentences..."
                    value={initialConcept}
                    onChange={(e) => setInitialConcept(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createProject.isPending}>
                  {createProject.isPending ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => setLocation(`/project/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {project.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this project?")) {
                          deleteProject.mutate({ id: project.id });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {project.initialConcept}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getPhaseColor(project.currentPhase)}`} />
                    <span className="text-xs font-medium">{getPhaseLabel(project.currentPhase)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first brand project and let AI guide you through the complete brand development process.
              </p>
              <Button onClick={() => setIsCreateOpen(true)} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
