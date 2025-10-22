import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, Clock, Users, ExternalLink } from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams();

  // Mock data - in a real app this would come from an API
  const project = {
    id: Number(id),
    title: "AI Chatbot with NLP",
    description: "Build an intelligent chatbot using natural language processing and machine learning. This project will help you understand the fundamentals of NLP, machine learning models, and how to integrate them into a web application.",
    technologies: ["Python", "TensorFlow", "React", "Flask", "MongoDB"],
    difficulty: "Advanced",
    likes: 245,
    duration: "4-6 weeks",
    contributors: 12,
    fullDescription: `This comprehensive project will guide you through building a fully functional AI-powered chatbot. You'll learn how to process natural language, train machine learning models, and create an interactive user interface.

Key learning outcomes:
- Understanding natural language processing fundamentals
- Training and deploying ML models
- Building REST APIs with Flask
- Creating responsive UIs with React
- Database integration and management`,
    requirements: [
      "Basic Python programming knowledge",
      "Understanding of machine learning concepts",
      "Familiarity with web development",
      "MongoDB basics"
    ],
    resources: [
      "TensorFlow Documentation",
      "NLP with Python course",
      "React official tutorial",
      "Flask Mega-Tutorial"
    ]
  };

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
                    <span>{project.likes}</span>
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

              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{project.fullDescription}</p>
                </CardContent>
              </Card>

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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <div>
                      <p className="text-sm">Estimated Duration</p>
                      <p className="font-semibold text-foreground">{project.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <div>
                      <p className="text-sm">Contributors</p>
                      <p className="font-semibold text-foreground">{project.contributors}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full bg-primary hover:bg-primary/90">
                <Star className="mr-2 h-4 w-4" />
                Save Project
              </Button>

              <Button variant="outline" className="w-full">
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
