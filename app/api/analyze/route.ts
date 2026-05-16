import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic()

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== "string" || code.trim().length < 10 || code.length > 6000) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are Meridian AI, a world-class code security and quality reviewer. Analyze the code below and return ONLY valid JSON — no markdown, no code fences, no explanation outside the JSON object.

Required JSON format:
{
  "score": <integer 0-100 where 100 is production-perfect>,
  "summary": "<one concise sentence describing the overall code quality and main issues>",
  "issues": [
    {
      "line": <integer line number, or null if applies to whole snippet>,
      "severity": "Critical" | "High" | "Medium" | "Low",
      "category": "Security" | "Bug" | "Performance" | "Style",
      "title": "<issue title, max 7 words>",
      "description": "<what is wrong, 1-2 sentences>",
      "suggestion": "<how to fix it, 1-2 sentences>"
    }
  ]
}

Rules:
- Return 2-5 issues total
- Prioritize real security and correctness bugs
- Score: 0-30 = critical vulnerabilities, 31-60 = serious bugs, 61-85 = minor issues, 86-100 = clean code
- Be specific about line numbers when possible

Code to analyze:
\`\`\`
${code}
\`\`\``,
        },
      ],
    })

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : ""
    const result = JSON.parse(text)
    return NextResponse.json(result)
  } catch (err) {
    console.error("Analyze error:", err)
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 })
  }
}
