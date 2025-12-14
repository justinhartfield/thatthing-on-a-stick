import { invokeLLM } from "./_core/llm";
import { BrandProject, ChatMessage } from "../drizzle/schema";

export interface BrandStrategy {
  positioning: string;
  purposeStatement: string;
  targetAudience: string;
  personality: string[];
  values: string[];
  toneOfVoice: string;
  keyDifferentiators: string[];
}

/**
 * Synthesize a complete brand strategy from discovery conversation
 */
export async function synthesizeBrandStrategy(
  project: BrandProject,
  messages: ChatMessage[]
): Promise<BrandStrategy> {
  // Extract conversation content
  const conversationText = messages
    .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
    .join('\n\n');

  const systemPrompt = `You are a senior brand strategist. Analyze the following discovery conversation and synthesize a comprehensive brand strategy.

Use the ThatThing 4C framework:
1. **Consumer** - Deep understanding of target audience
2. **Commercialisation** - Business model and market positioning
3. **Concept** - Core brand idea and purpose
4. **Culture** - Values, personality, and cultural context

Return a structured JSON response with all strategic elements.`;

  const userPrompt = `Project: ${project.name}
Initial Concept: ${project.initialConcept}

Discovery Conversation:
${conversationText}

Based on this conversation, generate a complete brand strategy with:

1. **Positioning Statement** (1-2 sentences): How this brand is different from competitors and why it matters to the target audience. Must be concise, distinctive, and defensible.

2. **Brand Purpose** (1-2 sentences): Why the brand exists beyond making money. Should be authentic, inspiring, and aligned with audience values.

3. **Target Audience** (2-3 sentences): Clear definition of primary audience including demographics, psychographics, behaviors, and pain points.

4. **Personality Traits** (array of 4-5 adjectives): Core personality characteristics that define how the brand behaves and communicates.

5. **Core Values** (array of 3-4 values): Fundamental beliefs that guide brand decisions and actions.

6. **Tone of Voice** (1-2 sentences): How the brand speaks - formal/casual, playful/serious, technical/accessible, etc.

7. **Key Differentiators** (array of 3-4 points): Specific ways this brand stands apart from competitors.

Ensure all elements are cohesive and strategically aligned.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "brand_strategy",
        strict: true,
        schema: {
          type: "object",
          properties: {
            positioning: { type: "string" },
            purposeStatement: { type: "string" },
            targetAudience: { type: "string" },
            personality: {
              type: "array",
              items: { type: "string" }
            },
            values: {
              type: "array",
              items: { type: "string" }
            },
            toneOfVoice: { type: "string" },
            keyDifferentiators: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: [
            "positioning",
            "purposeStatement",
            "targetAudience",
            "personality",
            "values",
            "toneOfVoice",
            "keyDifferentiators"
          ],
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

  const strategy = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
  
  return strategy as BrandStrategy;
}

/**
 * Generate a conversational presentation of the strategy for user review
 */
export function formatStrategyPresentation(strategy: BrandStrategy): string {
  return `🎯 **Brand Strategy Complete!**

I've synthesized your discovery conversation into a comprehensive brand strategy. Here's what I've developed:

---

**🎪 Brand Positioning**
${strategy.positioning}

**💡 Brand Purpose**
${strategy.purposeStatement}

**👥 Target Audience**
${strategy.targetAudience}

**✨ Brand Personality**
${strategy.personality.map(p => `• ${p}`).join('\n')}

**🌟 Core Values**
${strategy.values.map(v => `• ${v}`).join('\n')}

**🗣️ Tone of Voice**
${strategy.toneOfVoice}

**🚀 Key Differentiators**
${strategy.keyDifferentiators.map(d => `• ${d}`).join('\n')}

---

Does this strategy accurately capture your brand vision? If you'd like me to refine any element, just let me know. Otherwise, reply "approve" and I'll move forward to generate 3 distinct creative concepts based on this strategy.`;
}

/**
 * Validate that discovery conversation has sufficient information
 */
export function isDiscoveryComplete(messages: ChatMessage[]): boolean {
  // Check for minimum conversation depth
  if (messages.length < 10) return false;

  const conversationText = messages.map(m => m.content).join(' ').toLowerCase();

  // Check for key topics coverage
  const requiredTopics = [
    ['audience', 'customer', 'user', 'target'],
    ['business', 'model', 'revenue', 'commercial'],
    ['purpose', 'why', 'mission', 'vision'],
    ['competitor', 'market', 'industry'],
    ['value', 'personality', 'tone']
  ];

  const coveredTopics = requiredTopics.filter(topics =>
    topics.some(topic => conversationText.includes(topic))
  );

  // Require at least 4 out of 5 topic areas covered
  return coveredTopics.length >= 4;
}
