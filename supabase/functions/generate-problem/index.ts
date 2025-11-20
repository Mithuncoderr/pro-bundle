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

// Enhanced search queries focused on pain points
const searchQueries = [
  'problem OR frustrating OR "pain point" OR "struggling with" OR "can\'t find"',
  '"wish there was" OR "need a solution" OR "looking for a way" OR "how do I"',
  '"hate that" OR annoying OR "difficult to" OR "time consuming" OR inefficient',
  'complaint OR issue OR "too expensive" OR "doesn\'t work" OR "broken" OR frustration',
  '"anyone else" OR "am I the only one" OR "why is it so hard" OR "fed up with"',
];

// Rotate through different time periods for diverse results
const timeFilters = ['week', 'month', 'year', 'all'];

// Rotate through different sort methods
const sortMethods = ['relevance', 'hot', 'top', 'comments'];

async function searchReddit(domain: string): Promise<RedditPost[]> {
  try {
    const domainLower = domain.toLowerCase();
    const subreddits = domainToSubreddits[domainLower] || [];
    const posts: RedditPost[] = [];

    // Randomize search parameters for variety
    const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    const randomTime = timeFilters[Math.floor(Math.random() * timeFilters.length)];
    const randomSort = sortMethods[Math.floor(Math.random() * sortMethods.length)];

    console.log(`Search strategy: query="${randomQuery.substring(0, 30)}...", time=${randomTime}, sort=${randomSort}`);

    // Search specific subreddits if available (increased from 2 to 3 for more coverage)
    if (subreddits.length > 0) {
      // Shuffle subreddits for variety each time
      const shuffled = [...subreddits].sort(() => Math.random() - 0.5);
      
      for (const subreddit of shuffled.slice(0, 3)) {
        try {
          const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(randomQuery)}&restrict_sr=1&sort=${randomSort}&limit=15&t=${randomTime}`;
          
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

    // Also do a site-wide search with variation
    try {
      const sitewideQuery = `"${domain}" AND (${randomQuery})`;
      const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(sitewideQuery)}&sort=${randomSort}&limit=15&t=${randomTime}`;
      
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

    // Deduplicate by URL
    const uniquePosts = Array.from(
      new Map(posts.map(post => [post.url, post])).values()
    );

    // Calculate engagement score: upvotes + (comments * 2) - prioritize discussion
    const calculateEngagement = (post: RedditPost) => post.score + (post.num_comments * 2);
    
    // Filter for HIGH-TRAFFIC content only
    const filteredPosts = uniquePosts
      .filter(post => {
        const engagement = calculateEngagement(post);
        const hasContent = post.title.length > 20 || post.selftext.length > 50;
        // Require minimum engagement (10+ upvotes OR 5+ comments)
        return hasContent && (post.score >= 10 || post.num_comments >= 5);
      })
      .sort((a, b) => calculateEngagement(b) - calculateEngagement(a))
      .slice(0, 25); // Top 25 highest-traffic posts

    console.log(`Found ${filteredPosts.length} unique Reddit posts for domain: ${domain}`);
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

  let formatted = `=== HIGH-TRAFFIC REDDIT DISCUSSIONS (${posts.length} posts, sorted by engagement) ===\n\n`;
  
  posts.forEach((post, index) => {
    const engagement = post.score + (post.num_comments * 2);
    formatted += `Discussion ${index + 1} [🔥 ENGAGEMENT: ${engagement} | ⬆️ ${post.score} upvotes | 💬 ${post.num_comments} comments | 📍 r/${post.subreddit}]:\n`;
    formatted += `Title: ${post.title}\n`;
    if (post.selftext) {
      formatted += `Content: ${post.selftext}\n`;
    }
    formatted += `Source: ${post.url}\n`;
    formatted += `\n`;
  });

  formatted += `\n=== END HIGH-TRAFFIC DATA ===\n`;
  formatted += `Total Engagement: ${posts.reduce((sum, p) => sum + p.score + (p.num_comments * 2), 0)} points\n`;
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

    const systemPrompt = `You are an expert problem analyst specializing in extracting HIGH-VALUE pain points from real user discussions.

Your goal: Extract 3-5 ACTIONABLE problem statements that student developers can build solutions for.

CRITICAL REQUIREMENTS:
1. **High-Traffic Only**: Focus on problems from posts with high engagement (upvotes + comments)
2. **Real Pain Points**: Extract genuine frustrations, not feature requests
3. **Clear Impact**: Problems should have measurable negative impact on users
4. **Solution Potential**: Each problem should be solvable with technology
5. **Diverse Scope**: Vary complexity - from simple tools to complex platforms

PAIN POINT INDICATORS TO LOOK FOR:
- Emotional language: "frustrated", "hate", "annoying", "waste of time"
- Repeated complaints across multiple posts
- High comment counts indicating shared frustration
- Specific workflow breakdowns or inefficiencies
- Cost/time complaints with concrete numbers

WHAT TO PRIORITIZE:
- Posts with 15+ upvotes or 10+ comments
- Problems mentioned by multiple users
- Pain points with quantifiable impact (time, money, effort)
- Issues that currently lack good solutions`;

    const userPrompt = redditPosts.length > 0 
      ? `Analyze HIGH-TRAFFIC Reddit discussions from "${sanitizedDomain}" and extract 3-5 problem statements.

${redditContext}

=== EXTRACTION INSTRUCTIONS ===

STEP 1 - IDENTIFY HIGH-IMPACT PAIN POINTS:
- Focus on posts with highest engagement (upvotes + comments)
- Look for emotional language indicating real frustration
- Find problems mentioned across MULTIPLE different posts
- Prioritize specific, concrete complaints over vague issues

STEP 2 - VALIDATE EACH PROBLEM:
✓ Is it mentioned by real users in the data above?
✓ Does it have high engagement (votes/comments)?
✓ Is the impact clear and measurable?
✓ Can it be solved with technology?
✓ Is there a clear target audience?

STEP 3 - STRUCTURE THE PROBLEM:
For each problem, include:
- **WHO**: Who faces this problem? (be specific)
- **WHAT**: What exactly is the pain point?
- **WHY**: Why does it matter? (time/money/effort wasted)
- **CURRENT STATE**: What do people do now? (workarounds)
- **EVIDENCE**: Quote specific Reddit comments/posts

Extract 3-5 diverse, high-value problems from the data above.`
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
                          description: "Detailed problem description with: WHO faces it, WHAT the pain point is, WHY it matters (impact), CURRENT workarounds, and EVIDENCE from Reddit discussions (300-500 words)"
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
        totalEngagement: redditPosts.reduce((sum, p) => sum + p.score + (p.num_comments * 2), 0),
        averageUpvotes: Math.round(redditPosts.reduce((sum, p) => sum + p.score, 0) / (redditPosts.length || 1)),
        averageComments: Math.round(redditPosts.reduce((sum, p) => sum + p.num_comments, 0) / (redditPosts.length || 1)),
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
