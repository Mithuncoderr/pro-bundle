import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PendingSubmission {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  difficulty: string;
  submitted_by: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  submitted_username?: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions();
    }
  }, [isAdmin, activeTab]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data: submissionsData, error } = await supabase
        .from("pending_submissions")
        .select("*")
        .eq("status", activeTab)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch usernames separately
      if (submissionsData && submissionsData.length > 0) {
        const userIds = [...new Set(submissionsData.map(s => s.submitted_by))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p.username]) || []);
        
        const enrichedData = submissionsData.map(sub => ({
          ...sub,
          submitted_username: profilesMap.get(sub.submitted_by) || "Unknown",
        }));

        setSubmissions(enrichedData);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions.",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (submission: PendingSubmission) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Insert into projects table
      const { error: insertError } = await supabase
        .from("projects")
        .insert({
          title: submission.title,
          description: submission.description,
          technologies: submission.technologies,
          difficulty: submission.difficulty,
          created_by: submission.submitted_by,
        });

      if (insertError) throw insertError;

      // Update submission status
      const { error: updateError } = await supabase
        .from("pending_submissions")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes[submission.id] || null,
        })
        .eq("id", submission.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Project approved and published!",
      });

      fetchSubmissions();
    } catch (error) {
      console.error("Error approving submission:", error);
      toast({
        title: "Error",
        description: "Failed to approve submission.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("pending_submissions")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes[submissionId] || null,
        })
        .eq("id", submissionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Submission rejected.",
      });

      fetchSubmissions();
    } catch (error) {
      console.error("Error rejecting submission:", error);
      toast({
        title: "Error",
        description: "Failed to reject submission.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-8">Admin Panel - Moderate Submissions</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {submissions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No {activeTab} submissions found.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card key={submission.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle>{submission.title}</CardTitle>
                          <CardDescription>
                            Submitted by {submission.submitted_username || "Unknown"} on{" "}
                            {new Date(submission.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{submission.difficulty}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-foreground">{submission.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {submission.technologies.map((tech) => (
                          <Badge key={tech} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>

                      {activeTab === "pending" && (
                        <>
                          <Textarea
                            placeholder="Add admin notes (optional)..."
                            value={adminNotes[submission.id] || ""}
                            onChange={(e) =>
                              setAdminNotes({ ...adminNotes, [submission.id]: e.target.value })
                            }
                            className="mt-4"
                          />
                          <div className="flex gap-2 mt-4">
                            <Button
                              onClick={() => handleApprove(submission)}
                              variant="default"
                            >
                              Approve & Publish
                            </Button>
                            <Button
                              onClick={() => handleReject(submission.id)}
                              variant="destructive"
                            >
                              Reject
                            </Button>
                          </div>
                        </>
                      )}

                      {(activeTab === "approved" || activeTab === "rejected") && submission.admin_notes && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium">Admin Notes:</p>
                          <p className="text-sm text-muted-foreground">{submission.admin_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
