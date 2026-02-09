import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { poemId, value } = await request.json();

        if (!poemId || value === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const rating = await prisma.rating.upsert({
            where: {
                userId_poemId: {
                    userId: session.userId,
                    poemId: poemId,
                },
            },
            update: {
                value: value,
            },
            create: {
                userId: session.userId,
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
