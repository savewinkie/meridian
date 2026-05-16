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
    const { files } = await req.json() as { files: { name: string; content: string }[] }

    if (!Array.isArray(files) || files.length === 0 || files.length > 10) {
      return NextResponse.json({ error: "Provide between 1 and 10 files." }, { status: 400 })
    }

    // Validate each file
    for (const f of files) {
      if (!f.name || typeof f.content !== "string" || f.content.length > 20000) {
        return NextResponse.json({ error: `Invalid file: ${f.name}` }, { status: 400 })
      }
    }

    // Scan each file sequentially (keep API calls manageable)
    const results = []
    for (const file of files) {
      if (!file.content.trim()) {
        results.push({ name: file.name, error: "Empty file" })
        continue
      }

      try {
        const msg = await client.messages.create({
          model: "claude-opus-4-7",
          max_tokens: 6000,
          messages: [
            {
              role: "user",
              content: `You are Meridian AI, powered by Claude Opus 4.7. Analyze the file "${file.name}" for bugs, security vulnerabilities, performance issues, and logic errors. Produce a corrected version.

Return ONLY valid JSON (no markdown, no fences):

{
  "name": "${file.name}",
  "language": "<detected language>",
  "score": { "before": <0-100>, "after": <0-100> },
  "summary": "<2 sentence expert summary>",
  "issueCount": <total number of issues found>,
  "criticalCount": <number of Critical severity issues>,
  "highCount": <number of High severity issues>,
  "issues": [
    {
      "line": <integer or null>,
      "severity": "Critical"|"High"|"Medium"|"Low",
      "type": "Security"|"Bug"|"Performance"|"Logic"|"Style",
      "title": "<short title, max 8 words>",
      "description": "<1-2 sentences>",
      "fix": "<what was changed and why>"
    }
  ],
  "fixedCode": "<complete fixed file — never truncate>"
}

File content:
\`\`\`
${file.content}
\`\`\``,
            },
          ],
        })

        const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : ""
        const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
        results.push(JSON.parse(cleaned))
      } catch (err: any) {
        results.push({ name: file.name, error: err.message ?? "Scan failed" })
      }
    }

    return NextResponse.json({ results })
  } catch (err) {
    console.error("Batch scan error:", err)
    return NextResponse.json({ error: "Batch scan failed. Please try again." }, { status: 500 })
  }
}
