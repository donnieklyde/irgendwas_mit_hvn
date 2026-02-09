import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get('cursor');
        const take = 1; // Thread style, one by one

        const poems = await prisma.poem.findMany({
            take: take,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { username: true }
                },
                ratings: true,
            },
        });

        const nextCursor = poems.length > 0 ? poems[poems.length - 1].id : null;

        return NextResponse.json({
            poem: poems[0] || null,
            nextCursor,
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
        let guestUser = await prisma.user.findFirst({
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
        });

        return NextResponse.json(poem);
    } catch (error) {
        console.error("Error creating poem:", error);
        return NextResponse.json({ error: 'Failed to create poem' }, { status: 500 });
    }
}
