import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import bcrypt from 'bcrypt'
import { PrismaClient } from "@prisma/client";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient();

const register = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        throw new AppError('email, password and username is required', 400)
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
            maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'

        })
        .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'
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

    const tokenUser = { username: user.username, userId: user.id, role: user.role }
    const accessToken = generateAccessToken(tokenUser)
    const refreshToken = generateRefreshToken({ userId: user.id })

    await prisma.token.update({
        where: {
            userId: user.id,
        },
        data: {
            refreshToken
        },
    })

    const { password: _, ...userData } = user;
    res
        .status(201)
        .cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, //1 day
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'

        })
        .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'
        })
        .json({ msg: "Login Successful!", user: userData })

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
        throw new AppError('Unauthorized Request', 401)
    }

    const { userId } = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const token = await prisma.token.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    username: true,
                    id: true,
                    role: true
                }
            }
        }
    });

    if (!token) {
        throw new AppError("Invalid Refresh Token", 401)
    }

    if (incomingRefreshToken !== token?.refreshToken) {
        throw new AppError("Refresh token is expired or used", 401)
    }

    //refresh access token
    const tokenUser = { username: token.user.username, userId: token.user.id, role: token.user.role }
    const accessToken = generateAccessToken(tokenUser)

    res.status(200)
        .cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, //1 day
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'
        })
        .json({ msg: "succesfully refreshed access token" })

})

const logout = asyncHandler(async (req, res) => {
    res.status(200)
        .clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        })
        .clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        })
        .json({ msg: "user logged out.." })
})


export { register, login, refreshAccessToken, logout }