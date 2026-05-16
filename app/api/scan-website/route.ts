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
    const { url } = await req.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Fetch the page server-side to bypass CORS
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    let html: string
    try {
      const response = await fetch(parsedUrl.href, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MeridianBot/1.0; +https://meridian.ai)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      })
      clearTimeout(timeout)
      if (!response.ok) {
        return NextResponse.json({ error: `Failed to fetch URL: ${response.status} ${response.statusText}` }, { status: 400 })
      }
      const text = await response.text()
      // Limit to 60k chars to avoid token overflows
      html = text.slice(0, 60000)
    } catch (err: any) {
      clearTimeout(timeout)
      if (err.name === "AbortError") {
        return NextResponse.json({ error: "Request timed out — the site took too long to respond." }, { status: 408 })
      }
      return NextResponse.json({ error: `Could not reach URL: ${err.message}` }, { status: 400 })
    }

    const msg = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: `You are Meridian AI, an expert web performance and security auditor powered by Claude Opus 4.7. Analyze the following website source code from ${parsedUrl.href} and produce a comprehensive audit.

Return ONLY valid JSON with EXACTLY this structure (no markdown, no code fences, no text outside the JSON):

{
  "url": "${parsedUrl.href}",
  "title": "<page title from <title> tag, or 'Unknown'>",
  "overallScore": <integer 0-100, honest overall quality score>,
  "categories": [
    {
      "name": "HTML Structure",
      "score": <integer 0-100>,
      "icon": "code",
      "issues": [{"severity": "Critical"|"High"|"Medium"|"Low", "title": "<short title>", "description": "<1-2 sentence explanation>", "fix": "<specific fix>"}]
    },
    {
      "name": "CSS & Styling",
      "score": <integer 0-100>,
      "icon": "palette",
      "issues": [...]
    },
    {
      "name": "JavaScript",
      "score": <integer 0-100>,
      "icon": "zap",
      "issues": [...]
    },
    {
      "name": "Performance",
      "score": <integer 0-100>,
      "icon": "gauge",
      "issues": [...]
    },
    {
      "name": "SEO",
      "score": <integer 0-100>,
      "icon": "search",
      "issues": [...]
    },
    {
      "name": "Security",
      "score": <integer 0-100>,
      "icon": "shield",
      "issues": [...]
    },
    {
      "name": "Accessibility",
      "score": <integer 0-100>,
      "icon": "eye",
      "issues": [...]
    }
  ],
  "summary": "<expert 3-4 sentence overall assessment of the site's quality, main problems, and key improvements>",
  "fixedHtml": "<the complete improved HTML with all fixes applied — preserve the full document structure>"
}

Scoring: 0-20 dangerously broken, 21-40 critical problems, 41-60 significant issues, 61-80 minor issues, 81-100 excellent.

Rules:
- Be exhaustive — find every issue across all categories
- For fixedHtml: apply all HTML, SEO, accessibility, and inline script/style fixes. Do NOT truncate.
- Security issues: XSS vectors, missing CSP headers hints, insecure resource loading, exposed secrets
- Performance: unoptimized images (missing width/height), render-blocking resources, missing lazy loading
- SEO: missing meta tags, missing Open Graph, missing structured data, poor heading hierarchy
- Accessibility: missing alt text, missing ARIA labels, poor color contrast indicators, missing lang attribute

Website HTML to analyze:
\`\`\`html
${html}
\`\`\``,
        },
      ],
    })

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : ""
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    const result = JSON.parse(cleaned)

    return NextResponse.json(result)
  } catch (err) {
    console.error("Website scan error:", err)
    return NextResponse.json({ error: "Scan failed. Please try again." }, { status: 500 })
  }
}
