import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import bcrypt from 'bcrypt'
import { PrismaClient } from "@prisma/client";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";

const prisma = new PrismaClient();

const register = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        throw new AppError('email, password and username is required',)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword
        },
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
        },
    })

    const tokenUser = { username: user.username, userId: user.id, role: user.role }
    const accessToken = generateAccessToken(tokenUser)
    const refreshToken = generateRefreshToken({ userId: user.id })

    await prisma.token.create({
        data: {
            refreshToken,
            user: {
                connect: { id: user.id }
            }
        }
    })

    res
        .status(201)
        .cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 900000, // 15 minutes in milliseconds
            secure: false,
        })
        .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
            secure: false,
            path: '/api/auth'
        })
        .json({ user })

})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('email and password is required',)
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new AppError('Invalid Credentials', 401)
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        throw new AppError('Invalid Credentials', 401)
    }

    const { password: _, ...userData } = user;
    res.status(200).json({ msg: "Login Successful!", user: userData })
})


export { register, login }