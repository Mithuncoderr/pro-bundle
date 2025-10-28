import { useState } from "react";
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
  const [generatedProblem, setGeneratedProblem] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    setGeneratedProblem(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-problem', {
        body: { domain: domain.trim() }
      });

      if (error) throw error;

      setGeneratedProblem(data);
      toast({
        title: "Problem Discovered!",
        description: `AI analyzed ${data.sourcesAnalyzed || 0} real-world sources from social media and forums`,
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate problem statement",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
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
          title: generatedProblem.title,
          description: generatedProblem.description,
          category: generatedProblem.category,
          tags: generatedProblem.tags,
          posted_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Problem Statement Saved!",
        description: "Successfully added to the problems database",
      });
      
      navigate('/problems');
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
              Discover real-world problems by analyzing social media, Reddit, forums, and online discussions
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Discover Real-World Problems</CardTitle>
              <CardDescription>
                Our AI searches Reddit, X, forums, and social media to find actual pain points and complaints in your chosen domain
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
                      Searching the Internet...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Discover Real Problems
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {generatedProblem && (
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle>{generatedProblem.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline">{generatedProblem.category}</Badge>
                    </CardDescription>
                  </div>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save to Database
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">
                    {generatedProblem.description}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {generatedProblem.tags?.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
