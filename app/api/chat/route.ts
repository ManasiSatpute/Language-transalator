import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "❌ Missing Google Generative AI API Key" }),
        { status: 500 }
      );
    }

    const result = await streamText({
      model: google("gemini-2.0-flash"),
      messages: convertToModelMessages(messages),
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500 }
    );
  }
}
