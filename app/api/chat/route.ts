import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get user input (text + targetLang) from request body
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return new Response(
        JSON.stringify({ error: "❌ Provide both { text, targetLang } in request body" }),
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "❌ Missing Google Generative AI API Key" }),
        { status: 500 }
      );
    }

    // Ask Gemini model to translate
    const result = await streamText({
      model: google("gemini-2.0-flash"),
      messages: [
        {
          role: "system",
          content: `You are a translation assistant. Translate user text into ${targetLang}. Only return the translated text.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    // Stream back the translated response
    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500 }
    );
  }
}
