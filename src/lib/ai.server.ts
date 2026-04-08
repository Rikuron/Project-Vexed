import { createServerFn } from "@tanstack/react-start"
import type { AIAnalysis } from "../types"

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
          max_tokens: 1024,
          messages: [
            {
              role: 'system',
              content: `You are a problem categorization AI and strict Content Moderator for a platform called Vexed, where people submit real-world frustrations ("vexations") and developers pick them up as project ideas.
First, rigorously analyze the input for policy violations and substance. If the input contains sexually explicit or adult content (NSFW), is in bad taste, criminal in nature, encourages discrimination/harm, contains hate speech, or violates standard terms of service/rights, you MUST set "isViolatingPolicies" to true and provide a "violationReason" explaining why.
Additionally, if the input is gibberish, lacks any substantial meaning, is too short to understand, or doesn't describe an actual frustration or problem that a developer could potentially solve, you MUST also set "isViolatingPolicies" to true and provide a "violationReason" explaining that the input lacks substance or is unclear.
If it is safe and describes a meaningful problem, set "isViolatingPolicies" to false and leave "violationReason" empty or null.

Analyze the safe problem and return a JSON object with these exact fields:
- "isViolatingPolicies": boolean
- "violationReason": string | null
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

      if (parsed.isViolatingPolicies) throw new Error(`Submission rejected: ${parsed.violationReason || 'This content violates platform policies.'}`)
      
      return parsed
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error('AI returned invalid JSON. Please try submitting again.')
      throw error instanceof Error ? error : new Error('An unexpected error occurred while analyzing the problem.')
    }
  })

/**
 * Server function that sends a problem + title + description to OpenRouter
 * to validate edits to an existing Vexation. It only returns policy violation status
 */
export const validateProblemEdit = createServerFn({ method: 'POST' })
  .inputValidator((data: { title: string; description: string; }) => data)
  .handler(async ({ data }): Promise<{ isViolatingPolicies: boolean; violationReason: string | null }> => {
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not configured on the server.')

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'minimax/minimax-m2.5',
          max_tokens: 1024,
          messages: [
            { 
              role: 'system',
              content: `You are a strict Content Moderator for the Vexed platform.
Analyze the input for policy violations and substance. If the input contains sexually explicit or adult content (NSFW), is in bad taste, criminal in nature, encourages discrimination/harm, contains hate speech, or violates standard terms of service/rights, you MUST set "isViolatingPolicies" to true and provide a "violationReason" explaining why.
If the input is gibberish, lacks any substantial meaning, is too short to understand, or doesn't describe an actual frustration or problem, you MUST also set "isViolatingPolicies" to true and provide a "violationReason" explaining that the input lacks substance or is unclear.
If it is safe and describes a meaningful problem, set "isViolatingPolicies" to false and leave "violationReason" empty or null.
Only respond with a JSON object containing these exact fields:
- "isViolatingPolicies": boolean
- "violationReason": string | null`,
            },
            {
              role: 'user',
              content: `Title: ${data.title}\n\nDescription: ${data.description}`,
            },
          ],
          response_format: {
            type: 'json_object'
          },
        })
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`OpenRouter API returned ${response.status}: ${errorBody}`)
      }

      const result = await response.json()
      const content = result.choices?.[0]?.message?.content

      if (!content) throw new Error('OpenRouter returned an empty response.')

      return JSON.parse(content)
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error('AI returned invalid JSON. Please try submitting again.')
      throw error instanceof Error ? error : new Error('An unexpected error occurred while analyzing the problem.')
    }
  })