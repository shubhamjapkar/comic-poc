import { NextRequest, NextResponse } from 'next/server';
import { generateCharacterImage } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const imageBase64 = await generateCharacterImage(prompt, 'low');

    return NextResponse.json({ imageUrl: imageBase64 });
  } catch (error) {
    console.error('Error in generate-character API:', error);
    return NextResponse.json(
      { error: 'Failed to generate character image' },
      { status: 500 }
    );
  }
}