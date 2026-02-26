import { createServerFn } from "@tanstack/react-start"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

export const analyzeProblem = createServerFn({ method: 'POST' })
  .inputValidator((data: { title: string; description: string; }) => data)
  .handler(async ({ data }) => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'minimax/minimax-m2.5',
        messages: [
          {
            role: 'system',
            content: `You are a problem categorization AI. Analyze the user-submitted problem and return a JSON object with:
- "category": one of ["health", "finance", "logistics", "productivity", "education", "environment", "social", "technology", "other"]
- "tags": array of 3-5 relevant tags
- "severity": "low" | "medium" | "high" | "critical"
- "summary": a concise 1-2 sentence summary
- "technicalComplexity": "beginner" | "intermediate" | "advanced"
Only respond with valid JSON.`,
          },
          {
            role: 'user',
            content: `Title: ${data.title}\n\nDescription: ${data.description}`,
          },
        ],
        response_format: { type: 'json_object' },
      })
    })

    const result = await response.json()

    return JSON.parse(result.choices[0].message.content)
  })