import OpenAI from "openai";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_DWIAI_MODEL,
  DWIAI_COOKIE_NAME,
  DWIAI_GENERIC_ERROR,
  DWIAI_INACTIVE_MESSAGE,
  dwiAiExpiresAt,
  dwiAiGreeting,
  getActiveDwiAiSetting,
  normalizeDwiAiModel,
  parseDwiAiMessages,
  serializeDwiAiCookie,
  toPrismaMessages,
  type DwiAiMessage,
} from "@/lib/dwiai";
import { checkDwiAiRateLimit } from "@/lib/dwiai-rate-limit";

export const runtime = "nodejs";

function createGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get(DWIAI_COOKIE_NAME)?.value || crypto.randomUUID();
}

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

function isModelUnavailable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: unknown; status?: unknown };
  return record.code === "model_not_found" || record.status === 404;
}

async function createCompletion({
  groq,
  model,
  messages,
  temperature,
  maxTokens,
}: {
  groq: OpenAI;
  model: string;
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  temperature: number;
  maxTokens: number;
}) {
  try {
    return await groq.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });
  } catch (error) {
    if (model !== DEFAULT_DWIAI_MODEL && isModelUnavailable(error)) {
      console.error(`Dwi AI model "${model}" unavailable, retrying "${DEFAULT_DWIAI_MODEL}".`);
      return groq.chat.completions.create({
        model: DEFAULT_DWIAI_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });
    }
    throw error;
  }
}

export async function GET() {
  const sessionId = await getSessionId();
  const setting = await getActiveDwiAiSetting();
  const session = await prisma.dwiAiSession.findUnique({ where: { sessionId } });
  const saved =
    session && session.expiresAt > new Date() ? parseDwiAiMessages(session.messages) : [];
  const assistantName = setting?.assistantName || "Dwi AI";
  const messages = saved.length > 0 ? saved : [dwiAiGreeting(assistantName)];

  const response = NextResponse.json({
    assistantName,
    isActive: Boolean(setting),
    messages,
  });
  response.headers.append("Set-Cookie", serializeDwiAiCookie(sessionId));
  return response;
}

export async function POST(request: Request) {
  const sessionId = await getSessionId();
  const setting = await getActiveDwiAiSetting();

  if (!setting) {
    const response = NextResponse.json({ error: DWIAI_INACTIVE_MESSAGE }, { status: 503 });
    response.headers.append("Set-Cookie", serializeDwiAiCookie(sessionId));
    return response;
  }

  let content = "";
  try {
    const body = (await request.json()) as { message?: unknown };
    content = typeof body.message === "string" ? body.message.trim() : "";
  } catch {
    content = "";
  }

  if (!content) {
    const response = NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
    response.headers.append("Set-Cookie", serializeDwiAiCookie(sessionId));
    return response;
  }

  const limit = checkDwiAiRateLimit(sessionId);
  if (!limit.allowed) {
    const response = NextResponse.json(
      { error: "Terlalu banyak request. Coba lagi sebentar ya." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
    response.headers.append("Set-Cookie", serializeDwiAiCookie(sessionId));
    return response;
  }

  const groq = createGroqClient();
  if (!groq) {
    console.error("Dwi AI chat failed: GROQ_API_KEY is not configured.");
    const response = NextResponse.json({ error: DWIAI_GENERIC_ERROR }, { status: 500 });
    response.headers.append("Set-Cookie", serializeDwiAiCookie(sessionId));
    return response;
  }

  const session = await prisma.dwiAiSession.findUnique({ where: { sessionId } });
  const history =
    session && session.expiresAt > new Date() ? parseDwiAiMessages(session.messages) : [];
  const recentHistory = history.slice(-10);
  const userMessage: DwiAiMessage = { role: "user", content };
  const groqMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: setting.systemPrompt },
    ...recentHistory,
    userMessage,
  ];

  let completion: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
  try {
    completion = await createCompletion({
      groq,
      model: normalizeDwiAiModel(setting.model),
      messages: groqMessages,
      temperature: setting.temperature,
      maxTokens: setting.maxTokens,
    });
  } catch (error) {
    console.error("Dwi AI Groq request failed:", error);
    const response = NextResponse.json({ error: DWIAI_GENERIC_ERROR }, { status: 500 });
    response.headers.append("Set-Cookie", serializeDwiAiCookie(sessionId));
    return response;
  }

  const encoder = new TextEncoder();
  let assistantContent = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const token = chunk.choices[0]?.delta?.content ?? "";
          if (!token) continue;
          assistantContent += token;
          controller.enqueue(encoder.encode(token));
        }

        const nextMessages: DwiAiMessage[] = [
          ...history,
          userMessage,
          { role: "assistant", content: assistantContent },
        ];

        await prisma.dwiAiSession.upsert({
          where: { sessionId },
          update: {
            ipAddress: clientIp(request),
            messages: toPrismaMessages(nextMessages),
            expiresAt: dwiAiExpiresAt(),
          },
          create: {
            sessionId,
            ipAddress: clientIp(request),
            messages: toPrismaMessages(nextMessages),
            expiresAt: dwiAiExpiresAt(),
          },
        });

        controller.close();
      } catch (error) {
        console.error("Dwi AI stream failed:", error);
        controller.enqueue(encoder.encode(DWIAI_GENERIC_ERROR));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "Set-Cookie": serializeDwiAiCookie(sessionId),
    },
  });
}
