import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Reddit subreddit mapping by domain
const domainToSubreddits: Record<string, string[]> = {
  'fintech': ['fintech', 'personalfinance', 'CreditCards', 'Banking'],
  'healthcare': ['healthcare', 'medical', 'AskDocs', 'HealthIT'],
  'education': ['education', 'teaching', 'OnlineEducation', 'EdTech'],
  'ecommerce': ['ecommerce', 'shopify', 'EntrepreneurRideAlong', 'smallbusiness'],
  'saas': ['SaaS', 'startups', 'Entrepreneur', 'digitalnomad'],
  'fitness': ['fitness', 'loseit', 'bodyweightfitness', 'xxfitness'],
  'food': ['food', 'Cooking', 'EatCheapAndHealthy', 'MealPrepSunday'],
  'travel': ['travel', 'solotravel', 'TravelHacks', 'digitalnomad'],
  'productivity': ['productivity', 'GetMotivated', 'lifehacks', 'selfimprovement'],
};

interface RedditPost {
  title: string;
  selftext: string;
  score: number;
  num_comments: number;
  url: string;
  subreddit: string;
}

async function searchReddit(domain: string): Promise<RedditPost[]> {
  try {
    const domainLower = domain.toLowerCase();
    const subreddits = domainToSubreddits[domainLower] || [];
    const posts: RedditPost[] = [];

    // Search specific subreddits if available
    if (subreddits.length > 0) {
      for (const subreddit of subreddits.slice(0, 2)) { // Limit to 2 subreddits to avoid rate limits
        try {
          const searchQuery = `problem OR frustrating OR "wish there was" OR issue OR challenge`;
          const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchQuery)}&restrict_sr=1&sort=relevance&limit=10&t=year`;
          
          const response = await fetch(url, {
            headers: { 'User-Agent': 'Lovable-ProblemFinder/1.0' }
          });

          if (response.ok) {
            const data = await response.json();
            const subredditPosts = data.data?.children?.map((child: any) => ({
              title: child.data.title,
              selftext: child.data.selftext?.substring(0, 500) || '',
              score: child.data.score,
              num_comments: child.data.num_comments,
              url: `https://reddit.com${child.data.permalink}`,
              subreddit: child.data.subreddit,
            })) || [];
            
            posts.push(...subredditPosts);
          }
          
          // Small delay to be respectful to Reddit's API
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error fetching from r/${subreddit}:`, error);
        }
      }
    }

    // Also do a site-wide search
    try {
      const searchQuery = `"${domain}" AND (problem OR frustrating OR "wish there was" OR issue OR challenge)`;
      const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(searchQuery)}&sort=relevance&limit=10&t=year`;
      
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Lovable-ProblemFinder/1.0' }
      });

      if (response.ok) {
        const data = await response.json();
        const sitewdePosts = data.data?.children?.map((child: any) => ({
          title: child.data.title,
          selftext: child.data.selftext?.substring(0, 500) || '',
          score: child.data.score,
          num_comments: child.data.num_comments,
          url: `https://reddit.com${child.data.permalink}`,
          subreddit: child.data.subreddit,
        })) || [];
        
        posts.push(...sitewdePosts);
      }
    } catch (error) {
      console.error('Error in site-wide Reddit search:', error);
    }

    // Filter and sort by engagement (score + comments)
    const filteredPosts = posts
      .filter(post => post.score > 5 && (post.title.length > 20 || post.selftext.length > 50))
      .sort((a, b) => (b.score + b.num_comments) - (a.score + a.num_comments))
      .slice(0, 12); // Top 12 posts

    console.log(`Found ${filteredPosts.length} relevant Reddit posts for domain: ${domain}`);
    return filteredPosts;
  } catch (error) {
    console.error('Reddit search error:', error);
    return [];
  }
}

