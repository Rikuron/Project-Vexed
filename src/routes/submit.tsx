import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { analyzeProblem } from '../lib/ai.server'
import { createVexation } from '../lib/firestore'
import { useAuth } from '../lib/auth'
import type { AIAnalysis } from '../lib/types'

import SubmitForm from '../components/forms/SubmitForm'
import SubmitSuccess from '../components/forms/SubmitSuccess'

export const Route = createFileRoute('/submit')({
  validateSearch: (search: Record<string, unknown>) => ({
    prefill: (search.prefill as string) || '',
  }),
  component: SubmitPage,
})

type SubmitState = 'idle' | 'analyzing' | 'saving' | 'success' | 'error'

function SubmitPage() {
  const { prefill } = Route.useSearch()
  const { user } = useAuth()

  const [title, setTitle] = useState(prefill)
  const [description, setDescription] = useState('')
  const [state, setState] = useState<SubmitState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [aiResult, setAiResult] = useState<AIAnalysis | null>(null)
  const [createdId, setCreatedId] = useState('')

  const canSubmit = title.trim().length >= 5 && description.trim().length >= 20

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setErrorMsg('')

    try {
      // Step 1: AI analysis
      setState('analyzing')
      const analysis = await analyzeProblem({
        data: { title: title.trim(), description: description.trim() },
      })
      setAiResult(analysis)

      // Step 2: Save to Firestore
      setState('saving')
      const docId = await createVexation(
        { title: title.trim(), description: description.trim() },
        analysis,
        user?.uid,
        user?.displayName ?? undefined,
      )
      setCreatedId(docId)

      setState('success')
    } catch (err) {
      setState('error')
      setErrorMsg(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      )
    }
  }

  function handleReset() {
    setTitle('')
    setDescription('')
    setAiResult(null)
    setCreatedId('')
    setState('idle')
  }

  // Render
  if (state === 'success') {
    return (
      <SubmitSuccess 
        createdId={createdId} 
        aiResult={aiResult} 
        onReset={handleReset} 
      />
    )
  }

  return (
    <SubmitForm
      user={user}
      title={title}
      setTitle={setTitle}
      description={description}
      setDescription={setDescription}
      state={state}
      errorMsg={errorMsg}
      onSubmit={handleSubmit}
      canSubmit={canSubmit}
    />
  )
}
