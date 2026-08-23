import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import backgroundImage from '../assets/7882808.jpg'
import arkLogo from '../assets/ark-logo.png'
import { supabase } from '../lib/supabaseClient'
import { EyeIcon, ShieldIcon } from './icons'
import './AuthPage.css'

function SignUpPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    setSubmitting(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (data.session) {
      navigate('/')
      return
    }

    setSuccess('Account created! Check your email to confirm your account, then sign in.')
  }

  return (
    <div
      className="auth-page"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="auth-mask" aria-hidden="true" />

      <div className="auth-content">
        <div className="brand">
          <img src={arkLogo} className="brand-logo" alt="ARK - Almighty Risen King Church" />
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Create Account</h1>
          <p className="auth-subtext">
            Set up the admin account for the church member management system
          </p>

          <label className="field-label" htmlFor="fullName">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
            disabled={submitting}
          />

          <label className="field-label" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={submitting}
          />

          <label className="field-label" htmlFor="password">
            Password
          </label>
          <div className="password-field">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <label className="field-label" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            disabled={submitting}
          />

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'SIGNING UP…' : 'SIGN UP'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/">Sign In</Link>
          </p>

          <div className="divider" />

          <div className="secure-access">
            <ShieldIcon />
            <span>Secure Access</span>
          </div>
          <p className="secure-note">This is a private system for church use only.</p>
        </form>

        <p className="auth-footer">
          © 2026 ARK - Almighty Risen King Church. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default SignUpPage