function formatRedditDataForAI(posts: RedditPost[], domain: string): string {
  if (posts.length === 0) {
    return `No Reddit discussions found. Generate problems based on general knowledge of the ${domain} domain.`;
  }

  let formatted = `=== REDDIT DISCUSSIONS (${posts.length} posts analyzed) ===\n\n`;
  
  posts.forEach((post, index) => {
    formatted += `Discussion ${index + 1} (${post.score} upvotes, ${post.num_comments} comments, r/${post.subreddit}):\n`;
    formatted += `Title: ${post.title}\n`;
    if (post.selftext) {
      formatted += `Content: ${post.selftext}\n`;
    }
    formatted += `\n`;
  });

  formatted += `\n=== END REDDIT DATA ===\n`;
  return formatted;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();
    
    // Input validation
    if (!domain || typeof domain !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Domain is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (domain.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Domain must be less than 100 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedDomain = domain.trim();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Generating problem ideas for domain:', sanitizedDomain);
    console.log('Step 1: Searching Reddit for real discussions...');

    // Search Reddit for real discussions
    const redditPosts = await searchReddit(sanitizedDomain);
    const redditContext = formatRedditDataForAI(redditPosts, sanitizedDomain);

    console.log(`Step 2: Analyzing ${redditPosts.length} Reddit discussions with AI...`);

    const systemPrompt = `You are an expert problem analyst who specializes in extracting genuine pain points from real user discussions.

Your task is to analyze Reddit discussions and extract 3-5 DIVERSE, ACTIONABLE problem statements based on what real people are actually saying.

Each problem should:
- Be derived from the actual Reddit discussions provided
- Represent a recurring theme or highly-engaged topic
- Be specific and well-defined
- Have clear potential for a solution
- Vary in scope, target audience, and approach

Focus on:
- Problems mentioned multiple times across different posts
- High-engagement posts (many upvotes/comments)
- Specific frustrations users express
- Gaps or inefficiencies people complain about`;

    const userPrompt = redditPosts.length > 0 
      ? `Analyze the following Reddit discussions from the ${sanitizedDomain} sector and extract 3-5 distinct, real-world problem statements.

${redditContext}

=== INSTRUCTIONS ===
- Base your problems ONLY on what you see in the Reddit data above
- Look for recurring complaints and frustrations across multiple posts
- Prioritize problems from high-engagement posts (high upvotes/comments)
- Identify specific pain points users express
- Extract problems that have clear solution potential
- Make each problem statement unique and actionable
- Do NOT invent problems that aren't reflected in the discussions

Generate 3-5 problem statements based on the Reddit discussions.`
      : `Generate 3-5 distinct, real-world problem statements for the "${sanitizedDomain}" sector.

Note: No Reddit data was available, so generate problems based on your knowledge of common challenges in this domain.

Consider different angles:
- Consumer/end-user frustrations
- Business operational challenges
- Technological gaps or limitations
- Market inefficiencies
- Accessibility or equity issues

Make each problem statement unique and actionable.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_problem_statements",
              description: "Generate multiple diverse problem statements",
              parameters: {
                type: "object",
                properties: {
                  problems: {
                    type: "array",
                    description: "Array of 3-5 distinct problem statements",
                    items: {
                      type: "object",
                      properties: {
                        title: { 
                          type: "string",
                          description: "A concise, compelling title for the problem (max 100 characters)"
                        },
                        description: { 
                          type: "string",
                          description: "A detailed description of the problem, including specific examples and impact (200-400 words)"
                        },
                        category: { 
                          type: "string",
                          description: "The main category or industry sector"
                        },
                        tags: { 
                          type: "array",
                          items: { type: "string" },
                          description: "3-5 relevant tags for categorization"
                        }
                      },
                      required: ["title", "description", "category", "tags"]
                    },
                    minItems: 3,
                    maxItems: 5
                  }
                },
                required: ["problems"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_problem_statements" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    console.log('AI Response received');

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const problemData = JSON.parse(toolCall.function.arguments);
    console.log(`Generated ${problemData.problems?.length || 0} problem statements from ${redditPosts.length} Reddit discussions`);

    return new Response(JSON.stringify({
      problems: problemData.problems || [],
      metadata: {
        redditPostsAnalyzed: redditPosts.length,
        subreddits: [...new Set(redditPosts.map(p => p.subreddit))],
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in generate-problem function:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
