import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const poems = await prisma.poem.findMany({
            take: 50, // Fetch a reasonable list of recent poems
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { username: true }
                }
            },
        });

        return NextResponse.json({
            poems: poems || [],
        });
    } catch (error) {
        console.error("Error fetching poems:", error);
        return NextResponse.json({ error: 'Failed to fetch poems' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ error: 'Missing content' }, { status: 400 });
        }

        // Get or create the 'Anonymous' user
        let guestUser = await prisma.user.findUnique({
            where: { username: "Anonymous" }
        });

        if (!guestUser) {
            guestUser = await prisma.user.create({
                data: { username: "Anonymous" }
            });
        }

        const poem = await prisma.poem.create({
            data: {
                content,
                authorId: guestUser.id,
            },
            include: {
                author: {
                    select: { username: true }
                }
            }
        });

        return NextResponse.json(poem);
    } catch (error) {
        console.error("Error creating poem:", error);
        return NextResponse.json({ error: 'Failed to create poem' }, { status: 500 });
    }
}
