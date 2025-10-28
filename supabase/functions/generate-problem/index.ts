import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Researching real-world problems for domain:', domain);

    // Step 1: Search the web for real pain points
    const searchQueries = [
      `${domain} problems reddit`,
      `${domain} complaints forum`,
      `${domain} pain points twitter`,
      `${domain} challenges issues`,
      `problems with ${domain} industry`
    ];

    console.log('Searching for real pain points...');
    const searchPromises = searchQueries.map(query => 
      fetch("https://ai.gateway.lovable.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, numResults: 3 })
      }).then(res => res.json()).catch(err => {
        console.error(`Search error for "${query}":`, err);
        return { results: [] };
      })
    );

    const searchResults = await Promise.all(searchPromises);
    
    // Combine all search results
    let combinedContext = "";
    let totalResults = 0;
    
    for (const result of searchResults) {
      if (result.results && Array.isArray(result.results)) {
        totalResults += result.results.length;
        for (const item of result.results) {
          if (item.content) {
            combinedContext += `\n\n--- Source: ${item.url || 'Unknown'} ---\n${item.content}\n`;
          }
        }
      }
    }

    console.log(`Found ${totalResults} real-world sources`);

    // Step 2: Analyze the real data to generate problem statement
    const systemPrompt = `You are an expert at analyzing real-world complaints, discussions, and pain points from social media, forums, Reddit, and online discussions. 
Your task is to synthesize actual user complaints and challenges into a well-structured problem statement.
Focus on recurring themes, common frustrations, and genuine needs expressed by real people.
Generate a comprehensive, actionable problem statement based on ACTUAL data from the internet.`;

    const userPrompt = `Based on the following REAL discussions, complaints, and pain points found online about "${domain}", generate a detailed problem statement:

${combinedContext || `No specific online discussions found. Generate a problem statement based on common known challenges in the ${domain} sector.`}

Analyze these real-world sources and identify:
1. The most frequently mentioned problems
2. Common pain points and frustrations
3. Unmet needs and gaps in current solutions
4. Potential opportunities for innovation

Generate a problem statement that reflects ACTUAL real-world issues discovered from these sources.`;

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
              name: "generate_problem_statement",
              description: "Generate a structured problem statement based on real-world data",
              parameters: {
                type: "object",
                properties: {
                  title: { 
                    type: "string",
                    description: "A concise, compelling title for the problem (max 100 characters)"
                  },
                  description: { 
                    type: "string",
                    description: "A detailed description based on real pain points discovered, including specific examples and impact (200-500 words)"
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
                required: ["title", "description", "category", "tags"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_problem_statement" } }
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
    console.log('Generated problem statement from real-world data');

    return new Response(JSON.stringify({
      ...problemData,
      sourcesAnalyzed: totalResults
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
