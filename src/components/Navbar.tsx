import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, Home, Lightbulb, Users, FileQuestion, LogOut, User, Sparkles, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

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
            <Link to="/generate-problem" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Sparkles className="h-4 w-4" />
              AI Generator
            </Link>
            <Link to="/community" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Users className="h-4 w-4" />
              Community
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/submit">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Lightbulb className="h-4 w-4 mr-2" />
                Submit Idea
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    <User className="mr-2 h-4 w-4" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/bulk-import')}>
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Import
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline">
                  Log In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
