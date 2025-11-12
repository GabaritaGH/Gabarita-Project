import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {}), // corrige bug do usePlural
  secret: process.env.AUTH_SECRET || "uma-senha-super-secreta",
  emailAndPassword: { enabled: true },
});
