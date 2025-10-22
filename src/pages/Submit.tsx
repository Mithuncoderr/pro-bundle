import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";

const Submit = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("Beginner");

  const handleAddTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || technologies.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Here you would typically send the data to your backend
    toast.success("Project idea submitted successfully!");
    
    // Reset form
    setTitle("");
    setDescription("");
    setTechnologies([]);
    setDifficulty("Beginner");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Submit Your Project Idea</h1>
            <p className="text-muted-foreground text-lg">
              Share your project idea with the community and help fellow students learn
            </p>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Provide information about your project idea
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., AI Chatbot with NLP"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project idea in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[150px] bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="technologies">Technologies *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="technologies"
                      placeholder="Add a technology (e.g., React)"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                      className="bg-background"
                    />
                    <Button type="button" onClick={handleAddTech}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {technologies.map((tech) => (
                      <Badge key={tech} variant="outline" className="gap-1">
                        {tech}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTech(tech)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <div className="flex gap-2">
                    {["Beginner", "Intermediate", "Advanced"].map((level) => (
                      <Button
                        key={level}
                        type="button"
                        variant={difficulty === level ? "default" : "outline"}
                        onClick={() => setDifficulty(level)}
                        className={difficulty === level ? "bg-primary" : ""}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Submit Project Idea
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Submit;
