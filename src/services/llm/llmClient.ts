import { parseJsonFromText } from "./jsonParser";

export type LlmProvider = "gemini" | "openai" | "anthropic" | "mock";

function getProvider(): LlmProvider {
  const provider = process.env.LLM_PROVIDER as LlmProvider | undefined;
  return provider ?? "mock";
}

async function callOpenAi(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.choices?.[0]?.message?.content as string | undefined;
}

async function callGemini(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing");
    return null;
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API Error (${response.status}):`, errText);
      return null;
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
  } catch (error) {
    console.error("Gemini Fetch Exception:", error);
    return null;
  }
}

async function callAnthropic(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest",
      max_tokens: 1000,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.content?.[0]?.text as string | undefined;
}

export async function generateJsonWithLlm<T>(params: {
  systemPrompt: string;
  userPrompt: string;
  fallback: T;
}): Promise<T> {
  const provider = getProvider();
  if (provider === "mock") return params.fallback;

  try {
    const raw =
      provider === "gemini"
        ? await callGemini(params.systemPrompt, params.userPrompt)
        : provider === "openai"
          ? await callOpenAi(params.systemPrompt, params.userPrompt)
          : await callAnthropic(params.systemPrompt, params.userPrompt);

    if (!raw) return params.fallback;
    return parseJsonFromText<T>(raw, params.fallback);
  } catch {
    return params.fallback;
  }
}
