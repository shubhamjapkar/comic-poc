import { NextRequest, NextResponse } from 'next/server';
import { detectCharactersInScene, generatePanelWithReferences } from '../../../lib/openai_2';
import { Character } from '../../../types';

export async function POST(request: NextRequest) {
  try {
    const { content, characters, previousPanelImage, previousPanelScene } = await request.json();

    console.log('=== NEW API ROUTE ===');
    console.log('Content length:', content?.length || 0);
    console.log('Characters count:', characters?.length || 0);
    console.log('Previous scene provided:', !!previousPanelScene);
    console.log('Previous image provided:', !!previousPanelImage);
    console.log('===================');

    if (!content) {
      return NextResponse.json(
        { error: 'Panel content is required' },
        { status: 400 }
      );
    }

    // Detect characters in the scene
    const sceneInfo = await detectCharactersInScene(content);
    const detectedNames = sceneInfo.characters.map(char => char.name);
    
    // Find matching characters from database
    const matchedCharacters = characters.filter((character: Character) =>
      detectedNames.some(name => 
        character.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(character.name.toLowerCase())
      )
    );

    console.log('Detected:', detectedNames);
    console.log('Matched:', matchedCharacters.map((c: Character) => c.name));

    // Prepare character data for image generation
    const characterData = matchedCharacters
      .filter((char: Character) => char.imageUrl)
      .map((char: Character) => ({
        name: char.name,
        imageBase64: char.imageUrl
      }));

    console.log('Characters with images:', characterData.length);

    // Generate panel image
    const imageBase64 = await generatePanelWithReferences(
      content,
      characterData,
      previousPanelScene,
      previousPanelImage
    );

    return NextResponse.json({ 
      imageUrl: imageBase64,
      detectedCharacters: detectedNames,
      sceneInfo 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate panel image' },
      { status: 500 }
    );
  }
}