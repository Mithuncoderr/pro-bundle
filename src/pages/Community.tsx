import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { useState } from "react";

const Community = () => {
  const [newPost, setNewPost] = useState("");

  const posts = [
    {
      id: 1,
      author: "Alex Rivera",
      initials: "AR",
      time: "2 hours ago",
      content: "Just finished building my first full-stack app! Used React, Node.js, and MongoDB. The feeling is amazing! 🚀",
      likes: 24,
      comments: 5,
      tags: ["React", "Node.js", "MongoDB"]
    },
    {
      id: 2,
      author: "Emma Watson",
      initials: "EW",
      time: "5 hours ago",
      content: "Looking for team members for a hackathon project - building an AI-powered study buddy. Anyone interested in ML and education tech?",
      likes: 18,
      comments: 12,
      tags: ["AI", "Hackathon", "Collaboration"]
    },
    {
      id: 3,
      author: "David Kim",
      initials: "DK",
      time: "1 day ago",
      content: "Pro tip: When learning a new framework, build something you actually need. I built a personal expense tracker and learned React in the process. Way more engaging than tutorials!",
      likes: 45,
      comments: 8,
      tags: ["Learning", "Tips"]
    },
    {
      id: 4,
      author: "Sophie Turner",
      initials: "ST",
      time: "2 days ago",
      content: "Deployed my portfolio website today! Took forever to get the animations right but so worth it. Would love feedback from the community!",
      likes: 32,
      comments: 15,
      tags: ["Portfolio", "Feedback"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Community Feed</h1>
            <p className="text-muted-foreground text-lg">
              Connect with fellow student developers, share progress, and collaborate
            </p>
          </div>

          {/* Create Post */}
          <Card className="mb-8 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    YO
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <Textarea
                    placeholder="Share your progress, ask questions, or start a discussion..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[100px] bg-background"
                  />
                  <div className="flex justify-end">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Send className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {post.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{post.author}</h3>
                        <span className="text-sm text-muted-foreground">{post.time}</span>
                      </div>
                      <p className="text-muted-foreground mb-3">{post.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-muted-foreground">
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Heart className="h-5 w-5" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Share2 className="h-5 w-5" />
                      <span>Share</span>
                    </button>
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

export default Community;
