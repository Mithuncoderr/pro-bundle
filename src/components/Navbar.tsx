import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, Home, Lightbulb, Users, FileQuestion } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Code2 className="h-6 w-6 text-primary group-hover:text-accent transition-colors" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              TechProjects
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link to="/browse" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Code2 className="h-4 w-4" />
              Browse Projects
            </Link>
            <Link to="/problems" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <FileQuestion className="h-4 w-4" />
              Problems
            </Link>
            <Link to="/community" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Users className="h-4 w-4" />
              Community
            </Link>
          </div>

          <Link to="/submit">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Lightbulb className="h-4 w-4 mr-2" />
              Submit Idea
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
