import express from 'express'
import { login, register, refreshAccessToken, logout } from '../controller/authController.js';
const router = express.Router();


router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)
router.get('/refresh', refreshAccessToken)


export default router