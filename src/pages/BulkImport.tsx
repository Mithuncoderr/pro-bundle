import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

const BulkImport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jsonData, setJsonData] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Parse JSON
      const projects = JSON.parse(jsonData);

      if (!Array.isArray(projects)) {
        throw new Error("Data must be an array of projects");
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to import projects",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Validate and prepare projects
      const validProjects = projects.map((project) => {
        if (!project.title || !project.description) {
          throw new Error("Each project must have title and description");
        }

        return {
          title: project.title,
          description: project.description,
          technologies: Array.isArray(project.technologies) ? project.technologies : [],
          difficulty: project.difficulty || "Intermediate",
          created_by: user.id,
        };
      });

      // Insert all projects
      const { error } = await supabase
        .from("projects")
        .insert(validProjects);

      if (error) throw error;

      toast({
        title: "Import successful!",
        description: `${validProjects.length} project(s) have been imported`,
      });

      setJsonData("");
      navigate("/browse");
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: error.message || "Failed to import projects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exampleData = [
    {
      title: "Task Management App",
      description: "A full-stack task management application with user authentication and real-time updates",
      technologies: ["React", "Node.js", "MongoDB"],
      difficulty: "Intermediate"
    },
    {
      title: "Weather Dashboard",
      description: "A weather dashboard that displays current weather and forecasts using public APIs",
      technologies: ["React", "API Integration"],
      difficulty: "Beginner"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-6 w-6" />
              Bulk Import Projects
            </CardTitle>
            <CardDescription>
              Import multiple projects at once by pasting JSON data below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBulkImport} className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Project Data (JSON Array)
                </label>
                <Textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  placeholder={JSON.stringify(exampleData, null, 2)}
                  className="min-h-[400px] font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Each project should have: title, description, technologies (array), difficulty (Beginner/Intermediate/Advanced)
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Example format:</p>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(exampleData, null, 2)}
                </pre>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !jsonData.trim()}
              >
                {isLoading ? "Importing..." : "Import Projects"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BulkImport;
