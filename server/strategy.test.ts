import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';
import { synthesizeBrandStrategy, isDiscoveryComplete } from './strategySynthesis';
import type { ChatMessage } from '../drizzle/schema';

describe('Strategy Synthesis Engine', () => {
  let testUserId: number;
  let testProjectId: number;

  beforeAll(async () => {
    // Create test user
    await db.upsertUser({
      openId: 'test-strategy-user',
      name: 'Strategy Test User',
      email: 'strategy@test.com',
    });

    const user = await db.getUserByOpenId('test-strategy-user');
    if (!user) throw new Error('Test user not created');
    testUserId = user.id;

    // Create test project
    const project = await db.createBrandProject({
      userId: testUserId,
      name: 'EcoTech Innovations',
      initialConcept: 'A sustainable tech startup making eco-friendly smart home devices',
      currentPhase: 'discovery',
    });
    testProjectId = project.id;
  });

  it('should detect incomplete discovery conversations', async () => {
    const shortConversation: ChatMessage[] = [
      { id: 1, projectId: testProjectId, role: 'assistant', content: 'Tell me about your brand', createdAt: new Date() },
      { id: 2, projectId: testProjectId, role: 'user', content: 'We make smart home devices', createdAt: new Date() },
    ];

    const isComplete = isDiscoveryComplete(shortConversation);
    expect(isComplete).toBe(false);
  });

  it('should detect complete discovery conversations', async () => {
    const completeConversation: ChatMessage[] = [
      { id: 1, projectId: testProjectId, role: 'assistant', content: 'Tell me about your target audience', createdAt: new Date() },
      { id: 2, projectId: testProjectId, role: 'user', content: 'Our target audience is environmentally conscious millennials aged 25-40 who own homes', createdAt: new Date() },
      { id: 3, projectId: testProjectId, role: 'assistant', content: 'What is your business model?', createdAt: new Date() },
      { id: 4, projectId: testProjectId, role: 'user', content: 'We sell direct-to-consumer through our website with a subscription model for premium features', createdAt: new Date() },
      { id: 5, projectId: testProjectId, role: 'assistant', content: 'Why does your brand exist?', createdAt: new Date() },
      { id: 6, projectId: testProjectId, role: 'user', content: 'Our purpose is to make sustainable living effortless and accessible', createdAt: new Date() },
      { id: 7, projectId: testProjectId, role: 'assistant', content: 'Who are your main competitors?', createdAt: new Date() },
      { id: 8, projectId: testProjectId, role: 'user', content: 'Nest, Ecobee, and other smart home brands, but they don\'t focus on sustainability', createdAt: new Date() },
      { id: 9, projectId: testProjectId, role: 'assistant', content: 'What personality should your brand have?', createdAt: new Date() },
      { id: 10, projectId: testProjectId, role: 'user', content: 'Friendly, innovative, trustworthy, and optimistic', createdAt: new Date() },
      { id: 11, projectId: testProjectId, role: 'assistant', content: 'What are your core values?', createdAt: new Date() },
      { id: 12, projectId: testProjectId, role: 'user', content: 'Sustainability, innovation, transparency, and community', createdAt: new Date() },
    ];

    const isComplete = isDiscoveryComplete(completeConversation);
    expect(isComplete).toBe(true);
  });

  it.skip('should synthesize a complete brand strategy from discovery conversation', async () => {
    const project = await db.getBrandProjectById(testProjectId);
    if (!project) throw new Error('Project not found');

    const discoveryMessages: ChatMessage[] = [
      { id: 1, projectId: testProjectId, role: 'assistant', content: 'Tell me about your target audience', createdAt: new Date() },
      { id: 2, projectId: testProjectId, role: 'user', content: 'Our target audience is environmentally conscious millennials and Gen Z aged 25-40 who own or rent homes. They care deeply about climate change and want to reduce their carbon footprint but find it overwhelming. They value convenience and technology.', createdAt: new Date() },
      { id: 3, projectId: testProjectId, role: 'assistant', content: 'What is your business model and how do you make money?', createdAt: new Date() },
      { id: 4, projectId: testProjectId, role: 'user', content: 'We sell smart home devices direct-to-consumer through our website. Devices are priced competitively ($99-$299). We also offer a premium subscription ($9.99/month) for advanced analytics, automation, and carbon offset credits.', createdAt: new Date() },
      { id: 5, projectId: testProjectId, role: 'assistant', content: 'Why does your brand exist beyond making money?', createdAt: new Date() },
      { id: 6, projectId: testProjectId, role: 'user', content: 'Our purpose is to make sustainable living effortless and measurable. We believe technology should empower people to live in harmony with the planet, not at its expense.', createdAt: new Date() },
      { id: 7, projectId: testProjectId, role: 'assistant', content: 'Who are your main competitors and how are you different?', createdAt: new Date() },
      { id: 8, projectId: testProjectId, role: 'user', content: 'Competitors include Nest, Ecobee, and Ring. They focus on convenience and security but ignore environmental impact. We\'re the only smart home brand that measures and reduces your carbon footprint.', createdAt: new Date() },
      { id: 9, projectId: testProjectId, role: 'assistant', content: 'What personality traits should your brand embody?', createdAt: new Date() },
      { id: 10, projectId: testProjectId, role: 'user', content: 'Friendly, innovative, trustworthy, optimistic, and empowering. We want to inspire action without guilt or fear.', createdAt: new Date() },
      { id: 11, projectId: testProjectId, role: 'assistant', content: 'What are your core values?', createdAt: new Date() },
      { id: 12, projectId: testProjectId, role: 'user', content: 'Sustainability first, radical transparency, continuous innovation, and community empowerment.', createdAt: new Date() },
    ];

    const strategy = await synthesizeBrandStrategy(project, discoveryMessages);

    // Validate strategy structure
    expect(strategy).toBeDefined();
    expect(strategy.positioning).toBeDefined();
    expect(strategy.positioning.length).toBeGreaterThan(20);
    
    expect(strategy.purposeStatement).toBeDefined();
    expect(strategy.purposeStatement.length).toBeGreaterThan(20);
    
    expect(strategy.targetAudience).toBeDefined();
    expect(strategy.targetAudience.length).toBeGreaterThan(30);
    
    expect(strategy.personality).toBeDefined();
    expect(strategy.personality.length).toBeGreaterThanOrEqual(3);
    expect(strategy.personality.length).toBeLessThanOrEqual(6);
    
    expect(strategy.values).toBeDefined();
    expect(strategy.values.length).toBeGreaterThanOrEqual(3);
    expect(strategy.values.length).toBeLessThanOrEqual(5);
    
    expect(strategy.toneOfVoice).toBeDefined();
    expect(strategy.toneOfVoice.length).toBeGreaterThan(15);
    
    expect(strategy.keyDifferentiators).toBeDefined();
    expect(strategy.keyDifferentiators.length).toBeGreaterThanOrEqual(3);
    expect(strategy.keyDifferentiators.length).toBeLessThanOrEqual(5);

    console.log('Generated Strategy:', JSON.stringify(strategy, null, 2));
  }, 30000); // 30 second timeout for LLM call

  it('should save strategy to project', async () => {
    const project = await db.getBrandProjectById(testProjectId);
    if (!project) throw new Error('Project not found');

    const mockStrategy = {
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

    await db.updateBrandProject(testProjectId, {
      strategyData: JSON.stringify(mockStrategy),
      currentPhase: 'strategy',
    });

    const updated = await db.getBrandProjectById(testProjectId);
    expect(updated?.currentPhase).toBe('strategy');
    expect(updated?.strategyData).toBeDefined();
    
    const savedStrategy = JSON.parse(updated!.strategyData!);
    expect(savedStrategy.positioning).toBe(mockStrategy.positioning);
  });
});
