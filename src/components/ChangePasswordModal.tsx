import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { EyeIcon } from './icons'
import Modal from './Modal'
import './AddMemberModal.css'

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    setSubmitting(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess('Password updated successfully.')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <Modal title="Change Password" onClose={onClose}>
      <form className="member-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="newPassword">
          New Password
        </label>
        <div className="password-field">
          <input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
            disabled={submitting}
          />
          <button
            type="button"
            className="eye-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>

        <label className="field-label" htmlFor="confirmNewPassword">
          Confirm New Password
        </label>
        <input
          id="confirmNewPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
          disabled={submitting}
        />

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <div className="member-form-actions">
          <button type="button" className="cancel-btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Saving…' : 'Update Password'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ChangePasswordModal
