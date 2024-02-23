import express from 'express'
import { getAllUsers } from '../controller/userController.js'
import { verifyAccessToken } from '../middleware/authMiddleware.js'

const router = express.Router()



router.get('/', verifyAccessToken, getAllUsers)

export default router