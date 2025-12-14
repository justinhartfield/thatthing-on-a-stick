import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { BrandStrategy } from "./strategySynthesis";
import { BrandProject } from "../drizzle/schema";

export interface VisualConcept {
  name: string;
  description: string;
  visualStyle: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  displayFont: string;
  bodyFont: string;
  tagline: string;
  toneOfVoice: string;
  moodboardImageUrl?: string;
}

/**
 * Generate 3 distinct visual brand concepts based on strategy
 */
export async function generateBrandConcepts(
  project: BrandProject,
  strategy: BrandStrategy
): Promise<VisualConcept[]> {
  const systemPrompt = `You are a creative director specializing in brand identity design. Generate 3 distinct visual brand concepts that bring the brand strategy to life.

Each concept should have a unique creative direction while staying true to the brand strategy. Consider:
- Visual style (minimalist, bold, playful, elegant, technical, organic, etc.)
- Color psychology and emotional impact
- Typography personality and readability
- Overall aesthetic coherence

Make each concept distinctly different from the others to give the client real choice.`;

  const userPrompt = `Project: ${project.name}
Initial Concept: ${project.initialConcept}

Brand Strategy:
- Positioning: ${strategy.positioning}
- Purpose: ${strategy.purposeStatement}
- Target Audience: ${strategy.targetAudience}
- Personality: ${strategy.personality.join(', ')}
- Values: ${strategy.values.join(', ')}
- Tone: ${strategy.toneOfVoice}

Generate 3 distinct visual brand concepts. For each concept provide:

1. **Name**: A creative name for this concept direction (2-3 words)
2. **Description**: What makes this concept unique (2-3 sentences)
3. **Visual Style**: The overall aesthetic approach (1-2 sentences)
4. **Primary Color**: Main brand color (hex code)
5. **Secondary Color**: Supporting color (hex code)
6. **Accent Color**: Highlight/CTA color (hex code)
7. **Display Font**: Font for headlines/logos (Google Fonts name)
8. **Body Font**: Font for body text (Google Fonts name)
9. **Tagline**: A memorable brand tagline (5-8 words)
10. **Tone of Voice**: How this concept communicates (1 sentence)

Ensure the 3 concepts are visually distinct (e.g., one minimal, one bold, one playful).`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "brand_concepts",
        strict: true,
        schema: {
          type: "object",
          properties: {
            concepts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  visualStyle: { type: "string" },
                  primaryColor: { type: "string" },
                  secondaryColor: { type: "string" },
                  accentColor: { type: "string" },
                  displayFont: { type: "string" },
                  bodyFont: { type: "string" },
                  tagline: { type: "string" },
                  toneOfVoice: { type: "string" }
                },
                required: [
                  "name",
                  "description",
                  "visualStyle",
                  "primaryColor",
                  "secondaryColor",
                  "accentColor",
                  "displayFont",
                  "bodyFont",
                  "tagline",
                  "toneOfVoice"
                ],
                additionalProperties: false
              },
              minItems: 3,
              maxItems: 3
            }
          },
          required: ["concepts"],
          additionalProperties: false
        }
      }
    }
  });

  if (!response.choices || response.choices.length === 0) {
    throw new Error('No response from LLM');
  }

  const content = response.choices[0]!.message.content;
  if (!content) {
    throw new Error('Empty response from LLM');
  }

  const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
  
  return result.concepts as VisualConcept[];
}

/**
 * Generate moodboard image for a visual concept
 */
export async function generateConceptMoodboard(
  concept: VisualConcept,
  strategy: BrandStrategy
): Promise<string> {
  const prompt = `A professional brand moodboard for "${concept.name}". ${concept.visualStyle}. 
Brand personality: ${strategy.personality.join(', ')}. 
Visual style: ${concept.description}. 
Color palette: ${concept.primaryColor}, ${concept.secondaryColor}, ${concept.accentColor}. 
Mood: ${concept.toneOfVoice}. 
High-quality design collage with textures, patterns, and visual elements that capture the brand essence.`;

  const result = await generateImage({
    prompt,
  });

  return result.url || '';
}

/**
 * Generate all 3 concepts with moodboard images
 */
export async function generateCompleteConceptsWithImages(
  project: BrandProject,
  strategy: BrandStrategy
): Promise<VisualConcept[]> {
  // Generate concept definitions
  const concepts = await generateBrandConcepts(project, strategy);

  // Generate moodboard for each concept in parallel
  const conceptsWithImages = await Promise.all(
    concepts.map(async (concept) => {
      try {
        const imageUrl = await generateConceptMoodboard(concept, strategy);
        return { ...concept, moodboardImageUrl: imageUrl };
      } catch (error) {
        console.error(`Failed to generate moodboard for ${concept.name}:`, error);
        return concept; // Return concept without image if generation fails
      }
    })
  );

  return conceptsWithImages;
}

/**
 * Format concepts presentation for chat
 */
export function formatConceptsPresentation(concepts: VisualConcept[]): string {
  return `🎨 **Creative Concepts Ready!**

I've developed 3 distinct visual directions for your brand. Each concept interprets your strategy in a unique way:

${concepts.map((c, i) => `
**${i + 1}. ${c.name}**
${c.description}

🎨 **Visual Style:** ${c.visualStyle}
🌈 **Colors:** ${c.primaryColor} • ${c.secondaryColor} • ${c.accentColor}
✍️ **Typography:** ${c.displayFont} + ${c.bodyFont}
💬 **Tagline:** "${c.tagline}"
🗣️ **Tone:** ${c.toneOfVoice}
`).join('\n---\n')}

Which concept resonates most with your vision? Reply with the number (1, 2, or 3) to select it, or ask me to refine any aspect.`;
}
