import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  difficulty: string;
  likes_count: number;
  duration: string | null;
  views_count: number;
}

const Browse = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const technologies = ["React", "Python", "Node.js", "Java", "TypeScript", "MongoDB", "TensorFlow", "Vue", "Angular"];
  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      setProjects(data || []);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTech = !selectedTech || project.technologies.includes(selectedTech);
    const matchesDifficulty = !selectedDifficulty || project.difficulty === selectedDifficulty;
    return matchesSearch && matchesTech && matchesDifficulty;
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Browse Projects</h1>
            <p className="text-muted-foreground text-lg">
              Explore tech project ideas to kickstart your learning journey
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by Technology:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTech === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTech(null)}
                  className={selectedTech === null ? "bg-primary" : ""}
                >
                  All
                </Button>
                {technologies.map((tech) => (
                  <Button
                    key={tech}
                    variant={selectedTech === tech ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTech(tech)}
                    className={selectedTech === tech ? "bg-primary" : ""}
                  >
                    {tech}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by Difficulty:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedDifficulty === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(null)}
                  className={selectedDifficulty === null ? "bg-primary" : ""}
                >
                  All
                </Button>
                {difficulties.map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={selectedDifficulty === difficulty ? "bg-primary" : ""}
                  >
                    {difficulty}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-4 text-muted-foreground">
            Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </div>

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  technologies={project.technologies}
                  difficulty={project.difficulty}
                  likes={project.likes_count}
                  duration={project.duration}
                  views={project.views_count}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No projects found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;
