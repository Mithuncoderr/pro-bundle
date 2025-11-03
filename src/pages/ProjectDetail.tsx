import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, Clock, Users, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  difficulty: string;
  likes_count: number;
  duration: string | null;
  contributors_count: number;
  full_description: string | null;
  requirements: string[] | null;
  resources: string[] | null;
}

const ProjectDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Project link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Project not found",
            description: "The project you're looking for doesn't exist.",
            variant: "destructive"
          });
          return;
        }

        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: "Error loading project",
          description: "Failed to load project details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-muted-foreground mb-4">Project not found</p>
            <Link to="/browse">
              <Button>Back to Browse</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Link to="/browse">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Browse
            </Button>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    {project.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-4 w-4" />
                    <span>{project.likes_count}</span>
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
                <p className="text-xl text-muted-foreground">{project.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {tech}
                  </Badge>
                ))}
              </div>

              {project.full_description && (
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
                    <p className="text-muted-foreground whitespace-pre-line">{project.full_description}</p>
                  </CardContent>
                </Card>
              )}

              {project.requirements && project.requirements.length > 0 && (
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
                    <ul className="space-y-2">
                      {project.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {project.resources && project.resources.length > 0 && (
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-semibold mb-4">Learning Resources</h2>
                    <ul className="space-y-2">
                      {project.resources.map((resource, index) => (
                        <li key={index} className="flex items-center gap-2 text-primary hover:text-primary/80">
                          <ExternalLink className="h-4 w-4" />
                          <span>{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 space-y-4">
                  {project.duration && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="h-5 w-5" />
                      <div>
                        <p className="text-sm">Estimated Duration</p>
                        <p className="font-semibold text-foreground">{project.duration}</p>
                      </div>
                    </div>
                  )}
                  
                  {project.contributors_count > 0 && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="h-5 w-5" />
                      <div>
                        <p className="text-sm">Contributors</p>
                        <p className="font-semibold text-foreground">{project.contributors_count}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button className="w-full bg-primary hover:bg-primary/90">
                <Star className="mr-2 h-4 w-4" />
                Save Project
              </Button>

              <Button variant="outline" className="w-full" onClick={handleShare}>
                Share Project
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
