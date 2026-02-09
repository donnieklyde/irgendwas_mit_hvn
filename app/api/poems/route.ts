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
                author: true,
                aiRating: true,
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
        const { content, authorEmail } = body; // Simplified for now, assuming email passing or auth

        if (!content || !authorEmail) {
            return NextResponse.json({ error: 'Missing content or author' }, { status: 400 });
        }

        // Find or create user (simplified auth)
        let user = await prisma.user.findUnique({ where: { email: authorEmail } });
        if (!user) {
            user = await prisma.user.create({
                data: { email: authorEmail },
            });
        }

        const poem = await prisma.poem.create({
            data: {
                content,
                authorId: user.id,
            },
        });

        // Trigger AI rating in background (or simpler: call it here)
        // For now, we'll just return the poem and let the client trigger AI or do it async

        return NextResponse.json(poem);
    } catch (error) {
        console.error("Error creating poem:", error);
        return NextResponse.json({ error: 'Failed to create poem' }, { status: 500 });
    }
}
