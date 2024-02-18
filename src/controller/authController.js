import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import bcrypt from 'bcrypt'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const register = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('email and password is required',)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword
        }
    })

    res.status(201).json({ user })
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('email and password is required',)
    }

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new AppError('Invalid Credentials', 401)
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(passwordMatch);

    if (!passwordMatch) {
        throw new AppError('Invalid Credentials', 401)
    }

    res.status(200).json({ msg: "Login Successful!" })


})


export { register, login }