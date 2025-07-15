'use client';

import { useState } from 'react';
import { Comic, Character, Panel } from '../types';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Play, Save } from 'lucide-react';

interface ComicEditorProps {
  page: any;
  characters: Character[];
  onPageChange: (page: any) => void;
}

export default function ComicEditor({ page, characters, onPageChange }: ComicEditorProps) {
  const [isGeneratingPanels, setIsGeneratingPanels] = useState(false);

  const updatePanelContent = (panelIndex: number, content: string) => {
    const updatedPanels = page.panels.map((panel: Panel, index: number) =>
      index === panelIndex ? { ...panel, content } : panel
    );
    onPageChange({ ...page, panels: updatedPanels });
  };

  const generatePanelImages = async () => {
    console.log('🚀 NEW SEQUENTIAL GENERATION STARTED');
    if (page.panels.some((panel: Panel) => !panel.content.trim())) {
      alert('Please fill in content for all panels before generating images');
      return;
    }

    setIsGeneratingPanels(true);
    try {
      const updatedPanels = [];
      const previousPanels: Array<{scene: string, image: string}> = [];
      
      // Simple loop: generate each panel sequentially
      for (let i = 0; i < page.panels.length; i++) {
        const panel = page.panels[i];
        
        console.log(`=== GENERATING PANEL ${i + 1} ===`);
        console.log('Current panel content:', panel.content.substring(0, 50) + '...');
        console.log('Previous panels count:', previousPanels.length);
        console.log('Previous panels:', previousPanels.map(p => p.scene.substring(0, 30) + '...'));
        
        const response = await fetch('/api/generate-panel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: panel.content,
            characters: characters,
            panelId: panel.id,
            previousPanels: previousPanels,
          }),
        });

        if (!response.ok) throw new Error(`Failed to generate panel ${panel.id}`);

        const { imageUrl } = await response.json();
        const updatedPanel = { ...panel, imageUrl };
        updatedPanels.push(updatedPanel);
        
        // Add current panel to previous panels array for next iteration
        previousPanels.push({
          scene: panel.content,
          image: imageUrl
        });
        
        // Keep only last 2 panels
        if (previousPanels.length > 2) {
          previousPanels.shift(); // Remove oldest panel
        }
        
        console.log('Panel generated successfully');
        console.log('Previous panels updated:', previousPanels.length);
        console.log('================================');
      }

      onPageChange({ ...page, panels: updatedPanels });
    } catch (error) {
      console.error('Error generating panel images:', error);
      alert('Failed to generate some panel images. Please try again.');
    } finally {
      setIsGeneratingPanels(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Comic Editor - Page {page.pageNumber}</h2>
        <div className="flex gap-2">
          <Button onClick={generatePanelImages} disabled={isGeneratingPanels}>
            <Play className="w-4 h-4 mr-2" />
            {isGeneratingPanels ? 'Generating...' : 'Generate All Panels'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {page.panels.map((panel: Panel, index: number) => (
          <Card key={panel.id}>
            <CardHeader>
              <CardTitle>Panel {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe what happens in this panel (e.g., 'The hero stands on a cliff overlooking the valley')"
                value={panel.content}
                onChange={(e) => updatePanelContent(index, e.target.value)}
                rows={3}
              />
              
              {panel.imageUrl && (
                <div className="mt-4">
                  <img
                    src={`data:image/png;base64,${panel.imageUrl}`}
                    alt={`Panel ${index + 1}`}
                    className="w-full h-auto max-h-96 object-contain rounded-md border"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {page.panels.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Configure your page layout first to start editing panels.</p>
        </div>
      )}
    </div>
  );
}