import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Lightbulb, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import heroImage from "@/assets/hero-tech.jpg";

const Index = () => {
  const featuredProjects = [
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
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="absolute inset-0 opacity-10">
          <img src={heroImage} alt="Tech background" className="w-full h-full object-cover" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">Discover Your Next Project</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
              Build. Learn. Share.
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Your go-to platform for discovering tech project ideas, sharing problem statements, 
              and connecting with fellow student developers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
                  Explore Projects
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/submit">
                <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Submit Your Idea
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why TechProjects?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Curated Projects</h3>
              <p className="text-muted-foreground">
                Browse through hundreds of project ideas organized by technology and difficulty level
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Ideas</h3>
              <p className="text-muted-foreground">
                Submit your own project ideas and problem statements for others to build
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-muted-foreground">
                Join a community of student developers sharing knowledge and collaborating
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Featured Projects</h2>
            <Link to="/browse">
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Building?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of students finding inspiration for their next tech project
            </p>
            <Link to="/browse">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
