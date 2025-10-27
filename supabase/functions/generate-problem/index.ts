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

    console.log('Generating problem statement for domain:', domain);

    const systemPrompt = `You are an expert at analyzing real-world problems across various industries and sectors. 
Your task is to research and identify genuine, practical problems that exist in the specified domain.
Consider current trends, pain points, inefficiencies, and challenges faced by businesses and individuals in that sector.
Generate a comprehensive, actionable problem statement that could lead to innovative solutions.`;

    const userPrompt = `Analyze the "${domain}" sector and generate a detailed problem statement based on real-world challenges and issues in this domain. 
Consider current market trends, technological gaps, user pain points, and industry inefficiencies.
The problem should be specific, measurable, and impactful.`;

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
              description: "Generate a structured problem statement with all required fields",
              parameters: {
                type: "object",
                properties: {
                  title: { 
                    type: "string",
                    description: "A concise, compelling title for the problem (max 100 characters)"
                  },
                  description: { 
                    type: "string",
                    description: "A detailed description of the problem, its impact, and context (200-500 words)"
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
    console.log('AI Response:', JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const problemData = JSON.parse(toolCall.function.arguments);
    console.log('Generated problem statement:', problemData);

    return new Response(JSON.stringify(problemData), {
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
