import asyncHandler from "../utils/asyncHandler.js"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany()

    res.status(200).json(users)
})

export { getAllUsers }