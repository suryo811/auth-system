import express from 'express'
import config from 'config'
import authRoute from './routes/authRoute.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()

app.use(express.json({ limit: "100kb" }))

app.use('/api/auth', authRoute)


app.use(errorHandler)

const port = config.get("server.port")
app.listen(port, (req, res) => {
    console.log(`server running on port ${port}`);
})