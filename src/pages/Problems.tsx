import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProblemStatement {
  id: string;
  title: string;
  description: string;
  tags: string[];
  upvotes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: {
    username: string;
  };
}

const Problems = () => {
  const [problems, setProblems] = useState<ProblemStatement[]>([]);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    const { data, error } = await supabase
      .from("problem_statements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching problems:", error);
    } else {
      setProblems(data as any || []);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-4">Problem Statements</h1>
              <p className="text-muted-foreground text-lg">
                Real problems waiting for student developers to solve
              </p>
            </div>
            <Link to="/submit">
              <Button className="bg-primary hover:bg-primary/90">
                Post a Problem
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            {problems.map((problem) => (
              <Card key={problem.id} className="bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2 text-2xl hover:text-primary transition-colors cursor-pointer">
                        {problem.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {problem.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {problem.tags && problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {problem.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>by {problem.profiles?.username || "Anonymous"}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(problem.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        {problem.upvotes_count}
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        {problem.comments_count}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {problems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No problem statements yet. Be the first to post!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problems;
