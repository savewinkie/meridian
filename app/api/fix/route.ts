import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === "placeholder-key" || apiKey.startsWith("sk-ant-...")) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set. Add your real key to .env.local and restart the server." },
      { status: 500 }
    )
  }

  const client = new Anthropic({ apiKey })

  try {
    const { code, language } = await req.json()

    if (!code || typeof code !== "string" || code.trim().length < 5 || code.length > 20000) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const langHint =
      language && language !== "auto"
        ? `The code is written in ${language}.`
        : "Auto-detect the programming language."

    const msg = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: `You are Meridian AI, powered by Claude Opus 4.7 — the world's most capable AI model for code analysis. Your job is to perform an exhaustive scan for every bug, security vulnerability, performance issue, and logic error, then produce a completely corrected version of the code.

Return ONLY valid JSON with EXACTLY this structure (no markdown, no code fences, no text outside the JSON):

{
  "language": "<detected or specified language name>",
  "score": {
    "before": <integer 0-100, honest assessment of the original code quality>,
    "after": <integer 0-100, quality score after all fixes are applied — must be higher>
  },
  "summary": "<expert 2-3 sentence summary: overall quality, main issues found, impact of the fixes>",
  "issues": [
    {
      "line": <integer line number where issue is, or null if it applies to the whole file>,
      "severity": "Critical" | "High" | "Medium" | "Low",
      "type": "Security" | "Bug" | "Performance" | "Logic" | "Style",
      "title": "<short issue name, max 8 words>",
      "description": "<clear explanation of why this is a problem, 1-2 sentences>",
      "fix": "<specific explanation of what was changed and why, 1-2 sentences>"
    }
  ],
  "fixedCode": "<the complete, production-ready fixed version of the code — NEVER truncate, abbreviate with ..., or omit any part>"
}

Scoring guide:
- 0–20: Dangerously broken or insecure
- 21–40: Critical bugs or severe security holes
- 41–60: Significant problems that need attention
- 61–80: Minor issues, mostly correct
- 81–100: Clean, idiomatic, production-ready

Rules:
- Find EVERY issue — be exhaustive, not selective
- The "fixedCode" MUST be the complete, full file with every fix applied — never shorten it
- Add brief inline comments in the fixed code explaining WHY each fix was made
- Severity "Critical" = exploitable security hole or crash-level bug
- Severity "High" = serious bug or data integrity risk
- Severity "Medium" = incorrect behavior or notable inefficiency
- Severity "Low" = style, readability, or minor improvement
- ${langHint}

Code to analyze:
\`\`\`
${code}
\`\`\``,
        },
      ],
    })

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : ""

    // Strip any accidental markdown fences
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    const result = JSON.parse(cleaned)

    return NextResponse.json(result)
  } catch (err) {
    console.error("Fix error:", err)
    return NextResponse.json({ error: "Scan failed. Please try again." }, { status: 500 })
  }
}
