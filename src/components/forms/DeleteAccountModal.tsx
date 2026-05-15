import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, AlertTriangle } from 'lucide-react'
import {
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider
} from 'firebase/auth'
import { useAuth } from '../../lib/auth/AuthContext'
import {
  deleteUserProfile,
  cascadeDeletePoster,
  cascadeDeleteSolver
} from '../../lib/db'
import type { UserRole } from '../../types'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  displayName: string
  role: UserRole
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  displayName,
  role
}: DeleteAccountModalProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [confirmName, setConfirmName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'confirm' | 'reauth'>('confirm')

  if (!isOpen || !user) return null

  const isEmailUser = user.providerData[0]?.providerId === 'password'
  const nameMatches = confirmName.trim() === displayName.trim()

  function handleClose() {
    setConfirmName('')
    setPassword('')
    setError(null)
    setStep('confirm')
    onClose()
  }

  function handleProceedToReauth() {
    setStep('reauth')
    setError(null)
  }

  async function handleDelete() {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      // Step 1: Re-authenticate
      if (isEmailUser) {
        if (!password) {
          setError('Please enter your current password.')
          setLoading(false)
          return
        }
        const credential = EmailAuthProvider.credential(user.email!, password)
        await reauthenticateWithCredential(user, credential)
      } else {
        // OAuth re-auth
        const providerId = user.providerData[0]?.providerId
        let provider

        switch (providerId) {
          case 'google.com':
            provider = new GoogleAuthProvider()
            break
          case 'github.com':
            provider = new GithubAuthProvider()
            break
          case 'microsoft.com':
            provider = new OAuthProvider('microsoft.com')
            break
          default:
            provider = new GoogleAuthProvider()
        }

        await reauthenticateWithPopup(user, provider)
      }

      // Step 2: Run cascade based on role
      if (role === 'Poster') {
        await cascadeDeletePoster(user.uid)
      } else {
        await cascadeDeleteSolver(user.uid)
      }

      // Step 3: Delete Firestore profile
      await deleteUserProfile(user.uid)

      // Step 4: Delete Firebase Auth account
      await user.delete()

      // Step 5: Redirect
      navigate({ to: '/signIn', replace: true })
    } catch (err: any) {
      console.error('Account deletion failed:', err)
      const message =
        err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
          ? 'Incorrect password. Please try again.'
          : err.code === 'auth/popup-closed-by-user'
            ? 'Re-authentication cancelled. Please try again.'
            : err.message || 'Failed to delete account.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-vexed-bg2 border border-vexed-accent2 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-vexed-accent2 bg-vexed-bg1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-600/10 border border-rose-500/20">
              <AlertTriangle size={20} className="text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Delete Account</h2>
              <p className="text-xs text-vexed-dim mt-0.5">This action is irreversible.</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-400 bg-red-900/10 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          {step === 'confirm' ? (
            <>
              {/* Consequences */}
              <div className="space-y-2">
                <p className="text-sm text-slate-300">
                  Deleting your account will:
                </p>
                <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
                  <li>Permanently remove your profile</li>
                  {role === 'Poster' ? (
                    <li>Close all your Vexations and mark them as <span className="text-rose-400 font-semibold">[Deleted User]</span></li>
                  ) : (
                    <li>Mark all your Solutions as <span className="text-rose-400 font-semibold">[Deleted User]</span></li>
                  )}
                </ul>
              </div>

              {/* Name confirmation */}
              <div>
                <label className="block text-xs font-semibold text-vexed-dim tracking-wider mb-2">
                  Type <span className="text-rose-400">"{displayName}"</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                  placeholder="Enter your display name"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-vexed-dim hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProceedToReauth}
                  disabled={!nameMatches}
                  className="px-5 py-2.5 rounded-lg bg-rose-600/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600/20 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Re-authentication step */}
              <p className="text-sm text-slate-300">
                {isEmailUser
                  ? 'Enter your current password to confirm deletion.'
                  : 'You will be asked to re-authenticate with your provider.'}
              </p>

              {isEmailUser && (
                <div>
                  <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                    placeholder="Enter your password"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('confirm')}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-vexed-dim hover:text-white transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading || (isEmailUser && !password)}
                  className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}