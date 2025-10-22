import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Problems = () => {
  const problems = [
    {
      id: 1,
      title: "Need a better way to organize study materials",
      description: "As a student, I struggle to keep track of all my notes, PDFs, and resources across different subjects. Looking for a solution that can centralize everything with good search functionality.",
      author: "Sarah Chen",
      date: "2 days ago",
      upvotes: 42,
      comments: 8,
      tags: ["Productivity", "Education"]
    },
    {
      id: 2,
      title: "Campus event coordination is chaotic",
      description: "Our university needs a platform where student organizations can coordinate events, share calendars, and avoid scheduling conflicts. Current tools are too complex or expensive.",
      author: "Mike Johnson",
      date: "1 week ago",
      upvotes: 35,
      comments: 12,
      tags: ["Events", "Social"]
    },
    {
      id: 3,
      title: "Finding study groups is difficult",
      description: "There's no easy way to find or form study groups for specific courses. Would love a system that matches students based on courses, availability, and learning preferences.",
      author: "Priya Patel",
      date: "3 days ago",
      upvotes: 58,
      comments: 15,
      tags: ["Education", "Collaboration"]
    },
    {
      id: 4,
      title: "Career fair preparation needs improvement",
      description: "Students need a platform to research companies, track applications, and share interview experiences before career fairs. Something like a student-focused job tracker.",
      author: "James Lee",
      date: "5 days ago",
      upvotes: 29,
      comments: 6,
      tags: ["Career", "Networking"]
    }
  ];

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
                  <div className="flex flex-wrap gap-2 mb-4">
                    {problem.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>by {problem.author}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {problem.date}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        {problem.upvotes}
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        {problem.comments}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problems;
