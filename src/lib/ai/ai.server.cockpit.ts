/**
 * AI Server Functions — Ollama Cloud via Cockpit Key Rotation        
 *
 * Firebase App Hosting deployment. Keys come from COCKPIT_KEYS env var only.
 * Auto-rotates on 429 rate limits.
 *
 * Set in Firebase env config:
 *   COCKPIT_KEYS=[{"id":"main","apiKey":"sk-..."},{"id":"alt-1","apiKey":"sk-..."}]
 *   OLLAMA_CLOUD_MODEL=minimax-m2.7:cloud  (optional, defaults to minimax-m2.7:cloud)
 *
 * Endpoint: https://ollama.com/v1/chat/completions
 */

import { createServerFn } from "@tanstack/react-start"
import type { AIAnalysis } from "../../types"
import { cockpitFetch, getPoolSnapshot, hasCockpitPool } from "./cockpit"

// ─── Config ────────────────────────────────────────────────

const PROVIDER_ID = 'ollama-cloud'
const API_ENDPOINT = 'https://ollama.com/v1/chat/completions'
const DEFAULT_MODEL = 'minimax-m2.5:cloud'

function buildFetch(): typeof fetch {
  if (hasCockpitPool(PROVIDER_ID)) return cockpitFetch(PROVIDER_ID)

  const envKey = process.env.COCKPIT_KEYS
  if (!envKey) {
    throw new Error(
      'No API keys configured. Set COCKPIT_KEYS in your Firebase env vonfig. \n' +
      '  COCKPIT_KEYS=[{"id":"main","apiKey":"sk-..."},{"id":"alt-1","apiKey":"sk-..."}]'
    )
  }

  return ((input: RequestInfo | URL, init?: RequestInit) => {
    const patched = { ...init }
    patched.headers = {
      ...(patched.headers as Record<string, string> ?? {}),
      Authorization: `Bearer ${envKey}`,
    }
    return globalThis.fetch(input, patched)
  }) as typeof fetch
}

// ─── System Prompts ────────────────────────────────────────

const ANALYZE_SYSTEM_PROMPT = `You are a problem categorization AI and strict Content Moderator for a platform called Vexed, where people submit real-world frustrations ("vexations") and developers pick them up as project ideas.
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
Only respond with valid JSON. No markdown, no explanation, just the JSON object.`

const VALIDATE_SYSTEM_PROMPT = `You are a strict Content Moderator for the Vexed platform.
Analyze the input for policy violations and substance. If the input contains sexually explicit or adult content (NSFW), is in bad taste, criminal in nature, encourages discrimination/harm, contains hate speech, or violates standard terms of service/rights, you MUST set "isViolatingPolicies" to true and provide a "violationReason" explaining why.
If the input is gibberish, lacks any substantial meaning, is too short to understand, or doesn't describe an actual frustration or problem, you MUST also set "isViolatingPolicies" to true and provide a "violationReason" explaining that the input lacks substance or is unclear.
If it is safe and describes a meaningful problem, set "isViolatingPolicies" to false and leave "violationReason" empty or null.
Only respond with a JSON object containing these exact fields:
- "isViolatingPolicies": boolean
- "violationReason": string | null`

// ─── Server Functions ──────────────────────────────────────

/**
 * Analyze a problem submission — full AI categorization + content moderation.
 * Uses cockpit key rotation for Ollama Cloud.
 */
export const analyzeProblem = createServerFn({ method: 'POST' })
  .inputValidator((data: { title: string; description: string; }) => data)
  .handler(async ({ data }): Promise<AIAnalysis> => {
    const apiFetch = buildFetch()

    try {
      const response = await apiFetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          max_tokens: 1024,
          messages: [
            { role: 'system', content: ANALYZE_SYSTEM_PROMPT },
            { role: 'user', content: `Title: ${data.title}\n\nDescription: ${data.description}` },
          ],
          response_format: { type: 'json_object' },
        })
      })

      if (!response.ok) {
        const errorBody = await response.text()
        // Log cockpit status on failure for debugging
        const status = getPoolSnapshot(PROVIDER_ID)
        if (status) {
          console.error(`[vexed-ai] API ${response.status} — cockpit: K${status.activeIndex + 1}/${status.totalKeys}, exhausted: ${status.allExhausted}`)
        }
        throw new Error(`Ollama Cloud API returned ${response.status}: ${errorBody}`)
      }

      const result = await response.json()
      const content = result.choices?.[0]?.message?.content

      if (!content) throw new Error('Ollama Cloud returned an empty response.')

      const parsed: AIAnalysis = JSON.parse(content)

      if (parsed.isViolatingPolicies) throw new Error(`Submission rejected: ${parsed.violationReason || 'This content violates platform policies.'}`)
      
      return parsed
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error('AI returned invalid JSON. Please try submitting again.')
      throw error instanceof Error ? error : new Error('An unexpected error occurred while analyzing the problem.')
    }
  })

/**
 * Validate edits to an existing vexation — policy check only.
 * Uses cockpit key rotation for Ollama Cloud.
 */
export const validateProblemEdit = createServerFn({ method: 'POST' })
  .inputValidator((data: { title: string; description: string; }) => data)
  .handler(async ({ data }): Promise<{ isViolatingPolicies: boolean; violationReason: string | null }> => {
    const apiFetch = buildFetch()

    try {
      const response = await apiFetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          max_tokens: 1024,
          messages: [
            { role: 'system', content: VALIDATE_SYSTEM_PROMPT },
            { role: 'user', content: `Title: ${data.title}\n\nDescription: ${data.description}` },
          ],
          response_format: { type: 'json_object' },
        })
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`Ollama Cloud API returned ${response.status}: ${errorBody}`)
      }

      const result = await response.json()
      const content = result.choices?.[0]?.message?.content

      if (!content) throw new Error('Ollama Cloud returned an empty response.')

      return JSON.parse(content)
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error('AI returned invalid JSON. Please try submitting again.')
      throw error instanceof Error ? error : new Error('An unexpected error occurred while analyzing the problem.')
    }
  })