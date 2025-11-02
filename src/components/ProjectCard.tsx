import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  id: string | number;
  title: string;
  description: string;
  technologies: string[];
  difficulty: string;
  likes: number;
  duration?: string | null;
  views?: number;
}

const ProjectCard = ({ id, title, description, technologies, difficulty, likes, duration, views }: ProjectCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30";
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30";
      default:
        return "bg-muted text-muted-foreground hover:bg-muted/80";
    }
  };

  return (
    <Card className="group relative hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden h-full flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between mb-3">
          <Badge className={`${getDifficultyColor(difficulty)} transition-all`}>
            {difficulty}
          </Badge>
          <div className="flex items-center gap-3 text-sm">
            {views !== undefined && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{views}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-medium">{likes}</span>
            </div>
          </div>
        </div>
        
        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2 mb-2">
          {title}
        </CardTitle>
        <CardDescription className="line-clamp-3 text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative flex-1 flex flex-col justify-between pt-0">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {technologies.slice(0, 4).map((tech, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs bg-background/50 hover:bg-background transition-colors"
              >
                {tech}
              </Badge>
            ))}
            {technologies.length > 4 && (
              <Badge variant="outline" className="text-xs bg-background/50">
                +{technologies.length - 4}
              </Badge>
            )}
          </div>

          {duration && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
          )}
        </div>

        <Link to={`/project/${id}`} className="mt-4 block">
          <Button 
            variant="ghost" 
            className="w-full group/button hover:bg-primary/10 hover:text-primary border border-transparent group-hover/button:border-primary/20 transition-all"
          >
            View Details
            <ArrowRight className="h-4 w-4 ml-2 group-hover/button:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
