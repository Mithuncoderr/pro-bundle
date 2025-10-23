import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  id: string | number;
  title: string;
  description: string;
  technologies: string[];
  difficulty: string;
  likes: number;
}

const ProjectCard = ({ id, title, description, technologies, difficulty, likes }: ProjectCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="group hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="relative">
        <div className="flex items-start justify-between mb-2">
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty}
          </Badge>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="h-4 w-4" />
            <span className="text-sm">{likes}</span>
          </div>
        </div>
        <CardTitle className="group-hover:text-primary transition-colors">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.map((tech, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
        <Link to={`/project/${id}`}>
          <Button variant="ghost" className="w-full group/button">
            View Details
            <ArrowRight className="h-4 w-4 ml-2 group-hover/button:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
