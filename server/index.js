import fs from 'fs'
import {randomUUID} from 'crypto'
import path from 'path'
import {fileURLToPath} from 'url'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = express()
const port = Number(process.env.PORT || 3001)
const jwtSecret =
  process.env.JWT_SECRET || 'nxt-trendz-local-development-secret'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const usersFile = path.join(__dirname, 'users.json')

app.use(cors())
app.use(express.json({limit: '100kb'}))

const readUsers = () => {
  if (!fs.existsSync(usersFile)) return []
  try {
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'))
  } catch {
    return []
  }
}

const writeUsers = users => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8')
}

const createToken = user =>
  jwt.sign(
    {sub: user.id, name: user.name, username: user.username},
    jwtSecret,
    {expiresIn: '30d'},
  )

const authenticate = (request, response, next) => {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    response.status(401).json({error_msg: 'Authentication required'})
    return
  }

  try {
    request.user = jwt.verify(authHeader.slice(7), jwtSecret)
    next()
  } catch {
    response
      .status(401)
      .json({error_msg: 'Session expired. Please login again.'})
  }
}

app.post('/api/auth/register', async (request, response) => {
  const {name, email, username, password} = request.body
  if (!name?.trim() || !email?.trim() || !username?.trim() || !password) {
    response.status(400).json({error_msg: 'All fields are required'})
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    response.status(400).json({error_msg: 'Enter a valid email address'})
    return
  }
  if (password.length < 6) {
    response
      .status(400)
      .json({error_msg: 'Password must be at least 6 characters'})
    return
  }

  const users = readUsers()
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = username.trim().toLowerCase()
  if (
    users.some(
      user =>
        user.email.toLowerCase() === normalizedEmail ||
        user.username.toLowerCase() === normalizedUsername,
    )
  ) {
    response
      .status(409)
      .json({error_msg: 'Email or username is already registered'})
    return
  }

  const user = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    username: normalizedUsername,
    passwordHash: await bcrypt.hash(password, 12),
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  writeUsers(users)

  response.status(201).json({
    jwt_token: createToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
    },
  })
})

app.post('/api/auth/login', async (request, response) => {
  const {username, password} = request.body
  if (!username?.trim() || !password) {
    response.status(400).json({error_msg: 'Username and password are required'})
    return
  }

  const normalizedUsername = username.trim().toLowerCase()
  const user = readUsers().find(
    item => item.username.toLowerCase() === normalizedUsername,
  )
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    response.status(401).json({error_msg: 'Invalid username or password'})
    return
  }

  response.json({
    jwt_token: createToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
    },
  })
})

app.get('/api/auth/me', authenticate, (request, response) => {
  const user = readUsers().find(item => item.id === request.user.sub)
  if (!user) {
    response.status(404).json({error_msg: 'User not found'})
    return
  }
  response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
    },
  })
})

app.get('/api/health', (_request, response) => {
  response.json({status: 'ok'})
})

const buildDirectory = path.join(__dirname, '..', 'build')
if (fs.existsSync(buildDirectory)) {
  app.use(express.static(buildDirectory))
  app.use((request, response, next) => {
    if (request.path.startsWith('/api')) {
      next()
      return
    }
    response.sendFile(path.join(buildDirectory, 'index.html'))
  })
}

app.listen(port, '0.0.0.0', () => {
  console.log(`NxtTrendz API running at http://127.0.0.1:${port}`)
})
