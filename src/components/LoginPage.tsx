import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import backgroundImage from '../assets/7882808.jpg'
import arkLogo from '../assets/ark-logo.png'
import { supabase } from '../lib/supabaseClient'
import { handleFieldBlur, handleFieldFocus, useKeyboardScrollFix } from '../lib/scrollFieldIntoView'
import { EyeIcon, ShieldIcon } from './icons'
import './AuthPage.css'

function LoginPage() {
  const navigate = useNavigate()
  useKeyboardScrollFix()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    setSubmitting(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    navigate('/dashboard')
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
          <h1>Welcome Back</h1>
          <p className="auth-subtext">
            Sign in to access the church member management system
          </p>

          <label className="field-label" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handleFieldFocus}
              onBlur={handleFieldBlur}
              autoComplete="current-password"
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

          <div className="auth-row">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot-password" className="forgot-link">
              Forgot password?
            </a>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'SIGNING IN…' : 'SIGN IN'}
          </button>

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

export default LoginPage
