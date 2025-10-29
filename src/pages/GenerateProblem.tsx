import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Save } from "lucide-react";

export default function GenerateProblem() {
  const [domain, setDomain] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedProblems, setGeneratedProblems] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to generate problem statements",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate, toast]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domain.trim()) {
      toast({
        title: "Domain Required",
        description: "Please enter a domain or sector to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedProblems([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-problem', {
        body: { domain: domain.trim() }
      });

      if (error) throw error;

      setGeneratedProblems(data.problems || []);
      toast({
        title: "Problems Discovered!",
        description: `Generated ${data.problems?.length || 0} diverse problem ideas`,
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate problem statements",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (problem: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save problem statements",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('problem_statements')
        .insert({
          title: problem.title,
          description: problem.description,
          category: problem.category,
          tags: problem.tags,
          posted_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Problem Statement Saved!",
        description: "Successfully added to the problems database",
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save problem statement",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Problem Discovery Engine
            </h1>
            <p className="text-muted-foreground">
              Generate multiple diverse problem statements for any domain using advanced AI
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Generate Problem Ideas</CardTitle>
              <CardDescription>
                AI analyzes the domain and generates 3-5 diverse, actionable problem statements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="domain" className="text-sm font-medium">
                    Domain / Sector
                  </label>
                  <Input
                    id="domain"
                    placeholder="e.g., Healthcare, E-commerce, Education, FinTech"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Examples: "Healthcare technology", "Sustainable agriculture", "Remote work tools"
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isGenerating || !domain.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Ideas...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Problem Ideas
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {generatedProblems.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Generated Problem Ideas ({generatedProblems.length})</h2>
              {generatedProblems.map((problem, index) => (
                <Card key={index} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-xl">{problem.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="outline">{problem.category}</Badge>
                        </CardDescription>
                      </div>
                      <Button onClick={() => handleSave(problem)} disabled={isSaving} size="sm">
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground whitespace-pre-wrap">
                        {problem.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {problem.tags?.map((tag: string, tagIndex: number) => (
                        <Badge key={tagIndex} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
