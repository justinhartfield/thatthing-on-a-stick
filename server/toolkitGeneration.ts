import { BrandProject, BrandConcept } from "../drizzle/schema";
import { BrandStrategy } from "./strategySynthesis";

export interface BrandToolkit {
  projectName: string;
  strategy: BrandStrategy;
  concept: BrandConcept;
  generatedAt: Date;
}

/**
 * Generate comprehensive brand toolkit markdown content
 */
export function generateToolkitMarkdown(toolkit: BrandToolkit): string {
  const { projectName, strategy, concept } = toolkit;

  return `# ${projectName}
## Brand Toolkit

**Generated:** ${toolkit.generatedAt.toLocaleDateString()}

---

# Table of Contents

1. [Brand Strategy](#brand-strategy)
2. [Visual Identity](#visual-identity)
3. [Color Palette](#color-palette)
4. [Typography](#typography)
5. [Brand Voice](#brand-voice)
6. [Usage Guidelines](#usage-guidelines)

---

# Brand Strategy

## Brand Positioning

${strategy.positioning}

## Brand Purpose

${strategy.purposeStatement}

## Target Audience

${strategy.targetAudience}

## Brand Personality

${strategy.personality.map(p => `- **${p}**`).join('\n')}

## Core Values

${strategy.values.map(v => `- **${v}**`).join('\n')}

## Tone of Voice

${strategy.toneOfVoice}

## Key Differentiators

${strategy.keyDifferentiators.map((d, i) => `${i + 1}. ${d}`).join('\n')}

---

# Visual Identity

## Concept: ${concept.name}

${concept.description}

**Visual Style:** ${concept.visualStyle}

**Tagline:** *"${concept.tagline}"*

---

# Color Palette

## Primary Color
**${concept.primaryColor}**

Use for: Main brand elements, primary CTAs, headers

## Secondary Color
**${concept.secondaryColor}**

Use for: Supporting elements, backgrounds, secondary buttons

## Accent Color
**${concept.accentColor}**

Use for: Highlights, important information, interactive elements

---

# Typography

## Display Font
**${concept.displayFont}**

Use for: Headlines, logos, large text

## Body Font
**${concept.bodyFont}**

Use for: Body copy, descriptions, UI text

---

# Brand Voice

## Tone of Voice
${concept.toneOfVoice}

## Communication Principles

Based on our brand personality (${strategy.personality.join(', ')}), all communications should:

1. **Be Authentic** - Reflect our core values: ${strategy.values.join(', ')}
2. **Stay Consistent** - Maintain our positioning: ${strategy.positioning}
3. **Serve Our Purpose** - ${strategy.purposeStatement}

---

# Usage Guidelines

## Do's
- Use the approved color palette consistently
- Maintain proper spacing and hierarchy
- Follow typography guidelines
- Align all communications with brand values

## Don'ts
- Don't alter the color palette
- Don't use unauthorized fonts
- Don't contradict brand positioning
- Don't compromise on brand values

---

# Brand Applications

This toolkit provides the foundation for all brand touchpoints:

- Website & Digital Platforms
- Marketing Materials
- Social Media
- Product Packaging
- Internal Communications
- Customer Support

---

**© ${new Date().getFullYear()} ${projectName}. All rights reserved.**
`;
}

/**
 * Generate toolkit presentation message for chat
 */
export function formatToolkitPresentation(project: BrandProject): string {
  return `🎉 **Your Brand Toolkit is Complete!**

I've assembled a comprehensive Brand Style Guide for **${project.name}** that includes:

✅ **Brand Strategy**
- Positioning statement
- Brand purpose
- Target audience definition
- Personality traits & values
- Tone of voice guidelines

✅ **Visual Identity System**
- Complete color palette
- Typography specifications
- Visual style guidelines
- Tagline and messaging

✅ **Usage Guidelines**
- Do's and don'ts
- Application examples
- Brand voice principles

Your toolkit is ready to download. You can now use this guide to maintain brand consistency across all touchpoints!

Type "download toolkit" to get your PDF, or ask me any questions about implementing your brand.`;
}
