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

    console.log('Generating diverse problem ideas for domain:', domain);

    // Generate a random seed for variation
    const randomSeed = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString();

    const systemPrompt = `You are an expert product strategist and problem identifier who specializes in discovering real-world pain points across various industries.

Your task is to generate 3-5 DIVERSE, ACTIONABLE problem statements that represent genuine challenges people face in the specified domain.

Each problem should:
- Be specific and well-defined
- Represent a real pain point that exists today
- Be different from the others (vary in scope, target audience, and approach)
- Have clear potential for a solution
- Be based on realistic market needs and user frustrations

Generate varied problems covering different aspects of the domain - from consumer pain points to industry challenges, from technological gaps to process inefficiencies.`;

    const userPrompt = `Generate 3-5 distinct, real-world problem statements for the "${domain}" sector.

Domain context: ${domain}
Variation seed: ${randomSeed}
Timestamp: ${timestamp}

Consider different angles:
- Consumer/end-user frustrations
- Business operational challenges  
- Technological gaps or limitations
- Market inefficiencies
- Accessibility or equity issues
- Sustainability or scalability problems

Make each problem statement unique and actionable. Vary the scope, target audience, and specific focus area for each problem.`;

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
    console.log(`Generated ${problemData.problems?.length || 0} diverse problem statements`);

    return new Response(JSON.stringify({
      problems: problemData.problems || []
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
