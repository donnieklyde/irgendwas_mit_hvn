import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { poemId } = await request.json();

        if (!poemId) {
            return NextResponse.json({ error: 'Missing poemId' }, { status: 400 });
        }

        // Mock AI Rating Logic
        // In a real app, this would call OpenAI/Anthropic
        const mockValue = Math.floor(Math.random() * 11); // 0-10
        const mockAnalysis = "This poem evokes a sense of " + ["melancholy", "joy", "despair", "hope", "absurdity"][Math.floor(Math.random() * 5)] + ". The structure is " + ["rigid", "fluid", "chaotic"][Math.floor(Math.random() * 3)] + ".";

        const aiRating = await prisma.aIRating.create({
            data: {
                poemId,
                value: mockValue,
                analysis: mockAnalysis,
            },
        });

        return NextResponse.json(aiRating);
    } catch (error) {
        console.error("Error creating AI rating:", error);
        return NextResponse.json({ error: 'Failed to create AI rating' }, { status: 500 });
    }
}
