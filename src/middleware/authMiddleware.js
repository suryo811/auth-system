import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const verifyAccessToken = asyncHandler(async (req, res, next) => {

    const accessToken = req.cookies?.accessToken

    if (!accessToken) {
        throw new AppError("Unauthorized Request", 401)
    }

    const { userId } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError("Invalid Access Token", 401)
    }

    const { password: _, ...userData } = user;

    req.user = userData
    next()
})

export { verifyAccessToken }

