import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText } from "lucide-react";
import Papa from "papaparse";

const BulkImport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jsonData, setJsonData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setIsLoading(true);

    try {
      Papa.parse(csvFile, {
        header: true,
        complete: async (results) => {
          try {
            const projects = results.data
              .filter((row: any) => row.title && row.description)
              .map((row: any) => ({
                title: row.title,
                description: row.description,
                technologies: row.technologies ? row.technologies.split(',').map((t: string) => t.trim()) : [],
                difficulty: row.difficulty || "Intermediate",
              }));

            await importProjects(projects);
          } catch (error: any) {
            console.error("CSV parse error:", error);
            toast({
              title: "Import failed",
              description: error.message || "Failed to parse CSV file",
              variant: "destructive",
            });
            setIsLoading(false);
          }
        },
        error: (error) => {
          toast({
            title: "CSV parsing failed",
            description: error.message,
            variant: "destructive",
          });
          setIsLoading(false);
        },
      });
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: error.message || "Failed to import projects",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleJsonImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const projects = JSON.parse(jsonData);

      if (!Array.isArray(projects)) {
        throw new Error("Data must be an array of projects");
      }

      await importProjects(projects);
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

  const importProjects = async (projects: any[]) => {
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
    setCsvFile(null);
    navigate("/browse");
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
            <Tabs defaultValue="csv" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="csv" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  CSV Upload
                </TabsTrigger>
                <TabsTrigger value="json" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  JSON Input
                </TabsTrigger>
              </TabsList>

              <TabsContent value="csv" className="space-y-6">
                <form onSubmit={handleCsvImport} className="space-y-6">
                  <div>
                    <Label htmlFor="csv-file" className="mb-2 block">
                      Upload CSV File
                    </Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="cursor-pointer"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      CSV should have columns: title, description, technologies (comma-separated), difficulty
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Example CSV format:</p>
                    <pre className="text-xs overflow-x-auto">
                      title,description,technologies,difficulty{"\n"}
                      Task Management App,A full-stack task management application,"React,Node.js,MongoDB",Intermediate{"\n"}
                      Weather Dashboard,A weather dashboard using public APIs,"React,API Integration",Beginner
                    </pre>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !csvFile}
                  >
                    {isLoading ? "Importing..." : "Import from CSV"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="json" className="space-y-6">
                <form onSubmit={handleJsonImport} className="space-y-6">
                  <div>
                    <Label htmlFor="json-data" className="mb-2 block">
                      Project Data (JSON Array)
                    </Label>
                    <Textarea
                      id="json-data"
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
                    <p className="text-sm font-medium mb-2">Example JSON format:</p>
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(exampleData, null, 2)}
                    </pre>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !jsonData.trim()}
                  >
                    {isLoading ? "Importing..." : "Import from JSON"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BulkImport;
