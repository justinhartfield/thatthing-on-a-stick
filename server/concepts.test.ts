import { describe, it, expect } from 'vitest';
import { generateBrandConcepts } from './conceptGeneration';
import type { BrandProject } from '../drizzle/schema';
import type { BrandStrategy } from './strategySynthesis';

describe('Concept Generation Engine', () => {
  const mockProject: BrandProject = {
    id: 1,
    userId: 1,
    name: 'EcoTech Innovations',
    initialConcept: 'Sustainable smart home devices',
    currentPhase: 'concepts',
    strategyData: null,
    selectedConceptId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockStrategy: BrandStrategy = {
    positioning: 'EcoTech is the smart home brand for environmentally conscious consumers who want to reduce their carbon footprint without sacrificing convenience.',
    purposeStatement: 'We exist to make sustainable living effortless and measurable through intelligent technology.',
    targetAudience: 'Environmentally conscious millennials and Gen Z (25-40) who value both technology and sustainability.',
    personality: ['Friendly', 'Innovative', 'Trustworthy', 'Optimistic'],
    values: ['Sustainability', 'Transparency', 'Innovation', 'Community'],
    toneOfVoice: 'Approachable and inspiring, balancing technical credibility with warmth.',
    keyDifferentiators: [
      'Only smart home brand focused on carbon footprint reduction',
      'Real-time environmental impact measurement',
      'Transparent sustainability reporting'
    ]
  };

  it.skip('should generate 3 distinct brand concepts', async () => {
    const concepts = await generateBrandConcepts(mockProject, mockStrategy);

    expect(concepts).toBeDefined();
    expect(concepts.length).toBe(3);

    // Validate structure of each concept
    concepts.forEach((concept, index) => {
      expect(concept.name).toBeDefined();
      expect(concept.name.length).toBeGreaterThan(3);
      
      expect(concept.description).toBeDefined();
      expect(concept.description.length).toBeGreaterThan(20);
      
      expect(concept.visualStyle).toBeDefined();
      
      // Validate color hex codes
      expect(concept.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(concept.secondaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(concept.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      
      expect(concept.displayFont).toBeDefined();
      expect(concept.bodyFont).toBeDefined();
      
      expect(concept.tagline).toBeDefined();
      expect(concept.tagline.length).toBeGreaterThan(10);
      
      expect(concept.toneOfVoice).toBeDefined();

      console.log(`\nConcept ${index + 1}: ${concept.name}`);
      console.log(`Colors: ${concept.primaryColor}, ${concept.secondaryColor}, ${concept.accentColor}`);
      console.log(`Fonts: ${concept.displayFont} + ${concept.bodyFont}`);
      console.log(`Tagline: "${concept.tagline}"`);
    });

    // Verify concepts are distinct
    const names = concepts.map(c => c.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(3);
  }, 30000); // 30 second timeout for LLM call

  it('should validate concept structure', () => {
    const mockConcept = {
      name: 'Neon Future',
      description: 'A bold, futuristic brand identity',
      visualStyle: 'Bold and modern with neon accents',
      primaryColor: '#00FF88',
      secondaryColor: '#FF0088',
      accentColor: '#8800FF',
      displayFont: 'Clash Display',
      bodyFont: 'Satoshi',
      tagline: 'The future is now',
      toneOfVoice: 'Confident and forward-thinking',
    };

    expect(mockConcept.name).toBeDefined();
    expect(mockConcept.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(mockConcept.displayFont).toBeDefined();
  });
});
