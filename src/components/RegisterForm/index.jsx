import {useState} from 'react'
import {Link, Navigate, useNavigate} from 'react-router'
import Cookies from 'js-cookie'

import './index.css'
import '../LoginForm/index.css'

const RegisterForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  })
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onChangeField = event => {
    setFormData(prevData => ({
      ...prevData,
      [event.target.name]: event.target.value,
    }))
  }

  const submitForm = async event => {
    event.preventDefault()
    setErrorMsg('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error_msg || 'Registration failed')

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
          <p className="auth-kicker">CREATE YOUR ACCOUNT</p>
          <h1>Start shopping for the brands you love.</h1>
          <p className="auth-brand-copy">
            Your account securely saves your sign-in and keeps your shopping
            experience ready wherever you return.
          </p>
        </div>
        <div className="auth-feature">
          <span>01</span>
          <p>Fast, secure account creation</p>
        </div>
      </section>

      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={submitForm}>
          <p className="auth-card-kicker">REGISTRATION</p>
          <h2>Create account</h2>
          <p className="auth-card-copy">Enter your details to get started.</p>

          <label className="auth-field">
            <span>Full name</span>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={onChangeField}
              placeholder="Alex Morgan"
              autoComplete="name"
              required
            />
          </label>
          <label className="auth-field">
            <span>Email address</span>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={onChangeField}
              placeholder="alex@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="auth-field">
            <span>Username</span>
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={onChangeField}
              placeholder="alexmorgan"
              autoComplete="username"
              required
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={onChangeField}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              minLength="6"
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
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default RegisterForm
