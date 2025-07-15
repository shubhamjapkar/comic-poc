import { NextRequest, NextResponse } from 'next/server';
import { detectCharactersInScene, generatePanelWithReferences } from '@/lib/openai_2';
import { Character } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { content, characters, panelId, previousPanels } = requestBody;
    
    console.log('🔥 API ROUTE CALLED');
    console.log('Previous panels count:', previousPanels?.length || 0);
    console.log('Content preview:', content?.substring(0, 30) + '...');

    if (!content) {
      return NextResponse.json(
        { error: 'Panel content is required' },
        { status: 400 }
      );
    }

    const sceneInfo = await detectCharactersInScene(content);
    
    const relevantCharacterNames = sceneInfo.characters.map(char => char.name);
    
    const relevantCharacters = characters.filter((character: Character) =>
      relevantCharacterNames.some(name => 
        character.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(character.name.toLowerCase())
      )
    );

    const characterData = relevantCharacters
      .filter((char: Character) => char.imageUrl)
      .map((char: Character) => ({
        name: char.name,
        imageBase64: char.imageUrl
      }));

    const imageBase64 = await generatePanelWithReferences(
      content,
      characterData,
      previousPanels || []
    );

    return NextResponse.json({ 
      imageUrl: imageBase64,
      detectedCharacters: relevantCharacterNames,
      sceneInfo 
    });
  } catch (error) {
    console.error('Error in generate-panel API:', error);
    return NextResponse.json(
      { error: 'Failed to generate panel image' },
      { status: 500 }
    );
  }
}