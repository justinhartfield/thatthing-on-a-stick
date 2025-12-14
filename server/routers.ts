import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { synthesizeBrandStrategy, formatStrategyPresentation, isDiscoveryComplete } from "./strategySynthesis";
import { generateCompleteConceptsWithImages, formatConceptsPresentation } from "./conceptGeneration";
import { generateToolkitMarkdown, formatToolkitPresentation } from "./toolkitGeneration";
import { updateDiscoveryProgress } from "./discoveryProgress";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Brand Project Management
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getBrandProjectsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        initialConcept: z.string().min(10),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.createBrandProject({
          userId: ctx.user.id,
          name: input.name,
          initialConcept: input.initialConcept,
          currentPhase: "discovery",
          discoveryProgress: JSON.stringify({ basics: 0, business: 0, market: 0, strategy: 0, creative: 0 }),
        });
        return project;
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getBrandProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return project;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getBrandProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        await db.deleteBrandProject(input.id);
        return { success: true };
      }),

    updatePhase: protectedProcedure
      .input(z.object({
        id: z.number(),
        phase: z.enum(["discovery", "strategy", "concepts", "refinement", "toolkit", "completed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getBrandProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        await db.updateBrandProject(input.id, { currentPhase: input.phase });
        return { success: true };
      }),
  }),

  // Chat Messages
  chat: router({
    getMessages: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getBrandProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return await db.getChatMessagesByProjectId(input.projectId);
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getBrandProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        // Save user message
        await db.createChatMessage({
          projectId: input.projectId,
          role: "user",
          content: input.content,
        });

        // Get conversation history
        const messages = await db.getChatMessagesByProjectId(input.projectId);

        // Update discovery progress if in discovery phase
        if (project.currentPhase === "discovery") {
          // Initialize progress if it doesn't exist
          const currentProgress = project.discoveryProgress || JSON.stringify({ basics: 0, business: 0, market: 0, strategy: 0, creative: 0 });
          const updatedProgress = updateDiscoveryProgress(messages, currentProgress);
          await db.updateBrandProject(input.projectId, {
            discoveryProgress: JSON.stringify(updatedProgress)
          });
        }

        // Generate AI response based on current phase
        let aiResponse = "";
        let answerChoices: string[] | undefined;

        if (project.currentPhase === "discovery") {
          console.log('[DEBUG] About to call generateDiscoveryResponse');
          const discoveryResult = await generateDiscoveryResponse(messages, project);
          console.log('[DEBUG] generateDiscoveryResponse returned:', discoveryResult);

          if (!discoveryResult || !discoveryResult.response) {
            console.error('[DEBUG] Invalid discovery result:', discoveryResult);
            throw new Error('Invalid response from discovery engine');
          }

          aiResponse = discoveryResult.response;
          answerChoices = discoveryResult.answerChoices;
          console.log('[DEBUG] aiResponse set to:', aiResponse.substring(0, 100));
          console.log('[DEBUG] Answer choices generated:', answerChoices);

          console.log('[DEBUG] Checking if discovery is complete...');
          // Check if discovery is complete (automatically after sufficient conversation)
          if (isDiscoveryComplete(messages)) {
            console.log('[DEBUG] Discovery is complete! Synthesizing strategy...');
            // Synthesize strategy
            const strategy = await synthesizeBrandStrategy(project, messages);

            // Save strategy to project
            await db.updateBrandProject(input.projectId, {
              strategyData: JSON.stringify(strategy),
              currentPhase: "strategy",
            });

            // Present strategy for review
            aiResponse = "🎉 Discovery complete! I've synthesized your insights into a comprehensive brand strategy.\n\n" + formatStrategyPresentation(strategy) + "\n\nPlease review the strategy above. Reply with 'approve' to proceed to creative concepts, or let me know if you'd like to refine any element.";
          }
        } else if (project.currentPhase === "strategy") {
          // Handle strategy approval/refinement
          if (input.content.toLowerCase().includes('approve')) {
            aiResponse = "Perfect! I'll now generate 3 distinct creative concepts for your brand. This will take a few moments...";

            // Generate concepts
            const strategy = JSON.parse(project.strategyData!);
            const concepts = await generateCompleteConceptsWithImages(project, strategy);

            // Save concepts to database
            for (const concept of concepts) {
              await db.createBrandConcept({
                projectId: input.projectId,
                ...concept,
              });
            }

            // Update project phase
            await db.updateBrandProject(input.projectId, {
              currentPhase: "concepts",
            });

            // Present concepts
            aiResponse = formatConceptsPresentation(concepts);
          } else {
            aiResponse = "I can help refine the strategy. Which element would you like me to adjust? (positioning, purpose, audience, personality, values, tone, or differentiators)";
          }
        } else if (project.currentPhase === "concepts") {
          // Handle concept selection
          const conceptNumber = parseInt(input.content);
          if (conceptNumber >= 1 && conceptNumber <= 3) {
            const concepts = await db.getBrandConceptsByProjectId(input.projectId);
            const selectedConcept = concepts[conceptNumber - 1];

            if (selectedConcept) {
              await db.updateBrandProject(input.projectId, {
                selectedConceptId: selectedConcept.id,
                currentPhase: "refinement",
              });

              aiResponse = `Excellent choice! **${selectedConcept.name}** is a strong direction.\n\nNow let's refine this concept. Would you like to:\n1. Adjust the color palette\n2. Change typography\n3. Refine the tagline\n4. Proceed to generate the final Brand Toolkit\n\nReply with your choice or type "generate toolkit" to proceed.`;
            } else {
              aiResponse = "I couldn't find that concept. Please select 1, 2, or 3.";
            }
          } else {
            aiResponse = "Please select a concept by replying with 1, 2, or 3.";
          }
        } else if (project.currentPhase === "refinement") {
          if (input.content.toLowerCase().includes('generate toolkit') || input.content.toLowerCase().includes('proceed')) {
            // Generate toolkit
            const strategy = JSON.parse(project.strategyData!);
            const selectedConcept = await db.getBrandConceptById(project.selectedConceptId!);

            if (!selectedConcept) {
              throw new Error('Selected concept not found');
            }

            const toolkitMarkdown = generateToolkitMarkdown({
              projectName: project.name,
              strategy,
              concept: selectedConcept,
              generatedAt: new Date(),
            });

            // Save toolkit markdown to project (we'll store it in toolkitPdfUrl for now as text)
            await db.updateBrandProject(input.projectId, {
              toolkitPdfUrl: toolkitMarkdown,
              currentPhase: "completed",
            });

            aiResponse = formatToolkitPresentation(project);
          } else {
            aiResponse = "I can help refine that element. What specific changes would you like to make?";
          }
        } else if (project.currentPhase === "completed") {
          aiResponse = "Your brand toolkit is complete! You can download it anytime. Is there anything else you'd like to refine or any questions about implementing your brand?";
        } else {
          aiResponse = "I'm processing your request...";
        }

        console.log('[DEBUG] About to save AI response:', aiResponse.substring(0, 100));
        // Save AI response
        const aiMessage = await db.createChatMessage({
          projectId: input.projectId,
          role: "assistant",
          content: aiResponse,
          answerChoices: answerChoices ? JSON.stringify(answerChoices) : null,
        });

        console.log('[DEBUG] Mutation complete, returning success');
        return {
          success: true,
          message: aiMessage
        };
      }),
  }),

  // Brand Concepts
  concepts: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getBrandProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return await db.getBrandConceptsByProjectId(input.projectId);
      }),

    select: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        conceptId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getBrandProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        await db.updateBrandProject(input.projectId, {
          selectedConceptId: input.conceptId,
          currentPhase: "refinement",
        });

        return { success: true };
      }),
  }),

  // Brand Toolkit
  toolkit: router({
    getToolkit: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getBrandProjectById(input.projectId);

        if (!project) {
          throw new Error('Project not found');
        }

        if (project.userId !== ctx.user.id) {
          throw new Error('Unauthorized');
        }

        if (!project.toolkitPdfUrl) {
          throw new Error('Toolkit not yet generated');
        }

        return {
          markdown: project.toolkitPdfUrl,
          projectName: project.name,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;


// Helper functions for AI responses

async function generateDiscoveryResponse(messages: any[], project: any): Promise<{ response: string; answerChoices?: string[] }> {
  console.log('[DEBUG] generateDiscoveryResponse called for project:', project.name);

  const systemPrompt = `You are a brand strategist conducting a discovery interview. Ask thoughtful, probing questions to understand the user's brand vision. 

Current project: ${project.name}
Initial concept: ${project.initialConcept}

Guide the conversation through these sections:
1. Project Basics (name, industry, product/service)
2. Business Context (business model, revenue model, differentiators)
3. Market & Audience (target audience, competitors, market insights)
4. Strategic Intent (purpose, values, personality)
5. Creative Direction (aesthetic preferences, touchpoints)

IMPORTANT: Ask ONE clear, direct question at a time. Do NOT provide suggested answers or examples in your response. Be conversational and encouraging. When you have enough information for a section, acknowledge it and move to the next section. After all sections are complete, say "Discovery complete! Let me synthesize your brand strategy."`;

  const conversationHistory = messages.map(m => ({
    role: m.role as "user" | "assistant" | "system",
    content: String(m.content)
  }));

  console.log('[DEBUG] Calling main LLM for discovery question...');

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory
      ]
    });

    console.log('[DEBUG] LLM response received:', JSON.stringify(response).substring(0, 200));

    if (!response || !response.choices || response.choices.length === 0) {
      console.error('[LLM Discovery] Empty response from LLM. Response object:', JSON.stringify(response));
      throw new Error('No response from LLM - the API returned an empty or invalid response. Please try again.');
    }

    const content = response.choices[0]!.message.content;
    if (!content) {
      console.error('[DEBUG] Empty content in LLM response');
      throw new Error('Empty response from LLM');
    }

    const question = typeof content === 'string' ? content : JSON.stringify(content);
    console.log('[DEBUG] Question extracted:', question.substring(0, 100));

    // If this is a question (not a completion message), generate answer choices
    if (!question.toLowerCase().includes('discovery complete') && !question.toLowerCase().includes('let me synthesize')) {
      try {
        const choicesPrompt = `For the brand "${project.name}" (${project.initialConcept}), generate 3 distinct, realistic answer options for this question:\n\n"${question}"\n\nEach answer should be:
- Specific and actionable (not vague)
- Different from the others (covering different angles)
- Realistic for this brand context
- 1-2 sentences maximum\n\nReturn ONLY the 3 answer choices, nothing else.`;

        const choicesResponse = await invokeLLM({
          messages: [
            { role: 'system', content: 'You generate multiple choice answers for brand discovery questions. Provide 3 distinct, relevant options.' },
            { role: 'user', content: choicesPrompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "answer_choices",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  choices: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ["choices"],
                additionalProperties: false
              }
            }
          }
        });

        if (choicesResponse && choicesResponse.choices && choicesResponse.choices.length > 0) {
          const choicesContent = choicesResponse.choices[0]!.message.content;
          console.log('[DEBUG] Choices response content:', choicesContent);
          if (choicesContent) {
            try {
              const parsed = JSON.parse(typeof choicesContent === 'string' ? choicesContent : JSON.stringify(choicesContent));
              console.log('[DEBUG] Parsed choices:', parsed.choices);
              if (parsed.choices && Array.isArray(parsed.choices) && parsed.choices.length === 3) {
                return {
                  response: question,
                  answerChoices: parsed.choices
                };
              }
            } catch (parseError) {
              console.error('[DEBUG] Failed to parse choices:', parseError);
            }
          }
        }
      } catch (error) {
        console.error('[DEBUG] Failed to generate answer choices:', error);
        // Fall through to return question without choices
      }
    }

    // Always return the question, even if choices generation failed
    console.log('[DEBUG] Returning question without choices');
    return { response: question };
  } catch (error) {
    console.error('[DEBUG] Fatal error in generateDiscoveryResponse:', error);
    throw error;
  }
}

