import { describe, it, expect, beforeAll } from 'vitest';
import * as db from '../server/db';

describe('Brand Project Operations', () => {
  let testUserId: number;
  let testProjectId: number;

  beforeAll(async () => {
    // Create a test user
    await db.upsertUser({
      openId: 'test-user-123',
      name: 'Test User',
      email: 'test@example.com',
    });

    const user = await db.getUserByOpenId('test-user-123');
    if (!user) throw new Error('Test user not created');
    testUserId = user.id;
  });

  it('should create a brand project', async () => {
    const project = await db.createBrandProject({
      userId: testUserId,
      name: 'Test Brand',
      initialConcept: 'A modern tech startup focused on AI-powered productivity tools',
      currentPhase: 'discovery',
    });

    expect(project).toBeDefined();
    expect(project.name).toBe('Test Brand');
    expect(project.currentPhase).toBe('discovery');
    
    testProjectId = project.id;
  });

  it('should retrieve a brand project by ID', async () => {
    const project = await db.getBrandProjectById(testProjectId);
    
    expect(project).toBeDefined();
    expect(project?.name).toBe('Test Brand');
    expect(project?.userId).toBe(testUserId);
  });

  it('should list all projects for a user', async () => {
    const projects = await db.getBrandProjectsByUserId(testUserId);
    
    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0].userId).toBe(testUserId);
  });

  it('should update a brand project phase', async () => {
    await db.updateBrandProject(testProjectId, {
      currentPhase: 'strategy',
    });

    const updated = await db.getBrandProjectById(testProjectId);
    expect(updated?.currentPhase).toBe('strategy');
  });

  it('should create and retrieve chat messages', async () => {
    const message = await db.createChatMessage({
      projectId: testProjectId,
      role: 'user',
      content: 'Tell me more about the target audience',
    });

    expect(message).toBeDefined();
    expect(message.content).toBe('Tell me more about the target audience');

    const messages = await db.getChatMessagesByProjectId(testProjectId);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].projectId).toBe(testProjectId);
  });

  it('should create brand concepts', async () => {
    const concept = await db.createBrandConcept({
      projectId: testProjectId,
      name: 'Neon Future',
      description: 'A bold, futuristic brand identity with neon accents',
      primaryColor: '#00FF88',
      secondaryColor: '#FF0088',
      accentColor: '#8800FF',
      displayFont: 'Clash Display',
      bodyFont: 'Satoshi',
      visualStyle: 'Bold',
      tagline: 'The future is now',
      toneOfVoice: 'Confident and forward-thinking',
    });

    expect(concept).toBeDefined();
    expect(concept.name).toBe('Neon Future');
    expect(concept.primaryColor).toBe('#00FF88');
  });

  it('should retrieve concepts for a project', async () => {
    const concepts = await db.getBrandConceptsByProjectId(testProjectId);
    
    expect(concepts.length).toBeGreaterThan(0);
    expect(concepts[0].projectId).toBe(testProjectId);
  });

  it('should delete a brand project and related data', async () => {
    await db.deleteBrandProject(testProjectId);
    
    const deleted = await db.getBrandProjectById(testProjectId);
    expect(deleted).toBeUndefined();

    // Verify related data is also deleted
    const messages = await db.getChatMessagesByProjectId(testProjectId);
    expect(messages.length).toBe(0);

    const concepts = await db.getBrandConceptsByProjectId(testProjectId);
    expect(concepts.length).toBe(0);
  });
});
