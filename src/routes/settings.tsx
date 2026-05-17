import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { Loader2, Camera, X, Plus, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../lib/auth/AuthContext'
import { updateUserProfile, uploadAvatar, updateCommentAuthorInfo } from '../lib/db'
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import type { UserProfile } from '../types'
import DeleteAccountModal from '../components/forms/DeleteAccountModal'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const navigate = useNavigate()
  const { user, userProfile, loading: authLoading, refreshProfile } = useAuth()

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: '/signIn', replace: true })
    }
  }, [user, authLoading, navigate])

  // Profile form state
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [industry, setIndustry] = useState('')
  const [company, setCompany] = useState('')
  const [github, setGithub] = useState('')
  const [website, setWebsite] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // UI state
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // Populate form from profile
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '')
      setBio(userProfile.bio || '')
      setIndustry(userProfile.industry || '')
      setCompany(userProfile.company || '')
      setGithub(userProfile.github || '')
      setWebsite(userProfile.website || '')
      setSkills(userProfile.skills || [])
      setAvatarPreview(userProfile.photoURL || null)
    }
  }, [userProfile])

  // Auto-dismiss feedback
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  if (authLoading || !user || !userProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    )
  }

  const isPoster = userProfile.role === 'Poster'
  const isEmailUser = user.providerData[0]?.providerId === 'password'

  // Avatar handler
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setFeedback({ type: 'error', message: 'Only JPG, PNG, and WebP images are allowed.' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Avatar must be under 2MB.' })
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  // Skills handlers
  function addSkill() {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
    }
    setSkillInput('')
  }

  function removeSkill(index: number) {
    setSkills(skills.filter((_, i) => i !== index))
  }

  function handleSkillKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  // Save profile handler
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !userProfile) return
    if (!displayName.trim()) {
      setFeedback({ type: 'error', message: 'Display Name is required.' })
      return
    }

    setProfileSaving(true)
    setFeedback(null)

    try {
      let photoURL = userProfile.photoURL

      // Upload new avatar if selected
      if (avatarFile) {
        photoURL = await uploadAvatar(avatarFile, user.uid)
        setAvatarFile(null)
      }

      // Build update payload (shared + role-specific)
      const updates: Partial<Omit<UserProfile, 'uid' | 'createdAt'>> = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        photoURL,
      }

      if (isPoster) {
        updates.industry = industry.trim()
        updates.company = company.trim()
      } else {
        updates.github = github.trim()
        updates.website = website.trim()
        updates.skills = skills
      }

      // Update Firestore profile
      await updateUserProfile(user.uid, updates)

      // Sync Firebase Auth displayName + photoURL
      await updateProfile(user, {
        displayName: displayName.trim(),
        photoURL: photoURL,
      })

      // Refresh cached profile in AuthContext
      await refreshProfile()

      // Fan-out: Update all comments by this user
      await updateCommentAuthorInfo(user.uid, displayName.trim(), photoURL ?? null)

      setFeedback({ type: 'success', message: 'Profile updated successfully!' })
    } catch (err: any) {
      console.error('Failed to update profile:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to update profile.' })
    } finally {
      setProfileSaving(false)
    }
  }

  // Change password handler
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'New password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match.' })
      return
    }

    setPasswordSaving(true)
    setFeedback(null)

    try {
      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email!, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setFeedback({ type: 'success', message: 'Password changed successfully!' })
    } catch (err: any) {
      console.error('Failed to change password:', err)
      const message =
        err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
          ? 'Current password is incorrect.'
          : err.message || 'Failed to change password.'
      setFeedback({ type: 'error', message })
    } finally {
      setPasswordSaving(false)
    }
  }

  // Format joined date
  const joinedDate = userProfile.createdAt?.toDate
    ? userProfile.createdAt.toDate().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">⚙ User Settings</h1>
          <p className="text-sm text-vexed-dim mt-1">Manage your profile and account preferences.</p>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`mb-6 p-3 text-sm rounded-lg border ${
              feedback.type === 'success'
                ? 'text-emerald-400 bg-emerald-900/10 border-emerald-500/20'
                : 'text-red-400 bg-red-900/10 border-red-500/20'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* ─── PROFILE SECTION ─── */}
        <form onSubmit={handleSaveProfile}>
          <div className="bg-vexed-bg1 border border-vexed-accent2 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-vexed-dim uppercase tracking-widest border-b border-vexed-accent2 pb-2">
              Profile
            </h2>

            {/* Avatar */}
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="relative group cursor-pointer shrink-0"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover border-2 border-vexed-accent2 group-hover:border-vexed-primary transition-colors"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-vexed-accent2 group-hover:border-vexed-primary transition-colors">
                    {displayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </button>
              <div>
                <p className="text-sm font-medium text-white">Profile Photo</p>
                <p className="text-xs text-vexed-dim mt-0.5">JPG, PNG, or WebP. Max 2MB.</p>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">
                Display Name *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
                placeholder="Your display name"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">
                Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
                placeholder="Tell others a bit about yourself..."
              />
            </div>

            {/* Role-Specific Fields */}
            {isPoster ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
                    placeholder="e.g. Healthcare, Fintech, Education"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
                    placeholder="Your company or organization"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
                    placeholder="e.g. octocat"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
                    placeholder="https://your-portfolio.dev"
                  />
                </div>

                {/* Skills Chip Input */}
                <div>
                  <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 bg-vexed-highlight1/20 text-vexed-highlight2 text-xs font-bold rounded-full px-3 py-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(i)}
                          className="hover:text-white transition-colors cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      className="flex-1 bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none"
                      placeholder="Type a skill and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-3 py-2.5 bg-vexed-bg4 border border-vexed-accent2 rounded-lg text-vexed-dim hover:text-white hover:border-vexed-primary transition-colors cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Save Profile Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-2.5 rounded-lg bg-vexed-primary hover:bg-vexed-secondary text-sm font-semibold text-white transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileSaving && <Loader2 size={16} className="animate-spin" />}
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>

        {/* ─── ACCOUNT SECTION ─── */}
        <div className="bg-vexed-bg1 border border-vexed-accent2 rounded-2xl p-6 space-y-6 mt-6">
          <h2 className="text-sm font-bold text-vexed-dim uppercase tracking-widest border-b border-vexed-accent2 pb-2">
            Account
          </h2>

          {/* Read-only info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm text-white truncate">{user.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-1">Role</p>
              <p className="text-sm text-white">{userProfile.role}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-1">Joined</p>
              <p className="text-sm text-white">{joinedDate}</p>
            </div>
          </div>

          {/* Change Password (email users only) */}
          {isEmailUser && (
            <form onSubmit={handleChangePassword} className="space-y-4 pt-4 border-t border-vexed-accent2">
              <h3 className="text-xs font-semibold text-vexed-dim uppercase tracking-wider">Change Password</h3>

              <div>
                <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:border-vexed-primary focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-vexed-dim hover:text-white transition-colors cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:border-vexed-primary focus:outline-none"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-vexed-dim hover:text-white transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-vexed-dim uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:border-vexed-primary focus:outline-none"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-vexed-dim hover:text-white transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-6 py-2.5 rounded-lg bg-vexed-primary hover:bg-vexed-secondary text-sm font-semibold text-white transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordSaving && <Loader2 size={16} className="animate-spin" />}
                  {passwordSaving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* DANGER ZONE */}
        <div className="bg-rose-600/5 border border-rose-500/20 rounded-2xl p-6 space-y-4 mt-6">
          <h2 className="text-sm font-bold text-rose-400 uppercase tracking-widest border-b border-rose-500/20 pb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-rose-300/80">
            ⚠ This action is permanent and cannot be undone.
          </p>
          <ul className="text-sm text-rose-300/60 list-disc list-inside space-y-1">
            <li>Your profile will be permanently deleted</li>
            {isPoster ? (
              <li>Your vexations will be closed and marked as [Deleted User]</li>
            ) : (
              <li>Your solutions will remain but marked as [Deleted User]</li>
            )}
          </ul>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-rose-600/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600/20 text-sm font-semibold transition-colors cursor-pointer"
          >
            Delete My Account
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        displayName={userProfile.displayName || ''}
        role={userProfile.role}
      />
    </div>
  )
}