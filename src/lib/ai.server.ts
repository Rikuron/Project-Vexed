import { createServerFn } from "@tanstack/react-start"
import type { AIAnalysis } from "./types";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

/**
 * Server function that sends a problem title + description to OpenRouter
 * for AI categorization and analysis. Runs server-side only — the API key
 * is never exposed to the client.
 */
export const analyzeProblem = createServerFn({ method: 'POST' })
  .inputValidator((data: { title: string; description: string; }) => data)
  .handler(async ({ data }): Promise<AIAnalysis> => {
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not configured on the server.')

    try {
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
              content: `You are a problem categorization AI for a platform called Vexed, where people submit real-world frustrations ("vexations") and developers pick them up as project ideas.
Analyze the user-submitted problem and return a JSON object with these exact fields:
- "sector": one of ["Health", "Finance", "Logistics", "Productivity", "Agriculture", "Education", "Environment", "Social", "Technology", "AI/ML", "Other"]
- "category": a specific sub-category within the sector (e.g. "payment processing", "patient triage")
- "tags": array of 3-5 relevant technical/domain tags
- "severity": "Low" | "Medium" | "High" | "Critical"
- "summary": a concise 1-2 sentence summary written for a developer audience
- "technicalComplexity": "Beginner" | "Intermediate" | "Advanced"
- "keyChallenges": array of 2-4 key technical challenges a developer would face solving this
- "suggestedTechStack": array of 2-4 technologies/tools that could help solve this problem
Only respond with valid JSON. No markdown, no explanation, just the JSON object.`,
            },
            {
              role: 'user',
              content: `Title: ${data.title}\n\nDescription: ${data.description}`,
            },
          ],
          response_format: { type: 'json_object' },
        })
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`OpenRouter API returned ${response.status}: ${errorBody}`)
      }

      const result = await response.json()
      const content = result.choices?.[0]?.message?.content

      if (!content) throw new Error('OpenRouter returned an empty response.')

      const parsed: AIAnalysis = JSON.parse(content)
      return parsed
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error('AI returned invalid JSON. Please try submitting again.')
      throw error instanceof Error ? error : new Error('An unexpected error occurred while analyzing the problem.')
    }
  })