import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        await createSession(user.id);

        return NextResponse.json({
            id: user.id,
            username: user.username,
            email: user.email,
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Failed to login" },
            { status: 500 }
        );
    }
}
