import dotenv from 'dotenv'
import express from 'express'
import authRoute from './routes/authRoute.js'
import userRoute from './routes/userRoute.js'
import errorHandler from './middleware/errorHandler.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'

dotenv.config({ path: '../.env' })
const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "100kb" }))
app.use(cookieParser())

app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)
app.use(errorHandler)

const port = process.env.PORT
app.listen(port, () => {
    console.log(`server running on port ${port}`);
})