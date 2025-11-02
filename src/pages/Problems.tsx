import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, Tag } from "lucide-react";

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
            <Link to="/submit-problem">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Post a Problem
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {problems.map((problem) => (
              <Card key={problem.id} className="group bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {/* Title & Description */}
                    <div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {problem.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {problem.description}
                      </p>
                    </div>

                    {/* Tags & Metadata */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <div className="flex items-center gap-3">
                        {problem.tags && problem.tags.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                            <div className="flex gap-1.5">
                              {problem.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                                  {tag}
                                </Badge>
                              ))}
                              {problem.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs px-2 py-0">
                                  +{problem.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{problem.upvotes_count}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          <span>{problem.comments_count}</span>
                        </button>
                      </div>
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
