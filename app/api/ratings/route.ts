import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { poemId, value, userEmail } = await request.json();

        if (!poemId || value === undefined || !userEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find or create user (simplified auth)
        let user = await prisma.user.findUnique({ where: { email: userEmail } });
        if (!user) {
            user = await prisma.user.create({ data: { email: userEmail } });
        }

        const rating = await prisma.rating.upsert({
            where: {
                userId_poemId: {
                    userId: user.id,
                    poemId: poemId,
                },
            },
            update: {
                value: value,
            },
            create: {
                userId: user.id,
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
