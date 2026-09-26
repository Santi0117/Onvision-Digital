import { assistantContext, type ChatMessage } from "./assistant-context";
import { replyForPrompt } from "./company";

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function fallbackReply(message: string): string {
  const reply = replyForPrompt(message);
  const texts = reply.steps
    .filter((step) => step.kind === "text" || step.kind === "code")
    .map((step) => step.text);
  if (texts.length) return texts.join("\n\n");
  return (
    reply.ask ??
    "Puedo ayudarte con sitios, tiendas, software o el SaaS Onvision. Contame qué necesitás o agendá en /digital#agendar."
  );
}

export async function getAssistantReply(
  message: string,
  history: ChatMessage[] = [],
): Promise<{ reply: string; provider: "openai" | "fallback" }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return { reply: fallbackReply(message), provider: "fallback" };
  }

  try {
    const messages = [
      { role: "system" as const, content: assistantContext.systemPrompt },
      ...history.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: assistantContext.model,
        messages,
        temperature: assistantContext.temperature,
        max_tokens: assistantContext.maxTokens,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI error:", err);
      return { reply: fallbackReply(message), provider: "fallback" };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return { reply: fallbackReply(message), provider: "fallback" };
    }

    return { reply, provider: "openai" };
  } catch (error) {
    console.error("OpenAI fetch failed:", error);
    return { reply: fallbackReply(message), provider: "fallback" };
  }
}
