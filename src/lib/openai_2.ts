import OpenAI from './openai';
import { CharacterDetectionResponse } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Character image generation
export async function generateCharacterImage(prompt: string): Promise<string> {
  try {
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: prompt,
      tools: [{ 
        type: "image_generation",
        quality: "high",
        size: "1024x1024"
      }]
    });

    const imageGenerationCalls = response.output.filter(
      (output: any) => output.type === "image_generation_call"
    );

    if (imageGenerationCalls.length > 0) {
      return imageGenerationCalls[0].result;
    }

    throw new Error('No image generated');
  } catch (error) {
    console.error('Error generating character image:', error);
    throw new Error('Failed to generate character image');
  }
}

// Character detection in scene
export async function detectCharactersInScene(content: string): Promise<CharacterDetectionResponse> {
  try {
    console.log('=== CHARACTER DETECTION ===');
    console.log('Scene:', content.substring(0, 100) + '...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a comic book expert. Analyze the given scene content and extract character information, scene details, and mood."
        },
        {
          role: "user",
          content: `Analyze this comic panel content and extract character information: "${content}"`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "character_detection",
          strict: true,
          schema: {
            type: "object",
            properties: {
              characters: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    role: { type: "string" }
                  },
                  required: ["name", "description", "role"],
                  additionalProperties: false
                }
              },
              scene_description: { type: "string" },
              mood: { type: "string" },
              setting: { type: "string" }
            },
            required: ["characters", "scene_description", "mood", "setting"],
            additionalProperties: false
          }
        }
      }
    });

    const result = JSON.parse(response.choices[0].message.content!) as CharacterDetectionResponse;
    console.log('Detected characters:', result.characters.map(c => c.name));
    return result;
  } catch (error) {
    console.error('Error detecting characters:', error);
    throw new Error('Failed to detect characters');
  }
}

// Panel image generation with references
export async function generatePanelWithReferences(
  currentScene: string,
  characterImages: Array<{name: string, imageBase64: string}>,
  previousScenes: Array<{scene: string, image: string}> = []
): Promise<string> {
  
  console.log('=== PANEL GENERATION ===');
  console.log('Current scene:', currentScene.substring(0, 50) + '...');
  console.log('Character count:', characterImages.length);
  console.log('Previous panels count:', previousScenes.length);
  console.log('Previous scenes:', previousScenes.map(p => p.scene.substring(0, 30) + '...'));
  
  // Build prompt
  let prompt = `Generate a comic book panel illustration for: "${currentScene}".

Style: Professional comic book art with clean lines, vibrant colors, and dynamic composition. Do NOT include any speech bubbles, text bubbles, dialogue, or written text in the image - the user will add these manually later.

Context: You will be provided with reference images of characters that appear in this scene. IMPORTANT: Use these reference images to maintain visual consistency for character faces and body types only. The characters' faces, facial features, hair, skin tone, and body proportions should match the reference images exactly. However, their clothing, poses, actions, and expressions should adapt according to the current scene context and narrative flow.`;

  // Add previous context if provided
  if (previousScenes.length > 0) {
    prompt += `

Previous Context: You will be provided with ${previousScenes.length} previous panel image(s) from this comic sequence in chronological order:`;
    
    previousScenes.forEach((panel, index) => {
      const panelNumber = previousScenes.length - index; // Most recent = 1, older = 2
      prompt += `
- Panel ${panelNumber} ago: "${panel.scene}"`;
    });
    
    prompt += `

Generate a coherent image for the current scene "${currentScene}" that maintains visual and narrative consistency with the previous panels. Ensure the art style, lighting, and overall visual flow create a smooth progression. Study the sequence of events and character development. Characters should maintain their face and body consistency from reference images, but their clothing, poses, and actions should evolve naturally through the narrative sequence.`;

  }

  prompt += `

Use the exact same drawing/cartoon style as used in reference images. 
Task: Create a single comic book style panel image that depicts the described scene using the provided references. Remember: Keep character faces and body types consistent with reference images, but allow clothing, poses, actions, and expressions to change based on the scene requirements and narrative flow.`;

  console.log('=== PROMPT BUILT ===');

  // Build input content
  const inputContent: any[] = [
    { type: "input_text", text: prompt }
  ];

  

  // Add character reference images
  characterImages.forEach(char => {
    inputContent.push({
      type: "input_text", 
      text: `${char.name}'s character base image reference:`
    });
    inputContent.push({
      type: "input_image",
      image_url: `data:image/png;base64,${char.imageBase64}`
    });
  });
  // Add previous panel images (if any) in chronological order
  if (previousScenes.length > 0) {
    previousScenes.forEach((panel, index) => {
      const panelNumber = previousScenes.length - index; // Most recent = 1, older = 2
      inputContent.push({
        type: "input_text", 
        text: `Previous panel ${panelNumber} ago from this comic sequence:`
      });
      inputContent.push({
        type: "input_image",
        image_url: `data:image/png;base64,${panel.image}`
      });
    });
  }

  console.log('Input items:', inputContent.length);

  // Create the complete request object
  const completeRequest = {
    model: "gpt-4o",
    input: [
      {
        role: "user",
        content: inputContent
      }
    ],
    tools: [{ 
      type: "image_generation",
      quality: "high",
      size: "1024x1024"
    }]
  };

  // Log complete request to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `openai-request-${timestamp}.txt`;
  
  // Create COMPLETE untruncated version of the request (including full base64 strings)
  const logContent = JSON.stringify(completeRequest, null, 2);
  
  console.log(`📝 Logging complete request to: ${filename}`);
  console.log('Request structure:', JSON.stringify({
    model: completeRequest.model,
    input_role: completeRequest.input[0].role,
    content_items: completeRequest.input[0].content.length,
    content_types: completeRequest.input[0].content.map((item: any) => item.type),
    tools: completeRequest.tools
  }, null, 2));

  try {
    // Write to file (this will create the file in the project root)
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(process.cwd(), 'logs');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath, { recursive: true });
    }
    
    const fullPath = path.join(logPath, filename);
    fs.writeFileSync(fullPath, logContent);
    console.log(`✅ Request logged to: ${fullPath}`);
  } catch (logError) {
    console.error('❌ Failed to write log file:', logError);
  }

  try {
    const response = await openai.responses.create(completeRequest);

    const imageGenerationCalls = response.output.filter(
      (output: any) => output.type === "image_generation_call"
    );

    if (imageGenerationCalls.length > 0) {
      console.log('✅ Panel generated successfully');
      return imageGenerationCalls[0].result;
    }

    throw new Error('No image generation found');
    
  } catch (error) {
    console.error('❌ Panel generation failed:', error);
    throw new Error('Failed to generate panel');
  }
}