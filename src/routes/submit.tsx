import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { analyzeProblem } from '../lib/ai.server'
import { createVexation } from '../lib/db'
import { useAuth } from '../lib/auth/AuthContext'
import type { AIAnalysis } from '../types'

import SubmitForm from '../components/forms/SubmitForm'
import SubmitSuccess from '../components/forms/SubmitSuccess'
import SubmitVerifyModal from '../components/forms/SubmitVerifyModal'

export const Route = createFileRoute('/submit')({
  validateSearch: (search: Record<string, unknown>) => ({
    prefill: (search.prefill as string) || '',
  }),
  component: SubmitPage,
})

type SubmitState = 'idle' | 'analyzing' | 'verifying' | 'saving' | 'success' | 'error'

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

      // Step 2: Verify information
      setState('verifying')

    } catch (err) {
      setState('error')
      setErrorMsg(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      )
    }
  }

  async function handleConfirm(updatedData: { 
    title: string; 
    description: string; 
    aiResult: AIAnalysis 
  }) {
    try {
      // Step 3: Save to Firestore Database
      setState('saving')

      const docId = await createVexation(
        { title: updatedData.title.trim(), description: updatedData.description.trim() },
        updatedData.aiResult,
        user?.uid,
        user?.displayName ?? undefined,
      )

      setTitle(updatedData.title)
      setDescription(updatedData.description)
      setAiResult(updatedData.aiResult)
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
    <>
      {(state === 'verifying' || state === 'saving') && aiResult && (
        <SubmitVerifyModal
          initialTitle={title}
          initialDescription={description}
          initialAiResult={aiResult}
          isSaving={state === 'saving'}
          onCancel={() => setState('idle')}
          onConfirm={handleConfirm}
        />
      )}

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
    </>
  )
}
