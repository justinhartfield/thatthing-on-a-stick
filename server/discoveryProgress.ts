/**
 * Discovery Progress Tracking
 * 
 * Tracks user progress through the 5 discovery sections:
 * 1. Basics (name, industry, product/service)
 * 2. Business (model, revenue, differentiators)
 * 3. Market (audience, competitors, insights)
 * 4. Strategy (purpose, values, personality)
 * 5. Creative (aesthetics, touchpoints)
 */

export interface DiscoveryProgress {
  basics: number;      // 0-100
  business: number;    // 0-100
  market: number;      // 0-100
  strategy: number;    // 0-100
  creative: number;    // 0-100
}

const SECTION_KEYWORDS = {
  basics: ['name', 'industry', 'product', 'service', 'what do you', 'what does'],
  business: ['business model', 'revenue', 'monetize', 'differentiator', 'unique', 'competitive advantage'],
  market: ['target audience', 'customer', 'competitor', 'market', 'demographic', 'psychographic'],
  strategy: ['purpose', 'why', 'mission', 'values', 'personality', 'brand traits', 'stand for'],
  creative: ['aesthetic', 'visual', 'style', 'look and feel', 'touchpoint', 'channel', 'color', 'font']
};

/**
 * Analyze conversation to determine which section is being discussed
 */
export function detectCurrentSection(messages: any[]): keyof DiscoveryProgress | null {
  if (messages.length === 0) return 'basics';
  
  // Look at the last assistant message to see what they're asking about
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  if (!lastAssistantMessage) return 'basics';
  
  const content = lastAssistantMessage.content.toLowerCase();
  
  // Check each section's keywords
  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      return section as keyof DiscoveryProgress;
    }
  }
  
  return null;
}

/**
 * Calculate progress for a specific section based on message count
 */
export function calculateSectionProgress(messages: any[], section: keyof DiscoveryProgress): number {
  const sectionMessages = messages.filter(m => {
    const content = m.content.toLowerCase();
    return SECTION_KEYWORDS[section].some(keyword => content.includes(keyword));
  });
  
  // Estimate: 3-5 exchanges per section = 100% progress
  const exchanges = Math.floor(sectionMessages.length / 2); // User + AI = 1 exchange
  const progress = Math.min(100, (exchanges / 4) * 100);
  
  return Math.round(progress);
}

/**
 * Update progress based on current conversation
 */
export function updateDiscoveryProgress(
  messages: any[],
  currentProgress?: string | null
): DiscoveryProgress {
  const progress: DiscoveryProgress = currentProgress
    ? JSON.parse(currentProgress)
    : { basics: 0, business: 0, market: 0, strategy: 0, creative: 0 };
  
  // Detect current section and update its progress
  const currentSection = detectCurrentSection(messages);
  if (currentSection) {
    const sectionProgress = calculateSectionProgress(messages, currentSection);
    progress[currentSection] = Math.max(progress[currentSection], sectionProgress);
  }
  
  // Auto-complete previous sections if we've moved forward
  const sectionOrder: (keyof DiscoveryProgress)[] = ['basics', 'business', 'market', 'strategy', 'creative'];
  const currentIndex = currentSection ? sectionOrder.indexOf(currentSection) : 0;
  
  for (let i = 0; i < currentIndex; i++) {
    if (progress[sectionOrder[i]!] < 100) {
      progress[sectionOrder[i]!] = 100;
    }
  }
  
  return progress;
}

/**
 * Calculate overall progress percentage
 */
export function calculateOverallProgress(progress: DiscoveryProgress): number {
  const total = progress.basics + progress.business + progress.market + progress.strategy + progress.creative;
  return Math.round(total / 5);
}

/**
 * Get progress display data
 */
export function getProgressDisplay(progress: DiscoveryProgress) {
  return {
    overall: calculateOverallProgress(progress),
    sections: [
      { name: 'Basics', key: 'basics', progress: progress.basics },
      { name: 'Business', key: 'business', progress: progress.business },
      { name: 'Market', key: 'market', progress: progress.market },
      { name: 'Strategy', key: 'strategy', progress: progress.strategy },
      { name: 'Creative', key: 'creative', progress: progress.creative },
    ]
  };
}
