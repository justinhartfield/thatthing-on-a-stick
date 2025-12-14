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
        return await db.createBrandProject({
          userId: ctx.user.id,
          name: input.name,
          initialConcept: input.initialConcept,
          currentPhase: "discovery",
        });
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
        
        // Generate AI response based on current phase
        let aiResponse = "";
        
        if (project.currentPhase === "discovery") {
          aiResponse = await generateDiscoveryResponse(messages, project);
          
          // Check if discovery is complete
          if (isDiscoveryComplete(messages) && input.content.toLowerCase().includes('complete')) {
            // Synthesize strategy
            const strategy = await synthesizeBrandStrategy(project, messages);
            
            // Save strategy to project
            await db.updateBrandProject(input.projectId, {
              strategyData: JSON.stringify(strategy),
              currentPhase: "strategy",
            });
            
            // Present strategy for review
            aiResponse = formatStrategyPresentation(strategy);
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

        // Save AI response
        const aiMessage = await db.createChatMessage({
          projectId: input.projectId,
          role: "assistant",
          content: aiResponse,
        });

        return aiMessage;
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

async function generateDiscoveryResponse(messages: any[], project: any): Promise<string> {
  const systemPrompt = `You are a brand strategist conducting a discovery interview. Ask thoughtful, probing questions to understand the user's brand vision. 

Current project: ${project.name}
Initial concept: ${project.initialConcept}

Guide the conversation through these sections:
1. Project Basics (name, industry, product/service)
2. Business Context (business model, revenue model, differentiators)
3. Market & Audience (target audience, competitors, market insights)
4. Strategic Intent (purpose, values, personality)
5. Creative Direction (aesthetic preferences, touchpoints)

Ask one question at a time. Be conversational and encouraging. When you have enough information for a section, acknowledge it and move to the next section. After all sections are complete, say "Discovery complete! Let me synthesize your brand strategy."`;

  const conversationHistory = messages.map(m => ({
    role: m.role as "user" | "assistant" | "system",
    content: String(m.content)
  }));

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      ...conversationHistory
    ]
  });

  const content = response.choices[0]!.message.content;
  return typeof content === 'string' ? content : JSON.stringify(content);
}
