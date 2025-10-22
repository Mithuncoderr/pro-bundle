import { useState } from "react";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const technologies = ["React", "Python", "Node.js", "Java", "TypeScript", "MongoDB", "TensorFlow", "Vue", "Angular"];
  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  const projects = [
    {
      id: 1,
      title: "AI Chatbot with NLP",
      description: "Build an intelligent chatbot using natural language processing and machine learning",
      technologies: ["Python", "TensorFlow", "React"],
      difficulty: "Advanced",
      likes: 245
    },
    {
      id: 2,
      title: "E-commerce Platform",
      description: "Create a full-stack online shopping platform with payment integration",
      technologies: ["React", "Node.js", "MongoDB"],
      difficulty: "Intermediate",
      likes: 189
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description: "Build a responsive weather app with real-time data and beautiful visualizations",
      technologies: ["JavaScript", "API", "CSS"],
      difficulty: "Beginner",
      likes: 312
    },
    {
      id: 4,
      title: "Social Media Analytics Tool",
      description: "Create a dashboard to track and analyze social media metrics across platforms",
      technologies: ["Python", "React", "MongoDB"],
      difficulty: "Intermediate",
      likes: 156
    },
    {
      id: 5,
      title: "Task Management App",
      description: "Build a collaborative task management system with real-time updates",
      technologies: ["Vue", "Node.js", "PostgreSQL"],
      difficulty: "Beginner",
      likes: 278
    },
    {
      id: 6,
      title: "Image Recognition System",
      description: "Develop an image classification system using deep learning",
      technologies: ["Python", "TensorFlow", "Flask"],
      difficulty: "Advanced",
      likes: 201
    }
  ];

  const filteredProjects = projects.filter(project => {
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
              Explore {projects.length} tech project ideas to kickstart your learning journey
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>

          {filteredProjects.length === 0 && (
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
