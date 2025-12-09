import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

Key Hampi sites you should know about:
- Virupaksha Temple: The main temple, still active, dedicated to Lord Shiva
- Vittala Temple: Famous for its stone chariot and musical pillars
- Hampi Bazaar: Ancient marketplace near Virupaksha Temple
- Elephant Stables: Royal elephant housing with domed chambers
- Lotus Mahal: Elegant pavilion in the Royal Enclosure
- Queen's Bath: Royal bathing complex with Indo-Islamic architecture
- Hazara Rama Temple: Temple with Ramayana carvings
- Achyutaraya Temple: Impressive temple in a valley setting
- Hemakuta Hill: Sunset viewpoint with temple clusters
- Matanga Hill: Best sunrise spot overlooking Hampi

Be friendly, enthusiastic, and knowledgeable. Keep responses concise but informative. Use emojis sparingly to add warmth. When suggesting itineraries, consider the traveler's available time and interests.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Convert messages to Gemini format
    const geminiMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Add system instruction as first user message if not present
    const contents = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "I understand! I'm Hampi Guide, your expert AI travel companion for exploring the magnificent ruins of Hampi. I'm here to help you discover the wonders of the Vijayanagara Empire. How can I assist you today?" }] },
      ...geminiMessages,
    ];

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
            maxOutputTokens: 1024,
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
