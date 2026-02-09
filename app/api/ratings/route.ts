import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { poemId, value } = await request.json();

        if (!poemId || value === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

        const rating = await prisma.rating.upsert({
            where: {
                userId_poemId: {
                    userId: guestUser.id,
                    poemId: poemId,
                },
            },
            update: {
                value: value,
            },
            create: {
                userId: guestUser.id,
                poemId: poemId,
                value: value,
            },
        });

        return NextResponse.json(rating);
    } catch (error) {
        console.error("Error submitting rating:", error);
        return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
    }
}
