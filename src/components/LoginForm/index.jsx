import {useState} from 'react'
import {useNavigate, Navigate, Link} from 'react-router'
import Cookies from 'js-cookie'

import './index.css'

const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const submitForm = async event => {
    event.preventDefault()
    setErrorMsg('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password}),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error_msg || 'Login failed')

      Cookies.set('jwt_token', data.jwt_token, {expires: 30, sameSite: 'lax'})
      navigate('/', {replace: true})
    } catch (error) {
      setErrorMsg(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (Cookies.get('jwt_token')) return <Navigate to="/" replace />

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <img
          className="auth-brand-logo"
          src="https://s3.ap-south-1.amazonaws.com/new-assets.ccbp.in/frontend/loading-data/niat_react_js/niat_coding_questions/nxt-trendz-logo.png"
          alt="NxtTrendz"
        />
        <div>
          <p className="auth-kicker">WELCOME BACK</p>
          <h1>Great style starts with a great fit.</h1>
          <p className="auth-brand-copy">
            Sign in to continue exploring the latest collection and your saved
            shopping cart.
          </p>
        </div>
        <div className="auth-feature">
          <span>01</span>
          <p>Secure account access</p>
        </div>
      </section>

      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={submitForm}>
          <p className="auth-card-kicker">MEMBER LOGIN</p>
          <h2>Sign in</h2>
          <p className="auth-card-copy">
            Welcome back. Please enter your details.
          </p>

          <label className="auth-field">
            <span>Username</span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={event => setUsername(event.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          {errorMsg && (
            <p className="auth-error" role="alert">
              {errorMsg}
            </p>
          )}
          <button
            className="auth-submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="auth-switch">
            New to NxtTrendz? <Link to="/register">Create account</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default LoginForm
