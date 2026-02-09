import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { username, password, email } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password required" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Username already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                email: email || null,
            },
        });

        await createSession(user.id);

        return NextResponse.json({
            id: user.id,
            username: user.username,
            email: user.email,
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Failed to register" },
            { status: 500 }
        );
    }
}
