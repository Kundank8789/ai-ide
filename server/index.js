import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import refactorRoute from './routes/refactor.js' 

dotenv.config()
console.log("ENV CHECK:");
console.log("OPENROUTER:", process.env.OPENROUTER_API_KEY);
console.log("GROQ:", process.env.GROQ_API_KEY);
console.log("GEMINI:", process.env.GEMINI_API_KEY);

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/refactor', refactorRoute) 

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI IDE server running' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})