import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette, Type, Sparkles } from "lucide-react";

interface BrandConcept {
  id: number;
  name: string;
  description: string;
  visualStyle: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  displayFont: string;
  bodyFont: string;
  tagline: string | null;
  toneOfVoice: string | null;
  moodboardImageUrl?: string | null;
}

interface ConceptGalleryProps {
  concepts: BrandConcept[];
  onSelect?: (conceptId: number) => void;
  selectedId?: number;
}

export function ConceptGallery({ concepts, onSelect, selectedId }: ConceptGalleryProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {concepts.map((concept, index) => (
        <Card
          key={concept.id}
          className={`border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 ${
            selectedId === concept.id ? 'ring-4 ring-primary' : ''
          }`}
        >
          {/* Moodboard Image */}
          {concept.moodboardImageUrl && (
            <div className="relative h-48 overflow-hidden border-b-4 border-foreground">
              <img
                src={concept.moodboardImageUrl}
                alt={`${concept.name} moodboard`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <Badge className="bg-background text-foreground border-2 border-foreground font-bold">
                  Concept {index + 1}
                </Badge>
              </div>
            </div>
          )}

          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {concept.name}
            </CardTitle>
            <CardDescription className="text-base">
              {concept.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Visual Style */}
            <div>
              <p className="text-sm font-bold mb-1">Visual Style</p>
              <p className="text-sm text-muted-foreground">{concept.visualStyle}</p>
            </div>

            {/* Color Palette */}
            <div>
              <p className="text-sm font-bold mb-2 flex items-center gap-1">
                <Palette className="w-4 h-4" />
                Color Palette
              </p>
              <div className="flex gap-2">
                <div
                  className="w-12 h-12 rounded border-2 border-foreground"
                  style={{ backgroundColor: concept.primaryColor }}
                  title={`Primary: ${concept.primaryColor}`}
                />
                <div
                  className="w-12 h-12 rounded border-2 border-foreground"
                  style={{ backgroundColor: concept.secondaryColor }}
                  title={`Secondary: ${concept.secondaryColor}`}
                />
                <div
                  className="w-12 h-12 rounded border-2 border-foreground"
                  style={{ backgroundColor: concept.accentColor }}
                  title={`Accent: ${concept.accentColor}`}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {concept.primaryColor} • {concept.secondaryColor} • {concept.accentColor}
              </div>
            </div>

            {/* Typography */}
            <div>
              <p className="text-sm font-bold mb-2 flex items-center gap-1">
                <Type className="w-4 h-4" />
                Typography
              </p>
              <div className="space-y-1 text-sm">
                <p><strong>Display:</strong> {concept.displayFont}</p>
                <p><strong>Body:</strong> {concept.bodyFont}</p>
              </div>
            </div>

            {/* Tagline */}
            {concept.tagline && (
              <div className="pt-2 border-t-2 border-dashed border-foreground/20">
                <p className="text-sm font-bold mb-1">Tagline</p>
                <p className="text-base italic">"{concept.tagline}"</p>
              </div>
            )}

            {/* Tone */}
            {concept.toneOfVoice && (
              <div>
                <p className="text-sm font-bold mb-1">Tone of Voice</p>
                <p className="text-sm text-muted-foreground">{concept.toneOfVoice}</p>
              </div>
            )}

            {/* Select Button */}
            {onSelect && (
              <Button
                onClick={() => onSelect(concept.id)}
                className="w-full mt-4"
                variant={selectedId === concept.id ? "default" : "outline"}
              >
                {selectedId === concept.id ? '✓ Selected' : 'Select This Concept'}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
