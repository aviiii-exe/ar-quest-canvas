import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Hampi Guide, an expert AI travel companion for Hampi, Karnataka, India - a UNESCO World Heritage Site and the ancient capital of the Vijayanagara Empire.

Your role is to:
1. Help visitors plan their Hampi trip with personalized itineraries
2. Share fascinating historical stories and facts about heritage sites
3. Provide practical tips about visiting times, nearby amenities, and local customs
4. Suggest the best routes and must-see locations based on interests and time available
5. Answer questions about the Vijayanagara Empire's rich history and architecture

FORMATTING GUIDELINES:
- Use **bold** for important site names and key facts
- Use bullet points for lists of recommendations
- Use numbered lists for step-by-step itineraries
- Keep paragraphs short and readable
- Add emoji sparingly for warmth (🏛️ for temples, 🌅 for viewpoints, 📍 for locations)

When asked to create an itinerary, structure it clearly with:
- Day number and theme
- Morning, afternoon, evening activities
- Estimated time at each location
- Tips for each segment

Be friendly, enthusiastic, and knowledgeable. Keep responses concise but informative.`;

interface HeritageSite {
  id: string;
  name: string;
  category: string;
  short_description: string;
  best_time_to_visit: string;
  estimated_duration: string;
  difficulty: string;
  latitude: number;
  longitude: number;
}

interface VisitedSite {
  site_id: string;
  collected_at: string;
}

function buildContextPrompt(sites: HeritageSite[], visitedSites: VisitedSite[]): string {
  const visitedIds = new Set(visitedSites.map(v => v.site_id));
  
  const visitedList = sites
    .filter(s => visitedIds.has(s.id))
    .map(s => `- ${s.name} (${s.category})`)
    .join('\n');
  
  const unvisitedList = sites
    .filter(s => !visitedIds.has(s.id))
    .map(s => `- ${s.name}: ${s.short_description || 'Heritage site'} | Duration: ${s.estimated_duration || '30-60 min'} | Best time: ${s.best_time_to_visit || 'Morning/Evening'}`)
    .join('\n');

  return `
CURRENT USER CONTEXT:
${visitedSites.length > 0 ? `Sites already visited (${visitedSites.length}):
${visitedList}` : 'User has not visited any sites yet.'}

Available heritage sites to recommend (${sites.length - visitedSites.length} remaining):
${unvisitedList}

Use this context to give personalized recommendations. Prioritize sites the user hasn't visited yet. If they've visited some sites, acknowledge their progress and suggest complementary nearby sites.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, includeContext } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    let contextPrompt = "";

    // Fetch site context if requested
    if (includeContext) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get auth header to identify user
      const authHeader = req.headers.get("Authorization");
      let userId: string | null = null;

      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      }

      // Fetch heritage sites
      const { data: sites } = await supabase
        .from("heritage_sites")
        .select("id, name, category, short_description, best_time_to_visit, estimated_duration, difficulty, latitude, longitude");

      // Fetch user's visited sites if authenticated
      let visitedSites: VisitedSite[] = [];
      if (userId) {
        const { data: stamps } = await supabase
          .from("passport_stamps")
          .select("site_id, collected_at")
          .eq("user_id", userId);
        visitedSites = stamps || [];
      }

      if (sites) {
        contextPrompt = buildContextPrompt(sites, visitedSites);
      }
    }

    // Convert messages to Gemini format
    const geminiMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Build system instruction with context
    const fullSystemPrompt = contextPrompt 
      ? `${SYSTEM_PROMPT}\n\n${contextPrompt}`
      : SYSTEM_PROMPT;

    // Add system instruction as first user message if not present
    const contents = [
      { role: "user", parts: [{ text: fullSystemPrompt }] },
      { role: "model", parts: [{ text: "I understand! I'm Hampi Guide, your expert AI travel companion for exploring the magnificent ruins of Hampi. I have access to the heritage site information and can provide personalized recommendations based on what you've already explored. How can I help you discover Hampi today? 🏛️" }] },
      ...geminiMessages,
    ];

    console.log("Sending request to Gemini with context:", includeContext);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I couldn't generate a response. Please try again.";

    return new Response(
      JSON.stringify({ message: generatedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in hampi-guide function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
