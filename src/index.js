import express from 'express'
import config from 'config'

const app = express()






const port = config.get("server.port")
app.listen(port, (req, res) => {
    console.log(`server running on port ${port}`);
})