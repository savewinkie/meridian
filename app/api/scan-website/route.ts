import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

export const maxDuration = 300

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === "placeholder-key" || apiKey.startsWith("sk-ant-...")) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 500 })
  }

  const client = new Anthropic({ apiKey })

  try {
    const { url } = await req.json()
    if (!url || typeof url !== "string") return NextResponse.json({ error: "Invalid URL" }, { status: 400 })

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    let html: string
    try {
      const response = await fetch(parsedUrl.href, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      })
      clearTimeout(timeout)
      if (!response.ok) return NextResponse.json({ error: `Could not fetch site: ${response.status} ${response.statusText}` }, { status: 400 })
      html = (await response.text()).slice(0, 50000)
    } catch (err: any) {
      clearTimeout(timeout)
      if (err.name === "AbortError") return NextResponse.json({ error: "Request timed out — the site took too long to respond." }, { status: 408 })
      return NextResponse.json({ error: `Could not reach URL: ${err.message}` }, { status: 400 })
    }

    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: `You are Meridian AI, an expert web auditor. Analyze the website source from ${parsedUrl.href} and return a detailed audit.

Return ONLY valid JSON with EXACTLY this structure (no markdown, no code fences):

{
  "url": "${parsedUrl.href}",
  "title": "<page title from <title> tag or 'Unknown'>",
  "overallScore": <integer 0-100>,
  "categories": [
    { "name": "HTML Structure", "score": <0-100>, "icon": "code", "issues": [{"severity": "Critical"|"High"|"Medium"|"Low", "title": "<short>", "description": "<1-2 sentences>", "fix": "<specific fix>"}] },
    { "name": "Performance", "score": <0-100>, "icon": "gauge", "issues": [...] },
    { "name": "SEO", "score": <0-100>, "icon": "search", "issues": [...] },
    { "name": "Security", "score": <0-100>, "icon": "shield", "issues": [...] },
    { "name": "Accessibility", "score": <0-100>, "icon": "eye", "issues": [...] },
    { "name": "JavaScript", "score": <0-100>, "icon": "zap", "issues": [...] },
    { "name": "CSS & Styling", "score": <0-100>, "icon": "palette", "issues": [...] }
  ],
  "summary": "<3-4 sentence expert assessment>"
}

Be honest and thorough. Score 0-20 = broken, 21-40 = critical problems, 41-60 = significant issues, 61-80 = minor issues, 81-100 = excellent.

HTML:
\`\`\`html
${html}
\`\`\``,
      }],
    })

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : ""
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    return NextResponse.json(JSON.parse(cleaned))
  } catch (err) {
    console.error("Website scan error:", err)
    return NextResponse.json({ error: "Scan failed. Please try again." }, { status: 500 })
  }
}
