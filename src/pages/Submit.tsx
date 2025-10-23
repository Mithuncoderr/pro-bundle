import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  technologies: z.array(z.string()).min(1, "Add at least one technology"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
});

const Submit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAddTech = () => {
    const tech = techInput.trim();
    if (tech && !technologies.includes(tech)) {
      setTechnologies([...technologies, tech]);
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a project.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);

    try {
      const validated = projectSchema.parse({
        title,
        description,
        technologies,
        difficulty,
      });

      const { error } = await supabase
        .from("projects")
        .insert({
          title: validated.title,
          description: validated.description,
          technologies: validated.technologies,
          difficulty: validated.difficulty,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your project idea has been submitted.",
      });

      setTitle("");
      setDescription("");
      setTechnologies([]);
      setDifficulty("Beginner");
      setTechInput("");
      
      navigate("/browse");
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Could not submit project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Submit Your Project Idea</h1>
            <p className="text-muted-foreground text-lg">
              Share your project idea with the community and help fellow students learn
            </p>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Provide information about your project idea
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Title *</label>
                  <Input
                    placeholder="e.g., AI Chatbot with NLP"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    placeholder="Describe your project idea in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[150px] bg-background"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Technologies *</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a technology (e.g., React)"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                      className="bg-background"
                    />
                    <Button type="button" onClick={handleAddTech}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {technologies.map((tech) => (
                      <Badge key={tech} variant="outline" className="gap-1">
                        {tech}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTech(tech)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <div className="flex gap-2">
                    {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => (
                      <Button
                        key={level}
                        type="button"
                        variant={difficulty === level ? "default" : "outline"}
                        onClick={() => setDifficulty(level)}
                        className={difficulty === level ? "bg-primary" : ""}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Project Idea"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Submit;
