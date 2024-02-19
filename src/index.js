import express from 'express'
import config from 'config'
import authRoute from './routes/authRoute.js'
import errorHandler from './middleware/errorHandler.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: config.get("cors.origin"),
    credentials: true
}))
app.use(express.json({ limit: "100kb" }))
app.use(cookieParser())

app.use('/api/auth', authRoute)
app.use(errorHandler)

const port = config.get("server.port")
app.listen(port, (req, res) => {
    console.log(`server running on port ${port}`);
})